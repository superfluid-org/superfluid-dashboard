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
 *      per relayed transaction, and fee receiver).
 *
 *      Defaults for every eligible chain live in `_defaultConfig` (keyed by `block.chainid`), so on a known
 *      chain no env vars are needed. Each value can still be overridden per invocation via env vars:
 *      `SUPERFLUID_HOST`, `FLOW_SCHEDULER`, `FEE_SUPER_TOKEN`, `BASE_FEE_AMOUNT`, `FEE_RECEIVER`.
 *      Set `BASE_FEE_AMOUNT=0` for a feeless deployment (the fee token and receiver are then zeroed).
 *      `BASE_FEE_AMOUNT` must be a multiple of 1e13 (5-decimal granularity, so the disclosed fee equals
 *      the charged fee).
 *
 *      Eligibility is bounded by FlowScheduler availability (a hard constructor requirement): only the
 *      chains listed in `_defaultConfig` have one. See docs/plans/clear-macro-multi-network-deploy.md.
 *
 * Usage — preferred, via the driver (simulates by default, handles RPCs and verification):
 *   ./contracts/script/deploy-clear-macro.sh all
 *   ./contracts/script/deploy-clear-macro.sh --broadcast --verify --account <keystore> optimism-sepolia
 *
 * Usage — direct (simulate on a known chain, table defaults):
 *   forge script script/DeployDashboardClearMacro.s.sol --root contracts --rpc-url <rpc>
 *
 * Usage — direct with overrides (e.g. feeless):
 *   BASE_FEE_AMOUNT=0 forge script script/DeployDashboardClearMacro.s.sol --root contracts \
 *     --rpc-url <rpc> --broadcast --account <keystore>
 *
 * This is a plain (non-CREATE2) deploy, so each run produces a fresh address; wire it into the
 * dashboard's `networks.ts` `dashboardClearMacro.macroAddress` if it is meant to be used.
 */
