import config from "../../utils/config";

export function isClearMacroProviderConfigured(): boolean {
  return config.clearMacro.providerBaseUrl.length > 0;
}

/** When false, the app should not call the provider (queries return null). */
export function isClearMacroIntegrationEnabled(): boolean {
  return isClearMacroProviderConfigured() && config.clearMacro.enabled;
}
