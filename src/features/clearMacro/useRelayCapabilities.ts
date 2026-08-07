import { useQuery } from "@tanstack/react-query";
import config from "@/utils/config";
import { getCapabilities, RelayCapabilities } from "./relayApi";

/**
 * The relay provider's capabilities, as a React Query source.
 *
 * Extracted out of `useClearMacroUsdcFeePayment` so eligibility and fee code can share one
 * async source without importing each other. Deliberately neutral: it answers "what does the
 * provider support", and every policy decision (which authorization method, which fee token,
 * what to do while it is pending) belongs to the caller.
 *
 * `staleTime: Infinity` is safe despite the provider-side TTL: `getCapabilities` memoizes for
 * five minutes underneath and the executor re-reads it directly at click time, so a capability
 * that disappeared cannot be acted on even if this cache is warm.
 */
export function useRelayCapabilities() {
  return useQuery<RelayCapabilities>({
    queryKey: ["clearMacroRelayCapabilities"],
    queryFn: () => getCapabilities(),
    staleTime: Infinity,
    retry: 1,
    enabled: !config.isClearMacroDisabled,
  });
}
