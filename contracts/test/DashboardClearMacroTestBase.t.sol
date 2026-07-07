// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {VmSafe} from "forge-std/Vm.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

import {
    FoundrySuperfluidTester
} from "@superfluid-finance/ethereum-contracts/test/foundry/FoundrySuperfluidTester.t.sol";
import {
    IERC20,
    ISuperfluidToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {ClearMacroForwarderV1} from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroForwarderV1.sol";
import {
    IClearMacroForwarderV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/utils/IClearMacroForwarderV1.sol";
import {FlowScheduler} from "@superfluid-finance/automation-contracts/scheduler/contracts/FlowScheduler.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";

/// Shared deployment and relay-signing harness for DashboardClearMacro test suites: a full local
/// Superfluid framework, a fee-charging macro instance, a ClearMacroForwarderV1 registered as
/// trusted forwarder, and helpers for funding signers and running actions through the relay path.
abstract contract DashboardClearMacroTestBase is FoundrySuperfluidTester {
    bytes32 internal constant LANG_EN = bytes32("en");
    string internal constant SECURITY_DOMAIN = "app.superfluid";
    string internal constant PROVIDER = "dashboard-provider";
    uint8 internal constant UNKNOWN_ACTION_ID = 99;
    int96 internal constant DEFAULT_FLOW_RATE = 1_157_407_407_407; // 0.1/day
    uint256 internal constant DEFAULT_AMOUNT = 1e17;
    uint256 internal constant BASE_FEE = 1e15; // 0.001, a multiple of 1e13 so the disclosed amount is exact
    address internal constant FEE_RECEIVER = address(0xFEE);

    DashboardClearMacro internal dashboardClearMacro;
    ClearMacroForwarderV1 internal forwarder;
    FlowScheduler internal flowScheduler;

    constructor() FoundrySuperfluidTester(5) {}

    function setUp() public override {
        super.setUp();
        flowScheduler = new FlowScheduler(sf.host);
        dashboardClearMacro = new DashboardClearMacro(sf.host, flowScheduler, superToken, BASE_FEE, FEE_RECEIVER);
        forwarder = new ClearMacroForwarderV1(sf.host);
        _grantProviderRole(PROVIDER, address(this));

        vm.prank(address(sfDeployer));
        sf.governance.enableTrustedForwarder(sf.host, ISuperfluidToken(address(0)), address(forwarder));
    }

    function _grantProviderRole(string memory provider, address account) internal {
        IAccessControl acl = IAccessControl(sf.host.getSimpleACL());
        bytes32 role = keccak256(bytes(provider));
        if (acl.hasRole(role, account)) return;

        address[4] memory candidateAdmins = [address(sfDeployer), address(sf.governance), address(sf.host), admin];
        for (uint256 i = 0; i < candidateAdmins.length; ++i) {
            vm.prank(candidateAdmins[i]);
            try acl.grantRole(role, account) {
                return;
            } catch {}
        }
        revert("unable to grant provider role");
    }

    function _scheduleParams(address receiver, uint32 startDate, int96 flowRate, uint32 endDate)
        internal
        view
        returns (bytes memory)
    {
        return dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: receiver,
                startDate: startDate,
                flowRate: flowRate,
                endDate: endDate
            })
        );
    }

    function _newSigner(string memory label) internal returns (VmSafe.Wallet memory signer) {
        signer = vm.createWallet(label);
        vm.deal(signer.addr, 10 ether);
    }

    function _fundSuper(VmSafe.Wallet memory signer, uint256 amount) internal {
        vm.prank(alice);
        superToken.transfer(signer.addr, amount);
    }

    function _fundUnderlyingAndApprove(VmSafe.Wallet memory signer, uint256 amount) internal {
        IERC20 underlying = IERC20(superToken.getUnderlyingToken());
        vm.prank(alice);
        underlying.transfer(signer.addr, amount);
        vm.prank(signer.addr);
        underlying.approve(address(superToken), amount);
    }

    function _getEncodedPayload(
        bytes memory actionParams,
        string memory provider,
        uint256 validAfter,
        uint256 validBefore,
        uint256 nonce,
        address macroContract
    ) internal view returns (bytes memory encodedPayload) {
        IClearMacroForwarderV1.Security memory security = IClearMacroForwarderV1.Security({
            domain: SECURITY_DOMAIN,
            macroContract: macroContract,
            provider: provider,
            validAfter: validAfter,
            validBefore: validBefore,
            nonce: nonce
        });
        encodedPayload = forwarder.encodeParams(actionParams, security);
    }

    function _runAsProvider(
        VmSafe.Wallet memory signer,
        bytes memory actionParams,
        uint192 key,
        string memory provider,
        uint256 validAfter,
        uint256 validBefore
    ) internal {
        uint256 nonce = forwarder.getNonce(signer.addr, key);
        bytes memory encodedPayload =
            _getEncodedPayload(actionParams, provider, validAfter, validBefore, nonce, address(dashboardClearMacro));
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
    }

    // Runs an action against an arbitrary macro instance (not the default `dashboardClearMacro`), used to
    // exercise a separately-deployed feeless macro.
    function _runAsProviderOn(DashboardClearMacro macroInstance, VmSafe.Wallet memory signer, bytes memory actionParams)
        internal
    {
        IClearMacroForwarderV1.Security memory security = IClearMacroForwarderV1.Security({
            domain: SECURITY_DOMAIN,
            macroContract: address(macroInstance),
            provider: PROVIDER,
            validAfter: 0,
            validBefore: 0,
            nonce: forwarder.getNonce(signer.addr, 0)
        });
        bytes memory encodedPayload = forwarder.encodeParams(actionParams, security);
        bytes32 digest = forwarder.getDigest(macroInstance, encodedPayload);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer, digest);
        forwarder.runMacro(macroInstance, encodedPayload, signer.addr, abi.encodePacked(r, s, v));
    }

    function _signEncodedPayload(VmSafe.Wallet memory signer, bytes memory encodedPayload)
        internal
        returns (bytes memory signature)
    {
        bytes32 digest = forwarder.getDigest(dashboardClearMacro, encodedPayload);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer, digest);
        return abi.encodePacked(r, s, v);
    }

    function _contains(string memory source, string memory needle) internal pure returns (bool) {
        bytes memory sourceBytes = bytes(source);
        bytes memory needleBytes = bytes(needle);
        if (needleBytes.length == 0) return true;
        if (needleBytes.length > sourceBytes.length) return false;

        for (uint256 i = 0; i <= sourceBytes.length - needleBytes.length; ++i) {
            bool match_ = true;
            for (uint256 j = 0; j < needleBytes.length; ++j) {
                if (sourceBytes[i + j] != needleBytes[j]) {
                    match_ = false;
                    break;
                }
            }
            if (match_) return true;
        }
        return false;
    }
}
