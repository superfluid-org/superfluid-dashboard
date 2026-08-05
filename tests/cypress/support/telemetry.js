// ---------------------------------------------------------------------------
// Failure telemetry ("what was still pending?")
//
// Why this exists: specs have been failing with pages stuck on loading
// skeletons (Common.waitForSpookySkeletonsToDisapear) and with lists that
// render but never populate. Those failures look identical whether a request
// was never issued, was issued and never settled, errored, or returned 200
// with an unexpected shape. This module records enough per test to tell those
// apart, and dumps it to a file when (and only when) a test fails.
//
// Design constraints:
//   * PASSIVE. It deliberately does NOT use a catch-all `cy.intercept`.
//     The suite registers many `cy.intercept`s from page objects
//     (ActivityPage.mockActivityRequestTo, Common.mockQueryToEmptyState,
//     Common.mockRecentsToKnownReceiver, VestingPage, ExportPage, ...), several
//     of which use `req.continue(res => ...)` to rewrite response bodies.
//     Adding another matching route would insert this module into that
//     handler chain, where a mistake in ordering, a missing `req.continue()`
//     or the intercept response timeout could break or slow down real mocks.
//     Instead we patch `fetch` / `XMLHttpRequest` on the application window via
//     the `window:before:load` event, which sits strictly below the Cypress
//     proxy: intercepts, stubs and aliases behave exactly as before, and the
//     observed status/duration are what the app actually saw.
//   * CHEAP. Only metadata is kept (method, url, status, timing) — never
//     request or response bodies — with hard caps on every collection, and a
//     file is written only for failed tests.
//   * NEVER FAILS A TEST. Everything is wrapped in try/catch; the node task
//     swallows its own errors and the write is best-effort.
// ---------------------------------------------------------------------------

const MAX_TRACKED_REQUESTS = 4000; // stop recording new requests past this
const MAX_PENDING_DUMPED = 200;
const MAX_COMPLETED_DUMPED = 100;
const MAX_CONSOLE_ENTRIES = 200;
const MAX_STRING = 400;

let state = emptyState();

function emptyState() {
  return {
    startedAt: Date.now(),
    seq: 0,
    dropped: 0,
    requests: new Map(), // id -> record
    consoleEntries: [],
    exceptions: [],
  };
}

function truncate(value) {
  const str = typeof value === 'string' ? value : safeStringify(value);
  return str.length > MAX_STRING ? `${str.slice(0, MAX_STRING)}…` : str;
}

function safeStringify(value) {
  try {
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    return String(value);
  } catch (e) {
    return '[unserializable]';
  }
}

function originOf(url) {
  try {
    return new URL(url, RELATIVE_BASE).origin;
  } catch (e) {
    return 'unknown';
  }
}

const RELATIVE_BASE = 'http://relative.invalid';
// Plain word, no punctuation: URLSearchParams percent-encodes its values, and
// `%3Credacted%3E` in an artifact is needlessly hard to read.
const REDACTED = 'REDACTED';

// Telemetry reports are uploaded as CI artifacts, which are far more widely
// readable than the secrets the suite runs with (the wallet private keys come
// straight off `Cypress.env`, and app requests carry RPC/API keys in their query
// strings). Origin and path are the diagnostic signal — "which endpoint never
// settled" — and query VALUES essentially never are, so anything whose parameter
// name looks credential-ish, or whose value looks like a key regardless of its
// name, is replaced. Nothing here is a substitute for not putting secrets in
// URLs; it is a second line of defence on an artifact that leaves the runner.
const SENSITIVE_PARAM_NAME =
  /(?:key|token|secret|password|passwd|pwd|auth|signature|^sig$|credential|session|bearer|jwt|private|apikey|access)/i;
