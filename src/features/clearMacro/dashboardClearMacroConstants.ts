import { ethers } from "ethers";

/** DashboardClearMacro.ACTION_CREATE_FLOW */
export const DASHBOARD_CLEAR_MACRO_ACTION_CREATE_FLOW = 1;
/** DashboardClearMacro.ACTION_UPDATE_FLOW */
export const DASHBOARD_CLEAR_MACRO_ACTION_UPDATE_FLOW = 2;
/** DashboardClearMacro.ACTION_DELETE_FLOW */
export const DASHBOARD_CLEAR_MACRO_ACTION_DELETE_FLOW = 3;

/** DashboardClearMacro.ACTION_TRANSFER */
export const DASHBOARD_CLEAR_MACRO_ACTION_TRANSFER = 7;

/**
 * Must match DashboardClearMacro LANG_EN / provider registry `macroPolicy.allowedMacros[].domain`.
 * Keep aligned with clearmacro-provider config for the deployed DashboardClearMacro.
 */
export const DASHBOARD_CLEAR_MACRO_REGISTRY_DOMAIN = "app.superfluid";

export const DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32 =
  ethers.utils.formatBytes32String("en");
