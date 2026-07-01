// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";

import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";

/**
 * @title DeployDashboardClearMacro
 * @dev Deploys `DashboardClearMacro`, whose only constructor argument is the
 *      Superfluid host for the target chain.
 *
 * Usage (simulate):
 *   SUPERFLUID_HOST=0x... forge script script/DeployDashboardClearMacro.s.sol --root contracts --rpc-url <rpc>
 *
 * Usage (broadcast):
 *   SUPERFLUID_HOST=0x... forge script script/DeployDashboardClearMacro.s.sol --root contracts \
 *     --rpc-url <rpc> --broadcast --private-key <key>
 *
 * The Superfluid host per network is published in the protocol metadata
 * package (superfluid-finance/metadata). This is a plain (non-CREATE2) deploy, so
 * each run produces a fresh address; wire it into the dashboard's
 * `networks.ts` `dashboardClearMacro.macroAddress` if it is meant to be used.
 */
contract DeployDashboardClearMacro is Script {
    function run() external returns (DashboardClearMacro deployedMacro) {
        address host = vm.envAddress("SUPERFLUID_HOST");

        vm.startBroadcast();
        deployedMacro = new DashboardClearMacro(ISuperfluid(host));
        vm.stopBroadcast();

        console2.log("DashboardClearMacro deployed at:", address(deployedMacro));
        console2.log("Superfluid host:", host);
    }
}