contract DeployDashboardClearMacro is Script {
    /// Relay fee policy currently shared by all networks; per-network deviations belong in `_defaultConfig`.
    /// Must stay a multiple of 1e13 (5-decimal granularity enforced by the constructor).
    uint256 internal constant DEFAULT_BASE_FEE = 0.01e18;
    /// Dedicated fee-collection EOA (fresh account, so arriving fees are visible as its whole balance).
    address internal constant DEFAULT_FEE_RECEIVER = 0x74cD5673dF7efC148067Ecab494A19a46b0a3167;

    struct ChainConfig {
        string name; // canonical network name in superfluid-finance/metadata
        address host;
        address flowScheduler;
        address feeSuperToken;
        uint256 baseFee;
        address feeReceiver;
    }

    function run() external returns (DashboardClearMacro deployedMacro) {
        ChainConfig memory cfg = _defaultConfig(block.chainid);
        bool hasTableConfig = cfg.host != address(0);

        address host = vm.envOr("SUPERFLUID_HOST", cfg.host);
        address flowScheduler = vm.envOr("FLOW_SCHEDULER", cfg.flowScheduler);
        // On a chain without a table entry the fee policy must be stated explicitly — the zeroed
        // fallback config must not read as an intentional feeless deployment.
        uint256 baseFee = hasTableConfig ? vm.envOr("BASE_FEE_AMOUNT", cfg.baseFee) : vm.envUint("BASE_FEE_AMOUNT");
        address feeSuperToken = vm.envOr("FEE_SUPER_TOKEN", cfg.feeSuperToken);
        address feeReceiver = vm.envOr("FEE_RECEIVER", cfg.feeReceiver);
        if (baseFee == 0) {
            // Feeless deployment: don't carry fee-token/receiver defaults into the (unused) immutables.
            feeSuperToken = address(0);
            feeReceiver = address(0);
        }

        require(
            host != address(0) && flowScheduler != address(0),
            "no default config for this chain; set SUPERFLUID_HOST and FLOW_SCHEDULER"
        );
        require(host.code.length > 0, "SUPERFLUID_HOST has no code on this chain");
        require(flowScheduler.code.length > 0, "FLOW_SCHEDULER has no code on this chain");
        require(baseFee % 1e13 == 0, "BASE_FEE_AMOUNT must be a multiple of 1e13");
        require(baseFee == 0 || feeSuperToken.code.length > 0, "FEE_SUPER_TOKEN has no code on this chain");
        require(baseFee == 0 || feeReceiver != address(0), "FEE_RECEIVER must be set");
        if (feeSuperToken != address(0)) {
            require(
                ISuperToken(feeSuperToken).getHost() == host,
                "FEE_SUPER_TOKEN is not a SuperToken of this host (wrong token or wrong chain)"
            );
        }

        vm.startBroadcast();
        deployedMacro = new DashboardClearMacro(
            ISuperfluid(host), IFlowScheduler(flowScheduler), ISuperToken(feeSuperToken), baseFee, feeReceiver
        );
        vm.stopBroadcast();

        console2.log("Network:", bytes(cfg.name).length > 0 ? cfg.name : "(no table entry, env-configured)");
        console2.log("Chain id:", block.chainid);
        console2.log("DashboardClearMacro deployed at:", address(deployedMacro));
        console2.log("Superfluid host:", host);
        console2.log("FlowScheduler:", flowScheduler);
        console2.log("Fee SuperToken:", feeSuperToken);
        console2.log("Base fee amount:", baseFee);
        console2.log("Fee receiver:", feeReceiver);
    }

    /// @dev Hosts and FlowSchedulers as published in superfluid-finance/metadata. Fee SuperTokens are each
    ///      chain's USDCx wrapping the chain's *native* USDC (on Optimism/Polygon/Arbitrum deliberately not
    ///      the bridged `USDC.ex`): the fee token must exist as a WrapperSuperToken in the Superfluid token
    ///      list for the dashboard's pay-with-USDC (Permit2) path to resolve its underlying. OP Sepolia has
    ///      no USDC listing, so it uses fUSDCx.
    function _defaultConfig(uint256 chainId) internal pure returns (ChainConfig memory) {
        if (chainId == 1) {
            return ChainConfig({
                name: "eth-mainnet",
                host: 0x4E583d9390082B65Bef884b629DFA426114CED6d,
                flowScheduler: 0xAA0cD305eD020137E302CeCede7b18c0A05aCCDA,
                feeSuperToken: 0x1BA8603DA702602A8657980e825A6DAa03Dee93a, // USDCx
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 10) {
            return ChainConfig({
                name: "optimism-mainnet",
                host: 0x567c4B141ED61923967cA25Ef4906C8781069a10,
                flowScheduler: 0x55c8fc400833eEa791087cF343Ff2409A39DeBcC,
                feeSuperToken: 0x35Adeb0638EB192755B6E52544650603Fe65A006, // USDCx (native USDC)
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 56) {
            return ChainConfig({
                name: "bsc-mainnet",
                host: 0xd1e2cFb6441680002Eb7A44223160aB9B67d7E6E,
                flowScheduler: 0x2f9e2A2A59405682d4F86779275CF5525AD7eC2B,
                feeSuperToken: 0x0419e1fA3671754F77EC7D5416219A5f9A08B530, // USDCx
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 100) {
            return ChainConfig({
                name: "xdai-mainnet",
                host: 0x2dFe937cD98Ab92e59cF3139138f18c823a4efE7,
                flowScheduler: 0x9cC7fc484fF588926149577e9330fA5b2cA74336,
                feeSuperToken: 0x1234756ccf0660E866305289267211823Ae86eEc, // USDCx
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 137) {
            return ChainConfig({
                name: "polygon-mainnet",
                host: 0x3E14dC1b13c488a8d5D310918780c983bD5982E7,
                flowScheduler: 0x55F7758dd99d5e185f4CC08d4Ad95B71f598264D,
                feeSuperToken: 0x07b24BBD834c1c546EcE89fF95f71D9F13a2eBD1, // USDCx (native USDC)
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 8453) {
            return ChainConfig({
                name: "base-mainnet",
                host: 0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74,
                flowScheduler: 0xC72CEd15204d02183c83fEbb918b183E400811Ee,
                feeSuperToken: 0xD04383398dD2426297da660F9CCA3d439AF9ce1b, // USDCx
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 42161) {
            return ChainConfig({
                name: "arbitrum-one",
                host: 0xCf8Acb4eF033efF16E8080aed4c7D5B9285D2192,
                flowScheduler: 0x3fA8B653F9abf91428800C0ba0F8D145a71F97A1,
                feeSuperToken: 0xFc55F2854e74b4f42D01a6d3DAAC4c52D9dfdcFf, // USDCx (native USDC)
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 43114) {
            return ChainConfig({
                name: "avalanche-c",
                host: 0x60377C7016E4cdB03C87EF474896C11cB560752C,
                flowScheduler: 0xF7AfF590E9DE493D7ACb421Fca7f1E35C1ad4Ce5,
                feeSuperToken: 0x288398F314D472B82C44855F3f6fF20b633c2A97, // USDCx
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        if (chainId == 11155420) {
            return ChainConfig({
                name: "optimism-sepolia",
                host: 0xd399e2Fb5f4cf3722a11F65b88FAB6B2B8621005,
                flowScheduler: 0x73B1Ce21d03ad389C2A291B1d1dc4DAFE7B5Dc68,
                feeSuperToken: 0x131780640EDf9830099AAc2203229073d6D2FE69, // fUSDCx
                baseFee: DEFAULT_BASE_FEE,
                feeReceiver: DEFAULT_FEE_RECEIVER
            });
        }
        return ChainConfig({
            name: "",
            host: address(0),
            flowScheduler: address(0),
            feeSuperToken: address(0),
            baseFee: 0,
            feeReceiver: address(0)
        });
    }
}
