import { Logger } from "@ethersproject/logger";
import { BaseProvider, Network, WebSocketProvider } from "@ethersproject/providers";

import { promiseWithTimeout, wait } from "../utils/promises";
import { isWebSocketProvider } from "../utils/ws-util";

export enum FallbackProviderError {
  NO_PROVIDER = "At least one provider must be provided",
  CANNOT_DETECT_NETWORKS = "Could not detect providers networks",
  INCONSISTENT_NETWORKS = "All providers must be connected to the same network",
}
export const DEFAULT_RETRIES = 0;
export const DEFAULT_TIMEOUT = 3_000;
export const RETRY_DELAY = 100;

export interface ProviderConfig {
  provider: BaseProvider;
  retries?: number;
  timeout?: number;
  retryDelay?: number;
}

const logger = new Logger("FallbackProvider");
const isProviderConfig = (provider: BaseProvider | ProviderConfig): provider is ProviderConfig =>
  (provider as ProviderConfig).provider !== undefined;

export const validateAndGetNetwork = async (providers: (BaseProvider | ProviderConfig)[]) => {
  const providerConfigs = providers.map((p) => (isProviderConfig(p) ? p : { provider: p }));
  if (providers.length === 0) throw new Error(FallbackProviderError.NO_PROVIDER);

  const networks = await Promise.all(
    providerConfigs.map(({ provider }) => provider.getNetwork().catch(() => null))
  );
  const availableNetworks: Network[] = [];
  const availableProviders: ProviderConfig[] = [];
  networks.forEach((network, i) => {
    if (!network) return;
    availableNetworks.push(network);
    availableProviders.push(providerConfigs[i]);
  });

  if (availableProviders.length === 0)
    throw new Error(FallbackProviderError.CANNOT_DETECT_NETWORKS);

  const defaultNetwork = availableNetworks[0];

  if (availableNetworks.find((n) => n.chainId !== defaultNetwork.chainId))
    throw new Error(FallbackProviderError.INCONSISTENT_NETWORKS);

  return { network: defaultNetwork, providers: availableProviders };
};

export class FallbackProvider extends BaseProvider {
  private _providers: ProviderConfig[] = [];

  constructor(_providers: (BaseProvider | ProviderConfig)[]) {
    const networkAndProviders = validateAndGetNetwork(_providers);

    const network = networkAndProviders.then(({ network, providers }) => {
      this._providers = providers;
      return network;
    });

    super(network);
  }

  async detectNetwork(): Promise<Network> {
    return validateAndGetNetwork(this._providers).then(({ network }) => network);
  }

  private async performWithProvider(
    providerIndex: number,
    method: string,
    params: { [name: string]: any },
    retries = 0,
    useFallback = true
  ): Promise<any> {
    const { provider, retries: maxRetries, timeout, retryDelay } = this._providers[providerIndex];

    try {
      if (isWebSocketProvider(provider)) {
        // Provider is a WebSocketProvider. Let's perform some additional checks.
        const readyState = (provider as WebSocketProvider).websocket.readyState;

        if (readyState >= 2) {
          // Closing or closed. Immediately fallback if possible.
          logger.warn(`[FallbackProvider] Provider n°${providerIndex} websocket closed`);

          if (providerIndex >= this._providers.length - 1) {
            throw new Error(
              `[FallbackProvider] Provider n°${providerIndex} websocket closed with no fallback available`
            );
          }

          // We have another provider to fallback to.
          return this.performWithProvider(providerIndex + 1, method, params);
        }

        if (readyState !== 1) {
          // Websocket still connecting. Fallback if possible.
          if (providerIndex < this._providers.length - 1) {
            logger.warn(
              `[FallbackProvider] Provider n°${providerIndex} websocket not ready. Fallbacking to provider n°${
                providerIndex + 1
              }`
            );

            try {
              return await this.performWithProvider(providerIndex + 1, method, params);
            } catch (e2) {
              console.warn(`[FallbackProvider] Fallback failed: ${e2}`);
            }
          }

          // If we're here, we failed to fallback and we know the websocket is not closed. Let's try sending the request
          // to it below.

          // We already tried to fallback, let's not do it again.
          useFallback = false;
        }
      }

      return await promiseWithTimeout(provider.perform(method, params), timeout ?? DEFAULT_TIMEOUT);
    } catch (e) {
      if (retries < (maxRetries ?? DEFAULT_RETRIES)) {
        // Wait for a random time before retrying.
        const delay = Math.ceil(Math.random() * (retryDelay ?? RETRY_DELAY));
        logger.debug(
          `[FallbackProvider] Call to \`${method}\` failing with provider n°${providerIndex}, retrying in ${delay}ms (${
            retries + 1
          }/${maxRetries}) \n\n${e}`
        );
        await wait(delay);
        return this.performWithProvider(providerIndex, method, params, retries + 1, useFallback);
      }
      if (providerIndex >= this._providers.length - 1 || !useFallback) throw e;

      logger.warn(
        `[FallbackProvider] Call to \`${method}\` failing with provider n°${providerIndex}, retrying with provider n°${
          providerIndex + 1
        }\n\n${e}`
      );
      return this.performWithProvider(providerIndex + 1, method, params);
    }
  }

  async perform(method: string, params: { [name: string]: any }): Promise<any> {
    await this._ready();
    return this.performWithProvider(0, method, params);
  }
}
