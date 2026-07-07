// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";

import {
    ISuperfluid,
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {
    IFlowScheduler
} from "@superfluid-finance/automation-contracts/scheduler/contracts/interface/IFlowScheduler.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";

/**
 * @title DeployDashboardClearMacro
 * @dev Deploys `DashboardClearMacro`. Constructor arguments are the Superfluid host, the FlowScheduler
 *      automation contract for the target chain, and the relay fee configuration (fee SuperToken, base fee
 *      per relayed transaction, and fee receiver). Set `BASE_FEE_AMOUNT=0` for a feeless deployment; the fee
 *      env vars are then optional. `BASE_FEE_AMOUNT` must be a multiple of 1e13 (5-decimal granularity).
 *
 * Usage (simulate, feeless):
 *   SUPERFLUID_HOST=0x... FLOW_SCHEDULER=0x... BASE_FEE_AMOUNT=0 \
 *     forge script script/DeployDashboardClearMacro.s.sol --root contracts --rpc-url <rpc>
 *
 * Usage (broadcast, with fee):
 *   SUPERFLUID_HOST=0x... FLOW_SCHEDULER=0x... \
 *     FEE_SUPER_TOKEN=0x... BASE_FEE_AMOUNT=200000000000000000 FEE_RECEIVER=0x... \
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

        // Fee config. Read the base fee first so a feeless deploy (BASE_FEE_AMOUNT=0) needs no fee env vars.
        uint256 baseFee = vm.envUint("BASE_FEE_AMOUNT");
        address feeSuperToken = vm.envOr("FEE_SUPER_TOKEN", address(0));
        address feeReceiver = vm.envOr("FEE_RECEIVER", address(0));
        require(baseFee == 0 || feeSuperToken.code.length > 0, "FEE_SUPER_TOKEN has no code on this chain");
        require(baseFee == 0 || feeReceiver != address(0), "FEE_RECEIVER must be set");

        vm.startBroadcast();
        deployedMacro = new DashboardClearMacro(
            ISuperfluid(host), IFlowScheduler(flowScheduler), ISuperToken(feeSuperToken), baseFee, feeReceiver
        );
        vm.stopBroadcast();

        console2.log("DashboardClearMacro deployed at:", address(deployedMacro));
        console2.log("Superfluid host:", host);
        console2.log("FlowScheduler:", flowScheduler);
        console2.log("Fee SuperToken:", feeSuperToken);
        console2.log("Base fee amount:", baseFee);
        console2.log("Fee receiver:", feeReceiver);
    }
}
