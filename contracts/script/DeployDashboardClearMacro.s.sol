// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";

import {ISuperfluid} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {
    IFlowScheduler
} from "@superfluid-finance/automation-contracts/scheduler/contracts/interface/IFlowScheduler.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";

/**
 * @title DeployDashboardClearMacro
 * @dev Deploys `DashboardClearMacro`. Constructor arguments are the Superfluid host
 *      and the FlowScheduler automation contract for the target chain.
 *
 * Usage (simulate):
 *   SUPERFLUID_HOST=0x... FLOW_SCHEDULER=0x... \
 *     forge script script/DeployDashboardClearMacro.s.sol --root contracts --rpc-url <rpc>
 *
 * Usage (broadcast):
 *   SUPERFLUID_HOST=0x... FLOW_SCHEDULER=0x... \
 *     forge script script/DeployDashboardClearMacro.s.sol --root contracts \
 *     --rpc-url <rpc> --broadcast --private-key <key>
 *
 * Both addresses per network are published in the protocol metadata package
 * (superfluid-finance/metadata) — e.g. on optimism-sepolia the FlowScheduler is
 * 0x73B1Ce21d03ad389C2A291B1d1dc4DAFE7B5Dc68. This is a plain (non-CREATE2) deploy,
 * so each run produces a fresh address; wire it into the dashboard's `networks.ts`
 * `dashboardClearMacro.macroAddress` if it is meant to be used.
 */
contract DeployDashboardClearMacro is Script {
    function run() external returns (DashboardClearMacro deployedMacro) {
        address host = vm.envAddress("SUPERFLUID_HOST");
        address flowScheduler = vm.envAddress("FLOW_SCHEDULER");
        require(host.code.length > 0, "SUPERFLUID_HOST has no code on this chain");
        require(flowScheduler.code.length > 0, "FLOW_SCHEDULER has no code on this chain");

        vm.startBroadcast();
        deployedMacro = new DashboardClearMacro(ISuperfluid(host), IFlowScheduler(flowScheduler));
        vm.stopBroadcast();

        console2.log("DashboardClearMacro deployed at:", address(deployedMacro));
        console2.log("Superfluid host:", host);
        console2.log("FlowScheduler:", flowScheduler);
    }
}
