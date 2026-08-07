import type { NextApiRequest, NextApiResponse } from "next";
import {
  ZerionChartPeriod,
  ZerionPortfolioPosition,
  ZerionPortfolioRequest,
  ZerionPortfolioResponse,
  ZerionRateLimit,
} from "../../features/portfolio/zerionPortfolio";

const ZERION_API_URL = "https://api.zerion.io/v1";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RATE_LIMIT_RETRIES = 2;
const ALLOWED_CHART_PERIODS = new Set<ZerionChartPeriod>([
  "day",
  "week",
  "month",
  "3months",
  "6months",
  "year",
]);

export const config = {
  maxDuration: 60,
};

interface ZerionErrorBody {
  errors?: Array<{ title?: string; detail?: string }>;
}

interface ZerionPortfolioBody {
  data?: {
    attributes?: {
      positions_distribution_by_type?: Record<string, number>;
      positions_distribution_by_chain?: Record<string, number>;
      total?: { positions?: number };
      changes?: {
        absolute_1d?: number | null;
        percent_1d?: number | null;
      };
    };
  };
}

interface ZerionPositionBody {
  data?: Array<{
    id: string;
    attributes?: {
      name?: string | null;
      quantity?: {
        int?: string;
        decimals?: number;
        float?: number;
        numeric?: string;
      };
      protocol?: string | null;
      protocol_module?: string | null;
      group_id?: string | null;
      position_type?: string | null;
      value?: number | null;
      price?: number | null;
      changes?: {
        absolute_1d?: number | null;
        percent_1d?: number | null;
      };
      fungible_info?: {
        name?: string | null;
        symbol?: string | null;
        icon?: { url?: string | null } | null;
        flags?: { verified?: boolean };
        implementations?: Array<{
          chain_id?: string;
          decimals?: number;
          address?: string | null;
        }>;
      };
      application_metadata?: {
        name?: string | null;
        icon?: { url?: string | null } | null;
      } | null;
    };
    relationships?: {
      chain?: { data?: { id?: string } };
      dapp?: { data?: { id?: string } | null };
    };
  }>;
}

interface ZerionChartBody {
  data?: {
    attributes?: {
      points?: Array<[number, number]>;
    };
  };
}

class ZerionRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfter?: string
  ) {
    super(message);
  }
}

const optionalFiniteNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const readRateLimit = (headers: Headers): ZerionRateLimit | undefined => {
  const read = (...names: string[]): number | undefined => {
    const value = names.map((name) => headers.get(name)).find(Boolean);
    if (value === undefined || value === null) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const limit = {
    remainingSecond: read(
      "ratelimit-org-second-remaining",
      "x-ratelimit-remaining-second",
      "x-ratelimit-remaining-secondly"
    ),
    remainingDay: read(
      "ratelimit-org-day-remaining",
      "x-ratelimit-remaining-day"
    ),
    remainingMonth: read(
      "ratelimit-org-month-remaining",
      "x-ratelimit-remaining-month"
    ),
  };

  return Object.values(limit).some((value) => value !== undefined)
    ? limit
    : undefined;
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const retryDelayMs = (headers: Headers): number => {
  const reset =
    headers.get("ratelimit-org-second-reset") ??
    headers.get("retry-after") ??
    "1";
  const seconds = Number(reset);
  return Number.isFinite(seconds)
    ? Math.min(Math.max(seconds * 1_000, 250), 5_000)
    : 1_000;
};

const getErrorMessage = (body: unknown, status: number): string => {
  const errorBody = body as ZerionErrorBody;
  const firstError = errorBody.errors?.[0];
  return (
    firstError?.detail || firstError?.title || `Zerion responded with ${status}`
  );
};

const fetchZerion = async <T>({
  path,
  apiKey,
}: {
  path: string;
  apiKey: string;
}): Promise<{
  body: T;
  rateLimit?: ZerionRateLimit;
  nextRequestDelayMs?: number;
}> => {
  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    const response = await fetch(`${ZERION_API_URL}${path}`, {
      headers: {
        accept: "application/json",
        authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    if (response.ok) {
      const rateLimit = readRateLimit(response.headers);
      return {
        body: body as T,
        rateLimit,
        nextRequestDelayMs:
          rateLimit?.remainingSecond === 0
            ? retryDelayMs(response.headers)
            : undefined,
      };
    }

    const rateLimit = readRateLimit(response.headers);
    const quotaExhausted =
      rateLimit?.remainingDay === 0 || rateLimit?.remainingMonth === 0;
    if (
      response.status === 429 &&
      !quotaExhausted &&
      attempt < MAX_RATE_LIMIT_RETRIES
    ) {
      await wait(retryDelayMs(response.headers));
      continue;
    }

    throw new ZerionRequestError(
      getErrorMessage(body, response.status),
      response.status,
      response.headers.get("retry-after") ??
        response.headers.get("ratelimit-org-second-reset") ??
        undefined
    );
  }

  throw new ZerionRequestError("Zerion request retry limit reached", 429);
};

const mapPosition = (
  position: NonNullable<ZerionPositionBody["data"]>[number]
): ZerionPortfolioPosition => {
  const attributes = position.attributes ?? {};
  const info = attributes.fungible_info ?? {};
  const chainId = position.relationships?.chain?.data?.id ?? "unknown";
  const implementation = info.implementations?.find(
    ({ chain_id }) => chain_id === chainId
  );
  const quantity = attributes.quantity;

  return {
    id: position.id,
    chainId,
    tokenAddress: implementation?.address ?? undefined,
    name: info.name || attributes.name || "Unknown asset",
    symbol: info.symbol || "—",
    iconUrl: info.icon?.url ?? undefined,
    quantity:
      quantity?.numeric ??
      (quantity?.float !== undefined ? String(quantity.float) : "0"),
    decimals: implementation?.decimals ?? quantity?.decimals ?? 18,
    price: optionalFiniteNumber(attributes.price),
    value: optionalFiniteNumber(attributes.value),
    change24h: optionalFiniteNumber(attributes.changes?.absolute_1d),
    changePercent24h: optionalFiniteNumber(attributes.changes?.percent_1d),
    positionType: attributes.position_type || "wallet",
    protocol:
      attributes.application_metadata?.name || attributes.protocol || undefined,
    protocolModule: attributes.protocol_module ?? undefined,
    protocolIconUrl: attributes.application_metadata?.icon?.url ?? undefined,
    groupId: attributes.group_id ?? undefined,
    dappId: position.relationships?.dapp?.data?.id,
    verified: info.flags?.verified ?? false,
  };
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ZerionPortfolioResponse | { error: string }>
) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ZERION_TEST_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "Zerion is not configured" });
  }

  const { address, chartPeriod } =
    request.body as Partial<ZerionPortfolioRequest>;
  if (
    typeof address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(address) ||
    (chartPeriod !== undefined && !ALLOWED_CHART_PERIODS.has(chartPeriod))
  ) {
    return response.status(400).json({ error: "Invalid portfolio request" });
  }

  const period = chartPeriod ?? "month";
  const encodedAddress = encodeURIComponent(address);
  const positionsPath =
    `/wallets/${encodedAddress}/positions/` +
    "?currency=usd&filter%5Bpositions%5D=no_filter" +
    "&filter%5Btrash%5D=only_non_trash&sort=-value";
  const portfolioPath =
    `/wallets/${encodedAddress}/portfolio` +
    "?currency=usd&filter%5Bpositions%5D=no_filter";
  const chartPath =
    `/wallets/${encodedAddress}/charts/${period}` +
    "?currency=usd&filter%5Bpositions%5D=no_filter";

  try {
    // Zerion's free key permits one request per second. Keep these sequential so
    // loading one portfolio does not immediately throttle its own enrichment.
    const portfolioResult = await fetchZerion<ZerionPortfolioBody>({
      path: portfolioPath,
      apiKey,
    });
    if (portfolioResult.nextRequestDelayMs) {
      await wait(portfolioResult.nextRequestDelayMs);
    }
    const positionsResult = await fetchZerion<ZerionPositionBody>({
      path: positionsPath,
      apiKey,
    });
    if (positionsResult.nextRequestDelayMs) {
      await wait(positionsResult.nextRequestDelayMs);
    }
    const chartResult = await fetchZerion<ZerionChartBody>({
      path: chartPath,
      apiKey,
    }).catch((error) => {
      console.warn("Zerion portfolio chart request failed", error);
      return undefined;
    });

    const overview = portfolioResult.body.data?.attributes;
    const positions = (positionsResult.body.data ?? [])
      .map(mapPosition)
      .sort((first, second) => (second.value ?? -1) - (first.value ?? -1));
    const points = (chartResult?.body.data?.attributes?.points ?? []).flatMap(
      ([timestamp, value]) =>
        Number.isFinite(timestamp) && Number.isFinite(value)
          ? [{ timestamp, value }]
          : []
    );

    response.setHeader("Cache-Control", "private, no-store");
    return response.status(200).json({
      provider: "zerion",
      overview: {
        total: optionalFiniteNumber(overview?.total?.positions) ?? 0,
        change24h: optionalFiniteNumber(overview?.changes?.absolute_1d),
        changePercent24h: optionalFiniteNumber(overview?.changes?.percent_1d),
        byPositionType: overview?.positions_distribution_by_type ?? {},
        byChain: overview?.positions_distribution_by_chain ?? {},
      },
      positions,
      chart: {
        period,
        points,
        unavailable: !chartResult,
      },
      rateLimit:
        chartResult?.rateLimit ??
        positionsResult.rateLimit ??
        portfolioResult.rateLimit ??
        undefined,
    });
  } catch (error) {
    console.error("Zerion portfolio request failed", error);
    if (error instanceof ZerionRequestError) {
      if (error.retryAfter) response.setHeader("Retry-After", error.retryAfter);
      const status = [400, 401, 404, 429, 503].includes(error.status)
        ? error.status
        : 502;
      return response.status(status).json({ error: error.message });
    }
    return response.status(502).json({ error: "Unable to reach Zerion" });
  }
}
