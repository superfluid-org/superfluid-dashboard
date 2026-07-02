// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {VmSafe} from "forge-std/Vm.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

import {
    FoundrySuperfluidTester
} from "@superfluid-finance/ethereum-contracts/test/foundry/FoundrySuperfluidTester.t.sol";
import {
    IERC20,
    ISuperToken,
    ISuperfluidToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import {
    ClearMacroForwarderV1,
    NonceManager
} from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroForwarderV1.sol";
import {ClearMacroBase} from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroBase.sol";
import {
    IClearMacroForwarderV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/utils/IClearMacroForwarderV1.sol";
import {FlowScheduler} from "@superfluid-finance/automation-contracts/scheduler/contracts/FlowScheduler.sol";
import {
    IFlowScheduler
} from "@superfluid-finance/automation-contracts/scheduler/contracts/interface/IFlowScheduler.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";

using SuperTokenV1Library for ISuperToken;

contract DashboardClearMacroTest is FoundrySuperfluidTester {
    bytes32 internal constant LANG_EN = bytes32("en");
    string internal constant SECURITY_DOMAIN = "app.superfluid";
    string internal constant PROVIDER = "dashboard-provider";
    uint8 internal constant UNKNOWN_ACTION_ID = 99;
    int96 internal constant DEFAULT_FLOW_RATE = 1_157_407_407_407; // 0.1/day
    uint256 internal constant DEFAULT_AMOUNT = 1e17;

    DashboardClearMacro internal dashboardClearMacro;
    ClearMacroForwarderV1 internal forwarder;
    FlowScheduler internal flowScheduler;

    constructor() FoundrySuperfluidTester(5) {}

    function setUp() public override {
        super.setUp();
        flowScheduler = new FlowScheduler(sf.host);
        dashboardClearMacro = new DashboardClearMacro(sf.host, flowScheduler);
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

    function testCreateFlow() external {
        VmSafe.Wallet memory signer = _newSigner("create");
        _fundSuper(signer, 100e18);

        bytes memory actionParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);
    }

    function testUpdateFlow() external {
        VmSafe.Wallet memory signer = _newSigner("update");
        _fundSuper(signer, 100e18);
        bytes memory createActionParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        _runAsProvider(signer, createActionParams, 0, PROVIDER, 0, 0);

        int96 newRate = DEFAULT_FLOW_RATE * 2;
        bytes memory actionParams = dashboardClearMacro.encodeUpdateFlow(
            LANG_EN, DashboardClearMacro.UpdateFlowParams({superToken: superToken, receiver: bob, flowRate: newRate})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), newRate);
    }

    function testDeleteFlow() external {
        VmSafe.Wallet memory signer = _newSigner("delete");
        _fundSuper(signer, 100e18);
        bytes memory createActionParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        _runAsProvider(signer, createActionParams, 0, PROVIDER, 0, 0);

        bytes memory actionParams = dashboardClearMacro.encodeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: signer.addr, receiver: bob})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), 0);
    }

    function testUpgrade() external {
        VmSafe.Wallet memory signer = _newSigner("upgrade");
        _fundUnderlyingAndApprove(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeUpgrade(
            LANG_EN, DashboardClearMacro.UpgradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), DEFAULT_AMOUNT);
    }

    function testDowngrade() external {
        VmSafe.Wallet memory signer = _newSigner("downgrade");
        _fundSuper(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeDowngrade(
            LANG_EN, DashboardClearMacro.DowngradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), 1e18 - DEFAULT_AMOUNT);
    }

    function testApprove() external {
        VmSafe.Wallet memory signer = _newSigner("approve");
        _fundSuper(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeApprove(
            LANG_EN, DashboardClearMacro.ApproveParams({superToken: superToken, spender: bob, amount: DEFAULT_AMOUNT})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.allowance(signer.addr, bob), DEFAULT_AMOUNT);
    }

    function testTransfer() external {
        VmSafe.Wallet memory signer = _newSigner("transfer");
        _fundSuper(signer, 1e18);
        uint256 bobBefore = superToken.balanceOf(bob);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), 1e18 - DEFAULT_AMOUNT);
        assertEq(superToken.balanceOf(bob), bobBefore + DEFAULT_AMOUNT);
    }

    function testScheduleFlowStartAndEnd() external {
        VmSafe.Wallet memory signer = _newSigner("schedule");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: endDate
            })
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.startDate, startDate);
        assertEq(schedule.startMaxDelay, uint32(1 days));
        assertEq(schedule.endDate, endDate);
        assertEq(schedule.flowRate, DEFAULT_FLOW_RATE);
        assertEq(schedule.startAmount, 0);

        (, uint8 permissions, int96 flowRateAllowance) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissions), 5); // create | delete
        assertEq(flowRateAllowance, DEFAULT_FLOW_RATE);
    }

    function testScheduleFlowEndOnly() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-end-only");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: 0,
                endDate: endDate
            })
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.startDate, 0);
        assertEq(schedule.startMaxDelay, 0);
        assertEq(schedule.endDate, endDate);

        (, uint8 permissions, int96 flowRateAllowance) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissions), 4); // delete only
        assertEq(flowRateAllowance, 0);
    }

    function testScheduleFlowSkipsGrantWhenFullControlAlready() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-full-control");
        _fundSuper(signer, 100e18);

        vm.prank(signer.addr);
        sf.host.callAgreement(
            sf.cfa,
            abi.encodeCall(
                sf.cfa.authorizeFlowOperatorWithFullControl, (superToken, address(flowScheduler), new bytes(0))
            ),
            new bytes(0)
        );
        (, uint8 permissionsBefore, int96 allowanceBefore) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissionsBefore), 7);
        assertEq(allowanceBefore, type(int96).max);

        // An unconditional additive grant would overflow the max allowance and revert here.
        uint32 startDate = uint32(block.timestamp + 1 days);
        bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 0
            })
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.startDate, startDate);

        (, uint8 permissionsAfter, int96 allowanceAfter) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissionsAfter), 7);
        assertEq(allowanceAfter, type(int96).max);
    }

    function testScheduleFlowModifyDoesNotAccumulateAllowance() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-modify");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        for (uint256 i = 0; i < 2; ++i) {
            bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: startDate,
                    flowRate: DEFAULT_FLOW_RATE,
                    endDate: endDate
                })
            );
            _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);
        }
        (, uint8 permissions, int96 flowRateAllowance) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissions), 5);
        assertEq(flowRateAllowance, DEFAULT_FLOW_RATE); // unchanged after re-signing, not doubled

        int96 higherRate = DEFAULT_FLOW_RATE * 2;
        bytes memory higherRateParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: higherRate,
                endDate: endDate
            })
        );
        _runAsProvider(signer, higherRateParams, 0, PROVIDER, 0, 0);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.flowRate, higherRate);
        (,, flowRateAllowance) = sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(flowRateAllowance, higherRate); // topped up to the new rate, not summed
    }

    function testScheduleFlowExecutesViaKeeper() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-exec");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);

        bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 0
            })
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);
        assertEq(superToken.getFlowRate(signer.addr, bob), 0);

        vm.warp(startDate);
        flowScheduler.executeCreateFlow(superToken, signer.addr, bob, new bytes(0));

        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);
    }

    function testScheduleFlowEndOnlyExecutesViaKeeper() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-end-exec");
        _fundSuper(signer, 100e18);

        bytes memory createActionParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        _runAsProvider(signer, createActionParams, 0, PROVIDER, 0, 0);
        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);

        uint32 endDate = uint32(block.timestamp + 30 days);
        bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: 0,
                endDate: endDate
            })
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        vm.warp(endDate);
        flowScheduler.executeDeleteFlow(superToken, signer.addr, bob, new bytes(0));

        assertEq(superToken.getFlowRate(signer.addr, bob), 0);
    }

    function testDeleteFlowSchedule() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-cancel");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        bytes memory scheduleActionParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: endDate
            })
        );
        _runAsProvider(signer, scheduleActionParams, 0, PROVIDER, 0, 0);

        bytes memory actionParams = dashboardClearMacro.encodeDeleteFlowSchedule(
            LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.startDate, 0);
        assertEq(schedule.endDate, 0);
        assertEq(schedule.flowRate, 0);
    }

    function testScheduleFlowRevertsWithoutDates() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-no-dates");
        bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 0
            })
        );
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert(DashboardClearMacro.InvalidTimeWindow.selector);
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
    }

    function testScheduleFlowRevertsZeroOrNegativeRate() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-bad-rate");
        uint32 startDate = uint32(block.timestamp + 1 days);
        int96[2] memory badRates = [int96(0), int96(-1)];

        for (uint256 i = 0; i < badRates.length; ++i) {
            bytes memory actionParams = dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: startDate,
                    flowRate: badRates[i],
                    endDate: 0
                })
            );
            bytes memory encodedPayload = _getEncodedPayload(
                actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
            );
            bytes memory sig = _signEncodedPayload(signer, encodedPayload);

            vm.expectRevert(DashboardClearMacro.InvalidFlowRate.selector);
            forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
        }

        // A stop-only schedule must not carry a flow rate.
        bytes memory stopOnlyParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: uint32(block.timestamp + 30 days)
            })
        );
        bytes memory stopOnlyPayload = _getEncodedPayload(
            stopOnlyParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory stopOnlySig = _signEncodedPayload(signer, stopOnlyPayload);

        vm.expectRevert(DashboardClearMacro.InvalidFlowRate.selector);
        forwarder.runMacro(dashboardClearMacro, stopOnlyPayload, signer.addr, stopOnlySig);
    }

    function testEnglishDescriptionsForAllActions() external view {
        string memory receiverHex = Strings.toHexString(uint256(uint160(bob)), 20);
        string memory spenderHex = Strings.toHexString(uint256(uint160(alice)), 20);
        string memory createDesc = dashboardClearMacro.describeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        assertTrue(_contains(createDesc, "Create a new flow of"));
        assertTrue(_contains(createDesc, superToken.symbol()));
        assertTrue(_contains(createDesc, receiverHex));

        string memory updateDesc = dashboardClearMacro.describeUpdateFlow(
            LANG_EN,
            DashboardClearMacro.UpdateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        assertTrue(_contains(updateDesc, "Update flow to"));
        assertTrue(_contains(updateDesc, superToken.symbol()));
        assertTrue(_contains(updateDesc, receiverHex));

        string memory deleteDesc = dashboardClearMacro.describeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: alice, receiver: bob})
        );
        assertTrue(_contains(deleteDesc, "Delete flow of"));
        assertTrue(_contains(deleteDesc, superToken.symbol()));
        assertTrue(_contains(deleteDesc, spenderHex));
        assertTrue(_contains(deleteDesc, receiverHex));

        string memory upgradeDesc = dashboardClearMacro.describeUpgrade(
            LANG_EN, DashboardClearMacro.UpgradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
        assertTrue(_contains(upgradeDesc, "Upgrade"));
        assertTrue(_contains(upgradeDesc, superToken.symbol()));

        string memory downgradeDesc = dashboardClearMacro.describeDowngrade(
            LANG_EN, DashboardClearMacro.DowngradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
        assertTrue(_contains(downgradeDesc, "Downgrade"));
        assertTrue(_contains(downgradeDesc, superToken.symbol()));

        string memory approveDesc = dashboardClearMacro.describeApprove(
            LANG_EN, DashboardClearMacro.ApproveParams({superToken: superToken, spender: alice, amount: DEFAULT_AMOUNT})
        );
        assertTrue(_contains(approveDesc, "Approve"));
        assertTrue(_contains(approveDesc, spenderHex));

        string memory transferDesc = dashboardClearMacro.describeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        assertTrue(_contains(transferDesc, "Transfer"));
        assertTrue(_contains(transferDesc, receiverHex));

        string memory scheduleDesc = dashboardClearMacro.describeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 1750000000,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 1760000000
            })
        );
        assertTrue(_contains(scheduleDesc, "Schedule a stream of"));
        assertTrue(_contains(scheduleDesc, superToken.symbol()));
        assertTrue(_contains(scheduleDesc, receiverHex));
        assertTrue(_contains(scheduleDesc, "1750000000"));
        assertTrue(_contains(scheduleDesc, "1760000000"));
        assertTrue(_contains(scheduleDesc, "authorize the Flow Scheduler"));

        string memory stopOnlyDesc = dashboardClearMacro.describeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: 0,
                endDate: 1760000000
            })
        );
        assertTrue(_contains(stopOnlyDesc, "to stop at"));
        assertTrue(_contains(stopOnlyDesc, "1760000000"));

        string memory cancelDesc = dashboardClearMacro.describeDeleteFlowSchedule(
            LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
        );
        assertTrue(_contains(cancelDesc, "Cancel the scheduled stream"));
        assertTrue(_contains(cancelDesc, receiverHex));
    }

    function testRevertsOnInvalidSignature() external {
        VmSafe.Wallet memory signer = _newSigner("sig-good");
        VmSafe.Wallet memory wrongSigner = _newSigner("sig-bad");
        _fundSuper(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload = _getEncodedPayload(actionParams, PROVIDER, 0, 0, 0, address(dashboardClearMacro));
        bytes memory badSig = _signEncodedPayload(wrongSigner, encodedPayload);

        vm.expectRevert(ClearMacroForwarderV1.InvalidSignature.selector);
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, badSig);
    }

    function testRevertsOnMacroMismatch() external {
        VmSafe.Wallet memory signer = _newSigner("mismatch");
        _fundSuper(signer, 1e18);
        DashboardClearMacro otherDashboardClearMacro = new DashboardClearMacro(sf.host, flowScheduler);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload = _getEncodedPayload(actionParams, PROVIDER, 0, 0, 0, address(dashboardClearMacro));
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert(
            abi.encodeWithSelector(
                ClearMacroForwarderV1.MacroContractMismatch.selector,
                address(dashboardClearMacro),
                address(otherDashboardClearMacro)
            )
        );
        forwarder.runMacro(otherDashboardClearMacro, encodedPayload, signer.addr, sig);
    }

    function testRevertsWhenProviderMissingRole() external {
        VmSafe.Wallet memory signer = _newSigner("missing-role");
        _fundSuper(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload =
            _getEncodedPayload(actionParams, "other-provider", 0, 0, 0, address(dashboardClearMacro));
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.prank(address(0xBEEF));
        vm.expectRevert(
            abi.encodeWithSelector(
                ClearMacroForwarderV1.ProviderNotAuthorized.selector, "other-provider", address(0xBEEF)
            )
        );
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
    }

    function testSelfRelaySucceeds() external {
        VmSafe.Wallet memory signer = _newSigner("self-relay");
        _fundSuper(signer, 1e18);
        uint256 bobBefore = superToken.balanceOf(bob);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload = _getEncodedPayload(actionParams, "self", 0, 0, 0, address(dashboardClearMacro));
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.prank(signer.addr);
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
        assertEq(superToken.balanceOf(bob), bobBefore + DEFAULT_AMOUNT);
    }

    function testSelfRelayRevertsWhenDifferentExecutor() external {
        VmSafe.Wallet memory signer = _newSigner("self-relay-revert");
        _fundSuper(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload = _getEncodedPayload(actionParams, "self", 0, 0, 0, address(dashboardClearMacro));
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert(
            abi.encodeWithSelector(ClearMacroForwarderV1.ProviderNotAuthorized.selector, "self", address(this))
        );
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
    }

    function testRevertsOnUnsupportedLanguage() external {
        address signer = _newSigner("lang").addr;
        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            bytes32("fr"),
            DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer, 0), address(dashboardClearMacro)
        );

        vm.expectRevert(ClearMacroBase.UnsupportedLanguage.selector);
        forwarder.getDigest(dashboardClearMacro, encodedPayload);
    }

    function testRevertsOnUnknownActionId() external {
        address signer = _newSigner("unknown-action").addr;
        bytes memory actionParams = abi.encode(UNKNOWN_ACTION_ID, LANG_EN, abi.encode(superToken, bob, DEFAULT_AMOUNT));
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer, 0), address(dashboardClearMacro)
        );

        vm.expectRevert(abi.encodeWithSelector(ClearMacroBase.UnknownActionId.selector, UNKNOWN_ACTION_ID));
        forwarder.getDigest(dashboardClearMacro, encodedPayload);
    }

    function testNonceReplayReverts() external {
        VmSafe.Wallet memory signer = _newSigner("replay");
        _fundSuper(signer, 1e18);
        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );

        uint256 nonce = forwarder.getNonce(signer.addr, 0);
        bytes memory encodedPayload =
            _getEncodedPayload(actionParams, PROVIDER, 0, 0, nonce, address(dashboardClearMacro));
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);

        vm.expectRevert(abi.encodeWithSelector(NonceManager.InvalidNonce.selector, signer.addr, nonce));
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
    }

    function testNonceMustBeSequentialPerKey() external {
        VmSafe.Wallet memory signer = _newSigner("seq");
        _fundSuper(signer, 2e18);
        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        uint192 key = 7;

        uint256 nonceSeq1 = (uint256(key) << 64) | 1;
        bytes memory encodedPayloadSeq1 =
            _getEncodedPayload(actionParams, PROVIDER, 0, 0, nonceSeq1, address(dashboardClearMacro));
        bytes memory sigSeq1 = _signEncodedPayload(signer, encodedPayloadSeq1);

        vm.expectRevert(abi.encodeWithSelector(NonceManager.InvalidNonce.selector, signer.addr, nonceSeq1));
        forwarder.runMacro(dashboardClearMacro, encodedPayloadSeq1, signer.addr, sigSeq1);

        uint256 nonceSeq0 = uint256(key) << 64;
        bytes memory encodedPayloadSeq0 =
            _getEncodedPayload(actionParams, PROVIDER, 0, 0, nonceSeq0, address(dashboardClearMacro));
        bytes memory sigSeq0 = _signEncodedPayload(signer, encodedPayloadSeq0);
        forwarder.runMacro(dashboardClearMacro, encodedPayloadSeq0, signer.addr, sigSeq0);
        forwarder.runMacro(dashboardClearMacro, encodedPayloadSeq1, signer.addr, sigSeq1);
    }

    function testValidityWindowBoundaries() external {
        VmSafe.Wallet memory signer = _newSigner("window");
        _fundSuper(signer, 2e18);
        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );

        uint256 validAfter = block.timestamp + 100;
        uint256 validBefore = block.timestamp + 300;

        uint256 nonce = forwarder.getNonce(signer.addr, 0);
        bytes memory encodedPayload =
            _getEncodedPayload(actionParams, PROVIDER, validAfter, validBefore, nonce, address(dashboardClearMacro));
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert(
            abi.encodeWithSelector(
                ClearMacroForwarderV1.OutsideValidityWindow.selector, block.timestamp, validBefore, validAfter
            )
        );
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);

        vm.warp(validAfter);
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);

        nonce = forwarder.getNonce(signer.addr, 0);
        encodedPayload = _getEncodedPayload(actionParams, PROVIDER, 0, validBefore, nonce, address(dashboardClearMacro));
        sig = _signEncodedPayload(signer, encodedPayload);
        vm.warp(validBefore + 1);
        vm.expectRevert(
            abi.encodeWithSelector(
                ClearMacroForwarderV1.OutsideValidityWindow.selector, validBefore + 1, validBefore, uint256(0)
            )
        );
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
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
