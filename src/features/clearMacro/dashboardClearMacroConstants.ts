import { ethers } from "ethers";

/** `DashboardClearMacro.ActionId.CreateFlow` (wire id 1) */
export const DASHBOARD_CLEAR_MACRO_ACTION_CREATE_FLOW = 1;
/** `DashboardClearMacro.ActionId.UpdateFlow` (wire id 2) */
export const DASHBOARD_CLEAR_MACRO_ACTION_UPDATE_FLOW = 2;
/** `DashboardClearMacro.ActionId.DeleteFlow` (wire id 3) */
export const DASHBOARD_CLEAR_MACRO_ACTION_DELETE_FLOW = 3;

/** `DashboardClearMacro.ActionId.Transfer` (wire id 7) */
export const DASHBOARD_CLEAR_MACRO_ACTION_TRANSFER = 7;

/**
 * Must match DashboardClearMacro `_LANG_EN` / provider registry `macroPolicy.allowedMacros[].domain`.
 * Keep aligned with clearmacro-provider config for the deployed DashboardClearMacro.
 */
export const DASHBOARD_CLEAR_MACRO_REGISTRY_DOMAIN = "app.superfluid";

export const DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32 =
  ethers.utils.formatBytes32String("en");
