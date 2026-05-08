/**
 * Normalizes a configured provider origin for joining with `/v1/...` paths.
 */
export function normalizeClearMacroProviderBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

export function joinClearMacroApiPath(
  baseUrl: string,
  path: string
): string {
  const root = normalizeClearMacroProviderBaseUrl(baseUrl);
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${root}${suffix}`;
}
