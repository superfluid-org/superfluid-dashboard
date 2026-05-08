/**
 * Checked-in DashboardClearMacro contract address per chain.
 * Keep in sync with deployments / contracts package.
 * Security `domain` for relay (must match provider macro allowlist) is
 * `DASHBOARD_CLEAR_MACRO_REGISTRY_DOMAIN` in `./dashboardClearMacroConstants`.
 */
export const DASHBOARD_CLEAR_MACRO_ADDRESS_BY_CHAIN_ID: Readonly<
  Record<number, `0x${string}`>
> = Object.freeze({
  /** OP Sepolia */
  11155420: "0x743db635a328cC5660cf76Aa6BDfAda75CE2942a",
});

export function getDashboardClearMacroAddress(
  chainId: number
): `0x${string}` | undefined {
  return DASHBOARD_CLEAR_MACRO_ADDRESS_BY_CHAIN_ID[chainId];
}
