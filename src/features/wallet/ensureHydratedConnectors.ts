import { watchAccount } from '@wagmi/core';
import type { Config } from 'wagmi';

/**
 * Wagmi persist only stores connector metadata ({ id, name, type, uid }).
 * Reown AppKit's connect() shortcut can re-apply that stub and break getProvider().
 */
export function ensureHydratedConnectors(config: Config) {
  const { connections, current } = config.state;
  if (!current) {
    return;
  }

  const connection = connections.get(current);
  if (!connection) {
    return;
  }

  const { connector } = connection;
  if (typeof connector?.getProvider === 'function') {
    return;
  }

  const fullConnector = config.connectors.find(
    (c) => c.uid === connector?.uid || c.id === connector?.id
  );
  if (!fullConnector) {
    return;
  }

  config.setState((state) => {
    if (!state.current) {
      return state;
    }
    const conn = state.connections.get(state.current);
    if (!conn) {
      return state;
    }
    return {
      ...state,
      connections: new Map(state.connections).set(state.current, {
        ...conn,
        connector: fullConnector,
      }),
    };
  });
}

type PersistAwareStore = {
  persist?: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => void;
  };
};

export function subscribeEnsureHydratedConnectors(config: Config) {
  const run = () => ensureHydratedConnectors(config);

  const unsubAccount = watchAccount(config, { onChange: run });

  const store = config._internal.store as PersistAwareStore;
  if (store.persist?.hasHydrated()) {
    run();
  } else {
    store.persist?.onFinishHydration(run);
  }

  return unsubAccount;
}
