// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {VmSafe} from "forge-std/Vm.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import {
    ClearMacroForwarderV1,
    NonceManager
} from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroForwarderV1.sol";
import {ClearMacroBase} from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroBase.sol";
import {
    IFlowScheduler
} from "@superfluid-finance/automation-contracts/scheduler/contracts/interface/IFlowScheduler.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";
import {DashboardClearMacroTestBase} from "./DashboardClearMacroTestBase.t.sol";

using SuperTokenV1Library for ISuperToken;

contract DashboardClearMacroTest is DashboardClearMacroTestBase {
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
        // create (1x) + delete (1x): a schedule-less delete stays a plain action.
        assertEq(superToken.balanceOf(FEE_RECEIVER), 2 * BASE_FEE);
    }

    function testDeleteFlowRemovesScheduleRow() external {
        VmSafe.Wallet memory signer = _newSigner("delete-with-schedule");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        // Active flow + end-only schedule row, both created outside the macro so the only relay
        // fee in this test is the DeleteFlow one.
        vm.startPrank(signer.addr);
        superToken.createFlow(bob, DEFAULT_FLOW_RATE);
        flowScheduler.createFlowSchedule(superToken, bob, 0, 0, int96(0), 0, endDate, new bytes(0), new bytes(0));
        vm.stopPrank();

        bytes memory actionParams = dashboardClearMacro.encodeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: signer.addr, receiver: bob})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), 0);
        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.startDate, 0);
        assertEq(schedule.endDate, 0);
        // The schedule cleanup rides in the same relayed tx: still a plain 1x action.
        assertEq(superToken.balanceOf(FEE_RECEIVER), BASE_FEE);
    }

    function testDeleteFlowByReceiverKeepsSendersSchedule() external {
        VmSafe.Wallet memory sender = _newSigner("delete-by-receiver-sender");
        VmSafe.Wallet memory receiver = _newSigner("delete-by-receiver-receiver");
        _fundSuper(sender, 100e18);
        _fundSuper(receiver, 1e18); // fee funds

        uint32 endDate = uint32(block.timestamp + 30 days);
        vm.startPrank(sender.addr);
        superToken.createFlow(receiver.addr, DEFAULT_FLOW_RATE);
        flowScheduler.createFlowSchedule(
            superToken, receiver.addr, 0, 0, int96(0), 0, endDate, new bytes(0), new bytes(0)
        );
        vm.stopPrank();

        // CFA lets the receiver close an incoming flow; the sender's schedule row must survive,
        // as the macro only deletes the row when the signer IS the flow's sender.
        bytes memory actionParams = dashboardClearMacro.encodeDeleteFlow(
            LANG_EN,
            DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: sender.addr, receiver: receiver.addr})
        );
        _runAsProvider(receiver, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(sender.addr, receiver.addr), 0);
        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), sender.addr, receiver.addr);
        assertEq(schedule.endDate, endDate);
    }

    function testDeleteFlowRevertsWhenNoFlowEvenWithSchedule() external {
        VmSafe.Wallet memory signer = _newSigner("delete-no-flow");
        _fundSuper(signer, 1e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        vm.prank(signer.addr);
        flowScheduler.createFlowSchedule(superToken, bob, 0, 0, int96(0), 0, endDate, new bytes(0), new bytes(0));

        bytes memory actionParams = dashboardClearMacro.encodeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: signer.addr, receiver: bob})
        );
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        // The signed text promises to delete a flow; with none running the CFA deleteFlow reverts
        // and the whole action rolls back, leaving the schedule row untouched (a schedule-only
        // cancel has its own DeleteFlowSchedule action).
        vm.expectRevert();
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.endDate, endDate);
    }

    function testDeleteFlowExecutesAfterScheduleRemoved() external {
        VmSafe.Wallet memory signer = _newSigner("delete-schedule-race");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        vm.startPrank(signer.addr);
        superToken.createFlow(bob, DEFAULT_FLOW_RATE);
        flowScheduler.createFlowSchedule(superToken, bob, 0, 0, int96(0), 0, endDate, new bytes(0), new bytes(0));
        vm.stopPrank();

        // Sign while the schedule row exists...
        bytes memory actionParams = dashboardClearMacro.encodeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: signer.addr, receiver: bob})
        );
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        // ...then remove it before execution. The description (and thus the struct hash) is
        // state-independent, so the signature stays valid and only the flow deletion runs.
        vm.prank(signer.addr);
        flowScheduler.deleteFlowSchedule(superToken, bob, new bytes(0));

        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
        assertEq(superToken.getFlowRate(signer.addr, bob), 0);
    }

    function testUpgrade() external {
        VmSafe.Wallet memory signer = _newSigner("upgrade");
        _fundUnderlyingAndApprove(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeUpgrade(
            LANG_EN, DashboardClearMacro.UpgradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), DEFAULT_AMOUNT - BASE_FEE);
        assertEq(superToken.balanceOf(FEE_RECEIVER), BASE_FEE);
    }

    function testDowngrade() external {
        VmSafe.Wallet memory signer = _newSigner("downgrade");
        _fundSuper(signer, 1e18);

        bytes memory actionParams = dashboardClearMacro.encodeDowngrade(
            LANG_EN, DashboardClearMacro.DowngradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), 1e18 - DEFAULT_AMOUNT - BASE_FEE);
        assertEq(superToken.balanceOf(FEE_RECEIVER), BASE_FEE);
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

    // The common "unlimited approval" value must survive the whole path — describe, sign, execute —
    // since the formatter runs on the amount before signature verification.
    function testApproveUnlimited() external {
        VmSafe.Wallet memory signer = _newSigner("approve-unlimited");
        _fundSuper(signer, 1e18);

        DashboardClearMacro.ApproveParams memory params =
            DashboardClearMacro.ApproveParams({superToken: superToken, spender: bob, amount: type(uint256).max});
        string memory desc = dashboardClearMacro.describeApprove(LANG_EN, params);
        assertTrue(_contains(desc, "115792089237316195423570985008687907853269984665640564039457.58401"));

        bytes memory actionParams = dashboardClearMacro.encodeApprove(LANG_EN, params);
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.allowance(signer.addr, bob), type(uint256).max);
    }

    function testTransfer() external {
        VmSafe.Wallet memory signer = _newSigner("transfer");
        _fundSuper(signer, 1e18);
        uint256 bobBefore = superToken.balanceOf(bob);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), 1e18 - DEFAULT_AMOUNT - BASE_FEE);
        assertEq(superToken.balanceOf(bob), bobBefore + DEFAULT_AMOUNT);
        assertEq(superToken.balanceOf(FEE_RECEIVER), BASE_FEE);
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

        // New start+end schedule: setup + 2x per reserved keeper execution => 5x base fee.
        assertEq(superToken.balanceOf(FEE_RECEIVER), 5 * BASE_FEE);
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

        // New end-only schedule: setup + 2x for the reserved executeDeleteFlow => 3x base fee.
        assertEq(superToken.balanceOf(FEE_RECEIVER), 3 * BASE_FEE);
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

    function testScheduleFlowModifyLowerRateKeepsAllowance() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-lower-rate");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        _runAsProvider(signer, _scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate), 0, PROVIDER, 0, 0);
        uint256 feeAfterCreate = superToken.balanceOf(FEE_RECEIVER);

        // Lower the rate: the existing allowance already covers it, so no grant op is emitted at all
        // (permissionsToAdd == 0 and allowanceToAdd == 0) and the allowance is left untouched.
        int96 lowerRate = DEFAULT_FLOW_RATE / 2;
        _runAsProvider(signer, _scheduleParams(bob, startDate, lowerRate, endDate), 0, PROVIDER, 0, 0);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.flowRate, lowerRate);

        (, uint8 permissions, int96 flowRateAllowance) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissions), 5);
        assertEq(flowRateAllowance, DEFAULT_FLOW_RATE); // not reduced, not summed

        assertEq(superToken.balanceOf(FEE_RECEIVER) - feeAfterCreate, BASE_FEE); // modify => 1x
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

    function testScheduleFlowImmediateStart() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-immediate");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        _runAsProvider(signer, _scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate), 0, PROVIDER, 0, 0);

        // The flow is live immediately, without a keeper run.
        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);

        // The stored row is a plain end-only schedule (rate 0) — the same shape the dashboard's
        // direct batch stores for an end-only schedule.
        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.startDate, 0);
        assertEq(schedule.startMaxDelay, 0);
        assertEq(schedule.endDate, endDate);
        assertEq(schedule.flowRate, 0);
        assertEq(schedule.startAmount, 0);

        (, uint8 permissions, int96 flowRateAllowance) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissions), 4); // delete only — the immediate create runs as the signer
        assertEq(flowRateAllowance, 0);

        // New end-only schedule: setup (incl. the immediate create) + 2x for the reserved
        // executeDeleteFlow => 3x base fee.
        assertEq(superToken.balanceOf(FEE_RECEIVER), 3 * BASE_FEE);
    }

    function testScheduleFlowImmediateStartStopExecutesViaKeeper() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-immediate-exec");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        _runAsProvider(signer, _scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate), 0, PROVIDER, 0, 0);
        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);

        vm.warp(endDate);
        flowScheduler.executeDeleteFlow(superToken, signer.addr, bob, new bytes(0));

        assertEq(superToken.getFlowRate(signer.addr, bob), 0);
    }

    function testScheduleFlowImmediateStartSkipsGrantWhenFullControlAlready() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-immediate-full-control");
        _fundSuper(signer, 100e18);

        vm.prank(signer.addr);
        sf.host.callAgreement(
            sf.cfa,
            abi.encodeCall(
                sf.cfa.authorizeFlowOperatorWithFullControl, (superToken, address(flowScheduler), new bytes(0))
            ),
            new bytes(0)
        );

        // An unconditional additive grant would overflow the max allowance and revert here.
        uint32 endDate = uint32(block.timestamp + 30 days);
        _runAsProvider(signer, _scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate), 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);

        (, uint8 permissionsAfter, int96 allowanceAfter) =
            sf.cfa.getFlowOperatorData(superToken, signer.addr, address(flowScheduler));
        assertEq(uint256(permissionsAfter), 7);
        assertEq(allowanceAfter, type(int96).max);
    }

    function testScheduleFlowImmediateStartRevertsWhenFlowActive() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-immediate-active");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        bytes memory createActionParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        _runAsProvider(signer, createActionParams, 0, PROVIDER, 0, 0);

        // The signed text promises to START a stream; with one already running the CFA createFlow
        // reverts and the whole action must roll back.
        bytes memory actionParams = _scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate);
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert();
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);

        // Atomicity: the schedule row was not created either.
        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.endDate, 0);
    }

    function testScheduleFlowImmediateStartOnExistingScheduleChargesBaseOnly() external {
        VmSafe.Wallet memory signer = _newSigner("schedule-immediate-modify");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        // An end-only row created directly via the FlowScheduler (outside the macro) — no fee yet.
        vm.prank(signer.addr);
        flowScheduler.createFlowSchedule(superToken, bob, 0, 0, int96(0), 0, endDate, new bytes(0), new bytes(0));
        assertEq(superToken.balanceOf(FEE_RECEIVER), 0);

        // The row already exists => the quote and the charge are the 1x modify fee.
        bytes memory actionParams = _scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate);
        (,, uint256 currentFee, uint256 maxFee) = dashboardClearMacro.previewRelayFee(actionParams, signer.addr);
        assertEq(currentFee, BASE_FEE);
        assertEq(maxFee, 3 * BASE_FEE);

        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);
        assertEq(superToken.balanceOf(FEE_RECEIVER), BASE_FEE);
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

        // A stop-only schedule may carry a positive rate (immediate start) but never a negative one.
        bytes memory stopOnlyParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: -1,
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

        string memory feeReceiverHex = Strings.toHexString(uint256(uint160(FEE_RECEIVER)), 20);
        assertTrue(_contains(createDesc, "relay fee of"));
        assertTrue(_contains(createDesc, feeReceiverHex));

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
        assertTrue(_contains(deleteDesc, "if you are the sender, cancel any matching schedule"));

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
        assertTrue(_contains(scheduleDesc, "relay fee payable to"));
        assertTrue(_contains(scheduleDesc, "for a new schedule, or"));

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
        assertTrue(_contains(stopOnlyDesc, "for a new schedule, or"));

        string memory cancelDesc = dashboardClearMacro.describeDeleteFlowSchedule(
            LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
        );
        assertTrue(_contains(cancelDesc, "Cancel the scheduled stream"));
        assertTrue(_contains(cancelDesc, receiverHex));
    }

    // Separate from testEnglishDescriptionsForAllActions: one more local there is stack-too-deep.
    function testEnglishDescriptionImmediateStart() external view {
        string memory immediateDesc = dashboardClearMacro.describeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 1760000000
            })
        );
        assertTrue(_contains(immediateDesc, "Start a stream of"));
        assertTrue(_contains(immediateDesc, "immediately"));
        assertTrue(_contains(immediateDesc, "1760000000"));
        assertTrue(_contains(immediateDesc, "for a new schedule, or"));
    }

    // Exact-string checks: the action struct hash commits to this precise text (clear signing), and the
    // FeeNotRepresentable granularity guarantees the disclosed fee literal equals the amount charged.
    // BASE_FEE = 1e15 formats as "0.00100" (3x "0.00300", 5x "0.00500"); DEFAULT_FLOW_RATE as "0.10000"/day.

    function testCreateFlowDescriptionExact() external view {
        string memory desc = dashboardClearMacro.describeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        assertEq(
            desc,
            string.concat(
                "Create a new flow of 0.10000 ",
                superToken.symbol(),
                "/day to ",
                Strings.toHexString(uint256(uint160(bob)), 20),
                ", plus a relay fee of 0.00100 ",
                superToken.symbol(),
                " payable to ",
                Strings.toHexString(uint256(uint160(FEE_RECEIVER)), 20)
            )
        );
    }

    function testDeleteFlowDescriptionExact() external view {
        string memory desc = dashboardClearMacro.describeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: alice, receiver: bob})
        );
        assertEq(
            desc,
            string.concat(
                "Delete flow of ",
                superToken.symbol(),
                " from ",
                Strings.toHexString(uint256(uint160(alice)), 20),
                " to ",
                Strings.toHexString(uint256(uint160(bob)), 20),
                " and, if you are the sender, cancel any matching schedule for it",
                ", plus a relay fee of 0.00100 ",
                superToken.symbol(),
                " payable to ",
                Strings.toHexString(uint256(uint160(FEE_RECEIVER)), 20)
            )
        );
    }

    function testScheduleFlowDescriptionExactAllBranches() external view {
        string memory receiverHex = Strings.toHexString(uint256(uint160(bob)), 20);
        string memory feeReceiverHex = Strings.toHexString(uint256(uint160(FEE_RECEIVER)), 20);
        string memory sym = superToken.symbol();

        string memory bothDesc = dashboardClearMacro.describeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 1750000000,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 1760000000
            })
        );
        assertEq(
            bothDesc,
            string.concat(
                "Schedule a stream of 0.10000 ", sym, "/day to ", receiverHex,
                ", starting at 1750000000 and stopping at 1760000000 (unix time), and authorize the Flow Scheduler",
                ", plus a relay fee payable to ", feeReceiverHex,
                " of 0.00500 ", sym, " for a new schedule, or 0.00100 ", sym, " when modifying an existing schedule"
            )
        );

        string memory startOnlyDesc = dashboardClearMacro.describeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 1750000000,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 0
            })
        );
        assertEq(
            startOnlyDesc,
            string.concat(
                "Schedule a stream of 0.10000 ", sym, "/day to ", receiverHex,
                ", starting at 1750000000 (unix time), and authorize the Flow Scheduler",
                ", plus a relay fee payable to ", feeReceiverHex,
                " of 0.00300 ", sym, " for a new schedule, or 0.00100 ", sym, " when modifying an existing schedule"
            )
        );

        string memory endOnlyDesc = dashboardClearMacro.describeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: 0,
                endDate: 1760000000
            })
        );
        assertEq(
            endOnlyDesc,
            string.concat(
                "Schedule the stream of ", sym, " to ", receiverHex,
                " to stop at 1760000000 (unix time), and authorize the Flow Scheduler",
                ", plus a relay fee payable to ", feeReceiverHex,
                " of 0.00300 ", sym, " for a new schedule, or 0.00100 ", sym, " when modifying an existing schedule"
            )
        );

        string memory immediateDesc = dashboardClearMacro.describeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: 0,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 1760000000
            })
        );
        assertEq(
            immediateDesc,
            string.concat(
                "Start a stream of 0.10000 ", sym, "/day to ", receiverHex,
                " immediately, stopping at 1760000000 (unix time), and authorize the Flow Scheduler",
                ", plus a relay fee payable to ", feeReceiverHex,
                " of 0.00300 ", sym, " for a new schedule, or 0.00100 ", sym, " when modifying an existing schedule"
            )
        );
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
        DashboardClearMacro otherDashboardClearMacro =
            new DashboardClearMacro(sf.host, flowScheduler, superToken, BASE_FEE, FEE_RECEIVER);

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

    function testGetDigestRevertsOnTruncatedActionSpecificParams() external {
        address signer = _newSigner("truncated").addr;
        // CreateFlow params missing the flowRate field: decoding CreateFlowParams reverts inside the macro.
        bytes memory actionParams =
            abi.encode(uint8(DashboardClearMacro.ActionId.CreateFlow), LANG_EN, abi.encode(superToken, bob));
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer, 0), address(dashboardClearMacro)
        );

        vm.expectRevert(); // raw abi.decode failure carries no selector
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

    // ----------------------------------------------------------------------------------------------------
    //  Relay fee
    // ----------------------------------------------------------------------------------------------------

    function testRelayFeeChargedOnPlainAction() external {
        VmSafe.Wallet memory signer = _newSigner("fee-plain");
        _fundSuper(signer, 100e18);

        bytes memory actionParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        _runAsProvider(signer, actionParams, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);
        assertEq(superToken.balanceOf(FEE_RECEIVER), BASE_FEE); // plain action => 1x
    }

    function testNewScheduleChargesPerReservedTx() external {
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        // start-only reserves executeCreateFlow at 2x on top of the setup tx => 3x
        VmSafe.Wallet memory startSigner = _newSigner("fee-schedule-start");
        _fundSuper(startSigner, 100e18);
        bytes memory startOnly = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: 0
            })
        );
        _runAsProvider(startSigner, startOnly, 0, PROVIDER, 0, 0);
        assertEq(superToken.balanceOf(FEE_RECEIVER), 3 * BASE_FEE);

        // start+end reserves both keeper executions at 2x each => 5x (fresh schedule row for a different sender)
        VmSafe.Wallet memory bothSigner = _newSigner("fee-schedule-both");
        _fundSuper(bothSigner, 100e18);
        uint256 balanceBefore = superToken.balanceOf(FEE_RECEIVER);
        bytes memory both = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: endDate
            })
        );
        _runAsProvider(bothSigner, both, 0, PROVIDER, 0, 0);
        assertEq(superToken.balanceOf(FEE_RECEIVER) - balanceBefore, 5 * BASE_FEE);
    }

    function testModifyScheduleChargesBaseOnly() external {
        VmSafe.Wallet memory signer = _newSigner("fee-modify");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        _runAsProvider(
            signer,
            dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: startDate,
                    flowRate: DEFAULT_FLOW_RATE,
                    endDate: endDate
                })
            ),
            0,
            PROVIDER,
            0,
            0
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER), 5 * BASE_FEE); // new start+end

        // Move the end date later. The row already exists, so only the setup tx is charged (1x): the fee
        // is not re-applied for a modification.
        uint32 newEndDate = uint32(block.timestamp + 60 days);
        _runAsProvider(
            signer,
            dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: startDate,
                    flowRate: DEFAULT_FLOW_RATE,
                    endDate: newEndDate
                })
            ),
            0,
            PROVIDER,
            0,
            0
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER), 6 * BASE_FEE); // 5x + 1x modify

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.endDate, newEndDate);
    }

    function testModifyAddingDateChargesBaseOnly() external {
        // Documented simplification: an existing row is 1x even when the modify adds a previously-absent date.
        VmSafe.Wallet memory signer = _newSigner("fee-modify-add");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        _runAsProvider(
            signer,
            dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: 0,
                    flowRate: 0,
                    endDate: endDate
                })
            ),
            0,
            PROVIDER,
            0,
            0
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER), 3 * BASE_FEE); // new end-only

        uint32 startDate = uint32(block.timestamp + 1 days);
        _runAsProvider(
            signer,
            dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: startDate,
                    flowRate: DEFAULT_FLOW_RATE,
                    endDate: endDate
                })
            ),
            0,
            PROVIDER,
            0,
            0
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER), 4 * BASE_FEE); // 3x + 1x modify (not surcharged)
    }

    function testDeleteThenRecreateChargesFullFee() external {
        VmSafe.Wallet memory signer = _newSigner("fee-delete-recreate");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        bytes memory scheduleParams = dashboardClearMacro.encodeScheduleFlow(
            LANG_EN,
            DashboardClearMacro.ScheduleFlowParams({
                superToken: superToken,
                receiver: bob,
                startDate: startDate,
                flowRate: DEFAULT_FLOW_RATE,
                endDate: endDate
            })
        );
        _runAsProvider(signer, scheduleParams, 0, PROVIDER, 0, 0);
        assertEq(superToken.balanceOf(FEE_RECEIVER), 5 * BASE_FEE);

        _runAsProvider(
            signer,
            dashboardClearMacro.encodeDeleteFlowSchedule(
                LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
            ),
            0,
            PROVIDER,
            0,
            0
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER), 6 * BASE_FEE); // cancel => 1x

        // Row was cleared, so recreating is a new schedule again => full 5x.
        _runAsProvider(signer, scheduleParams, 0, PROVIDER, 0, 0);
        assertEq(superToken.balanceOf(FEE_RECEIVER), 11 * BASE_FEE);
    }

    function testDirectScheduleThenMacroModifyChargesBaseOnly() external {
        VmSafe.Wallet memory signer = _newSigner("fee-direct");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        // Create a schedule directly via the FlowScheduler (outside the macro) — no macro fee is charged.
        vm.prank(signer.addr);
        flowScheduler.createFlowSchedule(
            superToken, bob, startDate, uint32(1 days), DEFAULT_FLOW_RATE, 0, endDate, new bytes(0), new bytes(0)
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER), 0);

        // Modify via the macro: the row already exists => only 1x is charged.
        _runAsProvider(
            signer,
            dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: startDate,
                    flowRate: DEFAULT_FLOW_RATE,
                    endDate: endDate
                })
            ),
            0,
            PROVIDER,
            0,
            0
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER), BASE_FEE);
    }

    function testCancelScheduleChargesBase() external {
        VmSafe.Wallet memory signer = _newSigner("fee-cancel");
        _fundSuper(signer, 100e18);
        uint32 endDate = uint32(block.timestamp + 30 days);

        _runAsProvider(
            signer,
            dashboardClearMacro.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: 0,
                    flowRate: 0,
                    endDate: endDate
                })
            ),
            0,
            PROVIDER,
            0,
            0
        );
        uint256 balanceBefore = superToken.balanceOf(FEE_RECEIVER);

        _runAsProvider(
            signer,
            dashboardClearMacro.encodeDeleteFlowSchedule(
                LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
            ),
            0,
            PROVIDER,
            0,
            0
        );
        assertEq(superToken.balanceOf(FEE_RECEIVER) - balanceBefore, BASE_FEE); // cancel => 1x
    }

    function testFeelessInstance() external {
        DashboardClearMacro feeless =
            new DashboardClearMacro(sf.host, flowScheduler, ISuperToken(address(0)), 0, address(0));

        VmSafe.Wallet memory signer = _newSigner("feeless");
        _fundSuper(signer, 100e18);
        uint256 balanceBefore = superToken.balanceOf(FEE_RECEIVER);

        bytes memory actionParams = feeless.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        _runAsProviderOn(feeless, signer, actionParams);

        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);
        assertEq(superToken.balanceOf(FEE_RECEIVER), balanceBefore); // no fee charged

        // Feeless descriptions carry no fee clause.
        string memory desc = feeless.describeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        assertFalse(_contains(desc, "relay fee"));
    }

    function testPreviewRelayFeePlainAction() external view {
        bytes memory createParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        (ISuperToken feeToken, address feeReceiver, uint256 currentFee, uint256 maxFee) =
            dashboardClearMacro.previewRelayFee(createParams, alice);
        assertEq(address(feeToken), address(superToken));
        assertEq(feeReceiver, FEE_RECEIVER);
        assertEq(currentFee, BASE_FEE); // plain action => 1x, current == max
        assertEq(maxFee, BASE_FEE);
    }

    function testPreviewRelayFeeDeleteFlowWithScheduleStaysFlat() external {
        VmSafe.Wallet memory signer = _newSigner("preview-delete");
        _fundSuper(signer, 1e18);
        uint32 endDate = uint32(block.timestamp + 30 days);
        vm.prank(signer.addr);
        flowScheduler.createFlowSchedule(superToken, bob, 0, 0, int96(0), 0, endDate, new bytes(0), new bytes(0));

        // The schedule cleanup rides in the same relayed tx, so DeleteFlow stays a flat 1x quote
        // even when a schedule row exists for the signer.
        bytes memory actionParams = dashboardClearMacro.encodeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: signer.addr, receiver: bob})
        );
        (,, uint256 currentFee, uint256 maxFee) = dashboardClearMacro.previewRelayFee(actionParams, signer.addr);
        assertEq(currentFee, BASE_FEE);
        assertEq(maxFee, BASE_FEE);
    }

    function testPreviewRelayFeeNewSchedule() external view {
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        bytes memory bothParams = _scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate);
        (,, uint256 currentFee, uint256 maxFee) = dashboardClearMacro.previewRelayFee(bothParams, alice);
        assertEq(currentFee, 5 * BASE_FEE); // new start+end => 5x
        assertEq(maxFee, 5 * BASE_FEE);

        bytes memory endOnlyParams = _scheduleParams(bob, 0, 0, endDate);
        (,, currentFee, maxFee) = dashboardClearMacro.previewRelayFee(endOnlyParams, alice);
        assertEq(currentFee, 3 * BASE_FEE); // new end-only => 3x
        assertEq(maxFee, 3 * BASE_FEE);

        bytes memory startOnlyParams = _scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, 0);
        (,, currentFee, maxFee) = dashboardClearMacro.previewRelayFee(startOnlyParams, alice);
        assertEq(currentFee, 3 * BASE_FEE); // new start-only => 3x
        assertEq(maxFee, 3 * BASE_FEE);

        bytes memory immediateParams = _scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate);
        (,, currentFee, maxFee) = dashboardClearMacro.previewRelayFee(immediateParams, alice);
        assertEq(currentFee, 3 * BASE_FEE); // immediate start + end: the create rides in the setup tx => 3x
        assertEq(maxFee, 3 * BASE_FEE);
    }

    function testPreviewRelayFeeModify() external {
        VmSafe.Wallet memory signer = _newSigner("preview-modify");
        _fundSuper(signer, 100e18);
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);
        bytes memory scheduleParams = _scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate);

        _runAsProvider(signer, scheduleParams, 0, PROVIDER, 0, 0);

        // Row now exists => a re-quote for the same signer is a modify: current 1x, max stays 5x.
        (,, uint256 currentFee, uint256 maxFee) = dashboardClearMacro.previewRelayFee(scheduleParams, signer.addr);
        assertEq(currentFee, BASE_FEE);
        assertEq(maxFee, 5 * BASE_FEE);
    }

    function testPreviewRelayFeeFeelessInstance() external {
        DashboardClearMacro feeless =
            new DashboardClearMacro(sf.host, flowScheduler, ISuperToken(address(0)), 0, address(0));
        bytes memory createParams = dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
        (ISuperToken feeToken,, uint256 currentFee, uint256 maxFee) = feeless.previewRelayFee(createParams, alice);
        assertEq(address(feeToken), address(0));
        assertEq(currentFee, 0);
        assertEq(maxFee, 0);
    }

    function testPreviewRelayFeeRevertsOnUnknownAction() external {
        bytes memory unknownParams = abi.encode(UNKNOWN_ACTION_ID, LANG_EN, abi.encode(superToken, bob, DEFAULT_AMOUNT));
        vm.expectRevert(abi.encodeWithSelector(ClearMacroBase.UnknownActionId.selector, UNKNOWN_ACTION_ID));
        dashboardClearMacro.previewRelayFee(unknownParams, alice);
    }

    function testPreviewRelayFeeRevertsOnMalformedActionParams() external {
        vm.expectRevert(); // raw abi.decode failure carries no selector
        dashboardClearMacro.previewRelayFee(hex"deadbeef", alice);
    }

    function testConstructorRejectsUnrepresentableFee() external {
        vm.expectRevert(DashboardClearMacro.FeeNotRepresentable.selector);
        new DashboardClearMacro(sf.host, flowScheduler, superToken, 1e13 + 1, FEE_RECEIVER);
    }

    function testConstructorAcceptsMinimumRepresentableFee() external {
        DashboardClearMacro minimal = new DashboardClearMacro(sf.host, flowScheduler, superToken, 1e13, FEE_RECEIVER);
        assertEq(minimal.baseFee(), 1e13);
    }

    function testConstructorRejectsFeeAboveMaximum() external {
        vm.expectRevert(DashboardClearMacro.FeeTooHigh.selector);
        new DashboardClearMacro(sf.host, flowScheduler, superToken, 10e18 + 1e13, FEE_RECEIVER);
    }

    function testConstructorAcceptsMaximumFee() external {
        DashboardClearMacro maximal = new DashboardClearMacro(sf.host, flowScheduler, superToken, 10e18, FEE_RECEIVER);
        assertEq(maximal.baseFee(), 10e18);
    }

    function testConstructorRejectsZeroFlowScheduler() external {
        vm.expectRevert(DashboardClearMacro.ZeroAddress.selector);
        new DashboardClearMacro(sf.host, IFlowScheduler(address(0)), superToken, BASE_FEE, FEE_RECEIVER);
    }

    function testConstructorRejectsFeeConfigWithZeroFeeToken() external {
        vm.expectRevert(DashboardClearMacro.ZeroAddress.selector);
        new DashboardClearMacro(sf.host, flowScheduler, ISuperToken(address(0)), BASE_FEE, FEE_RECEIVER);
    }

    function testConstructorRejectsFeeConfigWithZeroFeeReceiver() external {
        vm.expectRevert(DashboardClearMacro.ZeroAddress.selector);
        new DashboardClearMacro(sf.host, flowScheduler, superToken, BASE_FEE, address(0));
    }

    function testFeeGetters() external {
        assertEq(address(dashboardClearMacro.feeToken()), address(superToken));
        assertEq(dashboardClearMacro.baseFee(), BASE_FEE);

        DashboardClearMacro feeless =
            new DashboardClearMacro(sf.host, flowScheduler, ISuperToken(address(0)), 0, address(0));
        assertEq(address(feeless.feeToken()), address(0));
        assertEq(feeless.baseFee(), 0);
    }

    function testInsufficientFeeRevertsOnApprove() external {
        // Approve needs no balance of its own, so only the fee transfer can fail — isolates fee enforcement.
        VmSafe.Wallet memory signer = _newSigner("fee-insufficient-approve");
        _fundSuper(signer, BASE_FEE / 2);

        bytes memory actionParams = dashboardClearMacro.encodeApprove(
            LANG_EN, DashboardClearMacro.ApproveParams({superToken: superToken, spender: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert();
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
        assertEq(superToken.allowance(signer.addr, bob), 0); // atomic: nothing persisted
    }

    function testInsufficientFeeRevertsOnTransfer() external {
        VmSafe.Wallet memory signer = _newSigner("fee-insufficient-transfer");
        _fundSuper(signer, DEFAULT_AMOUNT); // enough to transfer, not enough to also pay the fee
        uint256 bobBefore = superToken.balanceOf(bob);

        bytes memory actionParams = dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert();
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);
        assertEq(superToken.balanceOf(bob), bobBefore); // atomic: transfer rolled back
    }

    function testInsufficientFeeRevertsOnSchedule() external {
        VmSafe.Wallet memory signer = _newSigner("fee-insufficient-schedule");
        _fundSuper(signer, BASE_FEE); // < 5x needed for a new start+end schedule
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
        bytes memory encodedPayload = _getEncodedPayload(
            actionParams, PROVIDER, 0, 0, forwarder.getNonce(signer.addr, 0), address(dashboardClearMacro)
        );
        bytes memory sig = _signEncodedPayload(signer, encodedPayload);

        vm.expectRevert();
        forwarder.runMacro(dashboardClearMacro, encodedPayload, signer.addr, sig);

        IFlowScheduler.FlowSchedule memory schedule =
            flowScheduler.getFlowSchedule(address(superToken), signer.addr, bob);
        assertEq(schedule.startDate, 0); // atomic: no schedule created
        assertEq(schedule.endDate, 0);
    }

}