const SECRET_LOOKING_VALUE =
  // 0x-prefixed 32-byte value (private key / raw signature material),
  // a JWT, or any long opaque high-entropy blob.
  /^(?:0x[0-9a-fA-F]{64,}|ey[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\..*|[A-Za-z0-9_-]{40,})$/;

function redactParams(params) {
  let changed = false;
  const keys = [];
  params.forEach((_value, key) => keys.push(key));
  keys.forEach((key) => {
    const value = params.get(key);
    if (SENSITIVE_PARAM_NAME.test(key) || SECRET_LOOKING_VALUE.test(value)) {
      params.set(key, REDACTED);
      changed = true;
    }
  });
  return changed;
}

/** Keep the origin and the path; drop anything in the query that looks secret. */
function redactUrl(url) {
  const raw = typeof url === 'string' ? url : String(url || '');
  if (!raw) return raw;
  try {
    const parsed = new URL(raw, RELATIVE_BASE);
    redactParams(parsed.searchParams);
    // A fragment can carry the same junk (and is never sent to the server, so it
    // has no diagnostic value beyond routing); redact it whenever it looks like
    // a parameter list.
    if (parsed.hash.indexOf('=') !== -1) {
      const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      redactParams(hashParams);
      parsed.hash = `#${hashParams.toString()}`;
    }
    const rebuilt = parsed.toString();
    return parsed.origin === RELATIVE_BASE && raw.indexOf(RELATIVE_BASE) !== 0
      ? rebuilt.slice(RELATIVE_BASE.length)
      : rebuilt;
  } catch (e) {
    // Unparseable: keep everything before the query, drop the rest wholesale
    // rather than risk emitting a secret we could not inspect.
    const queryStart = raw.indexOf('?');
    return queryStart === -1 ? raw : `${raw.slice(0, queryStart)}?${REDACTED}`;
  }
}

function record(type, method, url) {
  if (state.requests.size >= MAX_TRACKED_REQUESTS) {
    state.dropped += 1;
    return null;
  }
  const entry = {
    id: (state.seq += 1),
    type,
    method: (method || 'GET').toUpperCase(),
    url: truncate(redactUrl(url)),
    origin: originOf(url),
    startedAtMs: Date.now() - state.startedAt,
    endedAtMs: null,
    durationMs: null,
    status: null,
    outcome: 'pending', // pending | completed | network-error | aborted
    error: null,
  };
  state.requests.set(entry.id, entry);
  return entry;
}

function settle(entry, patch) {
  if (!entry) return;
  try {
    entry.endedAtMs = Date.now() - state.startedAt;
    entry.durationMs = entry.endedAtMs - entry.startedAtMs;
    Object.assign(entry, patch);
  } catch (e) {
    /* never let telemetry throw */
  }
}

function instrumentConsole(win) {
  ['error', 'warn'].forEach((level) => {
    const original = win.console && win.console[level];
    if (typeof original !== 'function') return;
    win.console[level] = function (...args) {
      try {
        if (state.consoleEntries.length < MAX_CONSOLE_ENTRIES) {
          state.consoleEntries.push({
            level,
            atMs: Date.now() - state.startedAt,
            message: args.map(truncate).join(' '),
          });
        }
      } catch (e) {
        /* ignore */
      }
      return original.apply(this, args);
    };
  });
}

function instrumentFetch(win) {
  const originalFetch = win.fetch;
  if (typeof originalFetch !== 'function') return;
  win.fetch = function (input, init) {
    let entry = null;
    try {
      const url =
        typeof input === 'string'
          ? input
          : (input && (input.url || String(input))) || '';
      const method = (init && init.method) || (input && input.method) || 'GET';
      entry = record('fetch', method, url);
    } catch (e) {
      /* ignore */
    }
    let promise;
    try {
      promise = originalFetch.apply(win, arguments);
    } catch (e) {
      settle(entry, { outcome: 'network-error', error: truncate(e) });
      throw e;
    }
    try {
      return promise.then(
        (response) => {
          settle(entry, {
            outcome: 'completed',
            status: response && response.status,
          });
          return response;
        },
        (error) => {
          settle(entry, { outcome: 'network-error', error: truncate(error) });
          throw error;
        }
      );
    } catch (e) {
      return promise;
    }
  };
}

function instrumentXhr(win) {
  const XHR = win.XMLHttpRequest;
  if (!XHR || !XHR.prototype) return;
  const originalOpen = XHR.prototype.open;
  const originalSend = XHR.prototype.send;
  if (typeof originalOpen !== 'function' || typeof originalSend !== 'function')
    return;

  XHR.prototype.open = function (method, url) {
    try {
      this.__sfTelemetry = { method, url };
    } catch (e) {
      /* ignore */
    }
    return originalOpen.apply(this, arguments);
  };

  XHR.prototype.send = function () {
    let entry = null;
    try {
      const meta = this.__sfTelemetry || {};
      entry = record('xhr', meta.method, meta.url || '');
      const xhr = this;
      const finish = (outcome) => {
        settle(entry, {
          outcome,
          status: (() => {
            try {
              return xhr.status;
            } catch (e) {
              return null;
            }
          })(),
        });
      };
      this.addEventListener('load', () => finish('completed'));
      this.addEventListener('error', () => finish('network-error'));
      this.addEventListener('abort', () => finish('aborted'));
      this.addEventListener('timeout', () =>
        settle(entry, { outcome: 'network-error', error: 'timeout' })
      );
    } catch (e) {
      /* ignore */
    }
    return originalSend.apply(this, arguments);
  };
}

// `window:before:load` runs for every application window (each cy.visit and
// every in-app full page load), before any app code executes, and is entirely
// independent of the cy.intercept routing table.
Cypress.on('window:before:load', (win) => {
  try {
    instrumentConsole(win);
    instrumentFetch(win);
    instrumentXhr(win);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[telemetry] failed to instrument window', e);
  }
});

/** Called from the existing uncaught:exception / fail handlers in e2e.js. */
export function recordException(kind, err) {
  try {
    if (state.exceptions.length >= MAX_CONSOLE_ENTRIES) return;
    state.exceptions.push({
      kind,
      atMs: Date.now() - state.startedAt,
      name: err && err.name,
      message: truncate((err && err.message) || err),
    });
  } catch (e) {
    /* ignore */
  }
}

function buildReport(test) {
  const all = Array.from(state.requests.values());
  const pending = all.filter((r) => r.outcome === 'pending');
  const failedOrOdd = all.filter(
    (r) =>
      r.outcome === 'network-error' ||
      r.outcome === 'aborted' ||
      (typeof r.status === 'number' && (r.status === 0 || r.status >= 400))
  );
  const completed = all
    .filter((r) => r.outcome === 'completed')
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0));

  const byOrigin = {};
  all.forEach((r) => {
    const bucket = (byOrigin[r.origin] = byOrigin[r.origin] || {
      total: 0,
      pending: 0,
      errored: 0,
    });
    bucket.total += 1;
    if (r.outcome === 'pending') bucket.pending += 1;
    if (r.outcome === 'network-error' || r.outcome === 'aborted')
      bucket.errored += 1;
  });

  return {
    schema: 'sf-cypress-telemetry/1',
    spec: Cypress.spec && Cypress.spec.relative,
    test: test && test.fullTitle && test.fullTitle(),
    testState: test && test.state,
    retryAttempt: test && test.currentRetry && test.currentRetry(),
    baseUrl: redactUrl(Cypress.config('baseUrl') || ''),
    network: Cypress.env('network') || null,
    recordedAt: new Date().toISOString(),
    durationOfTestMs: Date.now() - state.startedAt,
    error: test && test.err ? truncate(test.err.message) : null,
    counts: {
      total: all.length,
      pending: pending.length,
      completed: completed.length,
      erroredOrNon2xx: failedOrOdd.length,
      droppedFromRecording: state.dropped,
    },
    byOrigin,
    // THE signal: issued but never settled by the time the test blew up.
    pendingRequests: pending.slice(0, MAX_PENDING_DUMPED),
    erroredOrNon2xxRequests: failedOrOdd.slice(0, MAX_PENDING_DUMPED),
    slowestCompletedRequests: completed.slice(0, MAX_COMPLETED_DUMPED),
    consoleEntries: state.consoleEntries,
    exceptions: state.exceptions,
  };
}

beforeEach(() => {
  state = emptyState();
});

afterEach(function () {
  let report = null;
  try {
    const test = this.currentTest;
    if (!test || test.state !== 'failed') return;
    report = buildReport(test);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[telemetry] failed to build report', e);
    return;
  }
  // The node task is defensive and always resolves; `cy.task` failing here
  // would only ever add noise to an already-failed test.
  cy.task('recordFailureTelemetry', report, { log: false });
});
