// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {
    ISuperfluid,
    ISuperToken,
    BatchOperation
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {ClearMacroBase} from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroBase.sol";
import {
    IFlowScheduler
} from "@superfluid-finance/automation-contracts/scheduler/contracts/interface/IFlowScheduler.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";
import {DashboardClearMacroTestBase} from "./DashboardClearMacroTestBase.t.sol";

/// Composition-level suite: asserts the exact ISuperfluid.Operation[] each action builds, via the
/// external view `buildBatchOperations` — operation types, targets, and byte-exact calldata —
/// without executing anything. Execution effects (CFA, FlowScheduler, keeper runs) are framework
/// behavior covered end-to-end in DashboardClearMacro.t.sol.
contract DashboardClearMacroCompositionTest is DashboardClearMacroTestBase {
    uint32 internal constant START_MAX_DELAY = 1 days;
    uint8 internal constant ACL_CREATE = 1;
    uint8 internal constant ACL_DELETE = 4;

    address internal constant SIGNER = address(0x516);

    function _buildOps(bytes memory actionParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory)
    {
        return dashboardClearMacro.buildBatchOperations(sf.host, actionParams, account);
    }

    function _assertOp(ISuperfluid.Operation memory op, uint32 operationType, address target, bytes memory data)
        internal
        pure
    {
        assertEq(op.operationType, operationType);
        assertEq(op.target, target);
        assertEq(op.data, data);
    }

    // The fee op _appendFee builds: a self-spend ERC20 transferFrom of the fee token from the signer.
    function _assertFeeOp(ISuperfluid.Operation memory op, address account, uint256 feeUnits) internal view {
        _assertOp(
            op,
            BatchOperation.OPERATION_TYPE_ERC20_TRANSFER_FROM,
            address(superToken),
            abi.encode(account, FEE_RECEIVER, feeUnits * BASE_FEE)
        );
    }

    // CALL_AGREEMENT operation data is the agreement calldata wrapped with empty userData.
    function _agreementData(bytes memory callData) internal pure returns (bytes memory) {
        return abi.encode(callData, new bytes(0));
    }

    function _grantOpData(uint8 permissionsToAdd, int96 allowanceToAdd) internal view returns (bytes memory) {
        return _agreementData(
            abi.encodeCall(
                sf.cfa.increaseFlowRateAllowanceWithPermissions,
                (superToken, address(flowScheduler), permissionsToAdd, allowanceToAdd, new bytes(0))
            )
        );
    }

    function _createFlowScheduleData(uint32 startDate, uint32 startMaxDelay, int96 flowRate, uint32 endDate)
        internal
        view
        returns (bytes memory)
    {
        return abi.encodeCall(
            IFlowScheduler.createFlowSchedule,
            (superToken, bob, startDate, startMaxDelay, flowRate, uint256(0), endDate, new bytes(0), new bytes(0))
        );
    }

    function _deleteFlowScheduleData(address receiver) internal view returns (bytes memory) {
        return abi.encodeCall(IFlowScheduler.deleteFlowSchedule, (superToken, receiver, new bytes(0)));
    }

    // ----------------------------------------------------------------------------------------------------
    //  Single-operation actions: [coreOp, feeOp]
    // ----------------------------------------------------------------------------------------------------

    function testCreateFlow() external view {
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeCreateFlow(
                LANG_EN,
                DashboardClearMacro.CreateFlowParams({
                    superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE
                })
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.createFlow, (superToken, bob, DEFAULT_FLOW_RATE, new bytes(0))))
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    function testUpdateFlow() external view {
        int96 newRate = DEFAULT_FLOW_RATE * 2;
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeUpdateFlow(
                LANG_EN,
                DashboardClearMacro.UpdateFlowParams({superToken: superToken, receiver: bob, flowRate: newRate})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.updateFlow, (superToken, bob, newRate, new bytes(0))))
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    function testUpgrade() external view {
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeUpgrade(
                LANG_EN, DashboardClearMacro.UpgradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0], BatchOperation.OPERATION_TYPE_SUPERTOKEN_UPGRADE, address(superToken), abi.encode(DEFAULT_AMOUNT)
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    function testDowngrade() external view {
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeDowngrade(
                LANG_EN, DashboardClearMacro.DowngradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0], BatchOperation.OPERATION_TYPE_SUPERTOKEN_DOWNGRADE, address(superToken), abi.encode(DEFAULT_AMOUNT)
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    function testApprove() external view {
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeApprove(
                LANG_EN,
                DashboardClearMacro.ApproveParams({superToken: superToken, spender: bob, amount: DEFAULT_AMOUNT})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0], BatchOperation.OPERATION_TYPE_ERC20_APPROVE, address(superToken), abi.encode(bob, DEFAULT_AMOUNT)
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    function testTransfer() external view {
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeTransfer(
                LANG_EN,
                DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        // The signer is the from-address: the batch runs with them as msg.sender (self-spend, no allowance).
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_ERC20_TRANSFER_FROM,
            address(superToken),
            abi.encode(SIGNER, bob, DEFAULT_AMOUNT)
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    function testDeleteFlowSchedule() external view {
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeDeleteFlowSchedule(
                LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _deleteFlowScheduleData(bob)
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    // ----------------------------------------------------------------------------------------------------
    //  DeleteFlow: conditional schedule cleanup
    // ----------------------------------------------------------------------------------------------------

    function testDeleteFlowWithoutSchedule() external view {
        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeDeleteFlow(
                LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: SIGNER, receiver: bob})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.deleteFlow, (superToken, SIGNER, bob, new bytes(0))))
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    function testDeleteFlowWithScheduleAppendsCancel() external {
        vm.prank(SIGNER);
        flowScheduler.createFlowSchedule(
            superToken, bob, 0, 0, int96(0), 0, uint32(block.timestamp + 30 days), new bytes(0), new bytes(0)
        );

        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeDeleteFlow(
                LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: SIGNER, receiver: bob})
            ),
            SIGNER
        );

        assertEq(ops.length, 3);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.deleteFlow, (superToken, SIGNER, bob, new bytes(0))))
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _deleteFlowScheduleData(bob)
        );
        _assertFeeOp(ops[2], SIGNER, 1); // cleanup rides in the same tx: still 1x
    }

    function testDeleteFlowByReceiverOmitsCancel() external {
        // The sender's row exists, but the signer is the receiver: the FlowScheduler would resolve
        // the row's sender from the batch signer, so no cleanup op may be composed.
        vm.prank(alice);
        flowScheduler.createFlowSchedule(
            superToken, SIGNER, 0, 0, int96(0), 0, uint32(block.timestamp + 30 days), new bytes(0), new bytes(0)
        );

        ISuperfluid.Operation[] memory ops = _buildOps(
            dashboardClearMacro.encodeDeleteFlow(
                LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: alice, receiver: SIGNER})
            ),
            SIGNER
        );

        assertEq(ops.length, 2);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.deleteFlow, (superToken, alice, SIGNER, new bytes(0))))
        );
        _assertFeeOp(ops[1], SIGNER, 1);
    }

    // ----------------------------------------------------------------------------------------------------
    //  ScheduleFlow: grant diffing, schedule row shape, immediate start, fee multiplier
    // ----------------------------------------------------------------------------------------------------

    function testScheduleFlowStartAndEnd() external view {
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        ISuperfluid.Operation[] memory ops =
            _buildOps(_scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate), SIGNER);

        assertEq(ops.length, 3);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(ACL_CREATE | ACL_DELETE, DEFAULT_FLOW_RATE)
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(startDate, START_MAX_DELAY, DEFAULT_FLOW_RATE, endDate)
        );
        _assertFeeOp(ops[2], SIGNER, 5); // setup + both reserved keeper executions at 2x each
    }

    function testScheduleFlowStartOnly() external view {
        uint32 startDate = uint32(block.timestamp + 1 days);

        ISuperfluid.Operation[] memory ops = _buildOps(_scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, 0), SIGNER);

        assertEq(ops.length, 3);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(ACL_CREATE, DEFAULT_FLOW_RATE)
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(startDate, START_MAX_DELAY, DEFAULT_FLOW_RATE, 0)
        );
        _assertFeeOp(ops[2], SIGNER, 3); // setup + reserved executeCreateFlow at 2x
    }

    function testScheduleFlowEndOnly() external view {
        uint32 endDate = uint32(block.timestamp + 30 days);

        ISuperfluid.Operation[] memory ops = _buildOps(_scheduleParams(bob, 0, 0, endDate), SIGNER);

        assertEq(ops.length, 3);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(ACL_DELETE, 0)
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(0, 0, 0, endDate)
        );
        _assertFeeOp(ops[2], SIGNER, 3); // setup + reserved executeDeleteFlow at 2x
    }

    function testScheduleFlowImmediateStart() external view {
        uint32 endDate = uint32(block.timestamp + 30 days);

        ISuperfluid.Operation[] memory ops = _buildOps(_scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate), SIGNER);

        // Grant (delete-only), end-only schedule row, plus the immediate createFlow run as the signer.
        assertEq(ops.length, 4);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(ACL_DELETE, 0)
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(0, 0, 0, endDate)
        );
        _assertOp(
            ops[2],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.createFlow, (superToken, bob, DEFAULT_FLOW_RATE, new bytes(0))))
        );
        _assertFeeOp(ops[3], SIGNER, 3); // the immediate create rides in the setup tx; the stop reserves 2x
    }

    function testScheduleFlowOmitsGrantWhenFullControl() external {
        vm.prank(SIGNER);
        sf.host
            .callAgreement(
                sf.cfa,
                abi.encodeCall(
                    sf.cfa.authorizeFlowOperatorWithFullControl, (superToken, address(flowScheduler), new bytes(0))
                ),
                new bytes(0)
            );

        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);
        ISuperfluid.Operation[] memory ops =
            _buildOps(_scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate), SIGNER);

        assertEq(ops.length, 2); // no grant op composed at all
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(startDate, START_MAX_DELAY, DEFAULT_FLOW_RATE, endDate)
        );
        _assertFeeOp(ops[1], SIGNER, 5); // still a new schedule row: full reservation
    }

    function testScheduleFlowImmediateStartOmitsGrantWhenFullControl() external {
        vm.prank(SIGNER);
        sf.host
            .callAgreement(
                sf.cfa,
                abi.encodeCall(
                    sf.cfa.authorizeFlowOperatorWithFullControl, (superToken, address(flowScheduler), new bytes(0))
                ),
                new bytes(0)
            );

        uint32 endDate = uint32(block.timestamp + 30 days);
        ISuperfluid.Operation[] memory ops = _buildOps(_scheduleParams(bob, 0, DEFAULT_FLOW_RATE, endDate), SIGNER);

        assertEq(ops.length, 3); // [schedule, createFlow, fee] — no grant op
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(0, 0, 0, endDate)
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.createFlow, (superToken, bob, DEFAULT_FLOW_RATE, new bytes(0))))
        );
        _assertFeeOp(ops[2], SIGNER, 3); // end-only reservation at 2x; the immediate create rides in the setup tx
    }

    function testScheduleFlowGrantsOnlyMissingPermissionsAndAllowanceDelta() external {
        int96 preAllowance = DEFAULT_FLOW_RATE / 2;
        vm.prank(SIGNER);
        sf.host
            .callAgreement(
                sf.cfa,
                abi.encodeCall(
                    sf.cfa.increaseFlowRateAllowanceWithPermissions,
                    (superToken, address(flowScheduler), ACL_CREATE, preAllowance, new bytes(0))
                ),
                new bytes(0)
            );

        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);
        ISuperfluid.Operation[] memory ops =
            _buildOps(_scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate), SIGNER);

        assertEq(ops.length, 3);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(ACL_DELETE, DEFAULT_FLOW_RATE - preAllowance) // only the shortfall
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(startDate, START_MAX_DELAY, DEFAULT_FLOW_RATE, endDate)
        );
        _assertFeeOp(ops[2], SIGNER, 5);
    }

    function testScheduleFlowGrantsAllowanceOnlyDelta() external {
        // Permissions already fully cover the request; only the allowance falls short, so the
        // grant op must carry zero permission bits and just the allowance delta.
        int96 preAllowance = DEFAULT_FLOW_RATE / 2;
        vm.prank(SIGNER);
        sf.host
            .callAgreement(
                sf.cfa,
                abi.encodeCall(
                    sf.cfa.increaseFlowRateAllowanceWithPermissions,
                    (superToken, address(flowScheduler), ACL_CREATE | ACL_DELETE, preAllowance, new bytes(0))
                ),
                new bytes(0)
            );

        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);
        ISuperfluid.Operation[] memory ops =
            _buildOps(_scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate), SIGNER);

        assertEq(ops.length, 3);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(0, DEFAULT_FLOW_RATE - preAllowance)
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(startDate, START_MAX_DELAY, DEFAULT_FLOW_RATE, endDate)
        );
        _assertFeeOp(ops[2], SIGNER, 5);
    }

    function testScheduleFlowModifyChargesBaseFeeOnly() external {
        uint32 endDate = uint32(block.timestamp + 30 days);
        vm.prank(SIGNER);
        flowScheduler.createFlowSchedule(superToken, bob, 0, 0, int96(0), 0, endDate, new bytes(0), new bytes(0));

        uint32 startDate = uint32(block.timestamp + 1 days);
        ISuperfluid.Operation[] memory ops =
            _buildOps(_scheduleParams(bob, startDate, DEFAULT_FLOW_RATE, endDate), SIGNER);

        // Same core ops as a new schedule (no operator grant exists yet), but the row exists =>
        // the fee drops to the 1x modify rate.
        assertEq(ops.length, 3);
        _assertOp(
            ops[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(ACL_CREATE | ACL_DELETE, DEFAULT_FLOW_RATE)
        );
        _assertOp(
            ops[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(startDate, START_MAX_DELAY, DEFAULT_FLOW_RATE, endDate)
        );
        _assertFeeOp(ops[2], SIGNER, 1);
    }

    function testScheduleFlowRevertsWithoutDates() external {
        bytes memory actionParams = _scheduleParams(bob, 0, DEFAULT_FLOW_RATE, 0);
        vm.expectRevert(DashboardClearMacro.InvalidTimeWindow.selector);
        dashboardClearMacro.buildBatchOperations(sf.host, actionParams, SIGNER);
    }

    function testScheduleFlowRevertsOnBadRate() external {
        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);

        int96[2] memory badStartRates = [int96(0), int96(-1)];
        for (uint256 i = 0; i < badStartRates.length; ++i) {
            bytes memory actionParams = _scheduleParams(bob, startDate, badStartRates[i], endDate);
            vm.expectRevert(DashboardClearMacro.InvalidFlowRate.selector);
            dashboardClearMacro.buildBatchOperations(sf.host, actionParams, SIGNER);
        }

        // A stop-only schedule may carry a positive rate (immediate start) but never a negative one.
        bytes memory stopOnlyParams = _scheduleParams(bob, 0, -1, endDate);
        vm.expectRevert(DashboardClearMacro.InvalidFlowRate.selector);
        dashboardClearMacro.buildBatchOperations(sf.host, stopOnlyParams, SIGNER);
    }

    // ----------------------------------------------------------------------------------------------------
    //  Fee append behavior
    // ----------------------------------------------------------------------------------------------------

    function testFeelessOmitsFeeOperation() external {
        DashboardClearMacro feeless =
            new DashboardClearMacro(sf.host, flowScheduler, ISuperToken(address(0)), 0, address(0));

        ISuperfluid.Operation[] memory createOps = feeless.buildBatchOperations(
            sf.host,
            feeless.encodeCreateFlow(
                LANG_EN,
                DashboardClearMacro.CreateFlowParams({
                    superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE
                })
            ),
            SIGNER
        );
        assertEq(createOps.length, 1);
        _assertOp(
            createOps[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _agreementData(abi.encodeCall(sf.cfa.createFlow, (superToken, bob, DEFAULT_FLOW_RATE, new bytes(0))))
        );

        uint32 startDate = uint32(block.timestamp + 1 days);
        uint32 endDate = uint32(block.timestamp + 30 days);
        ISuperfluid.Operation[] memory scheduleOps = feeless.buildBatchOperations(
            sf.host,
            feeless.encodeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: startDate,
                    flowRate: DEFAULT_FLOW_RATE,
                    endDate: endDate
                })
            ),
            SIGNER
        );
        assertEq(scheduleOps.length, 2); // no fee op
        _assertOp(
            scheduleOps[0],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            address(sf.cfa),
            _grantOpData(ACL_CREATE | ACL_DELETE, DEFAULT_FLOW_RATE)
        );
        _assertOp(
            scheduleOps[1],
            BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            address(flowScheduler),
            _createFlowScheduleData(startDate, START_MAX_DELAY, DEFAULT_FLOW_RATE, endDate)
        );
    }

    function testRevertsOnUnknownActionId() external {
        bytes memory actionParams = abi.encode(UNKNOWN_ACTION_ID, LANG_EN, abi.encode(superToken, bob, DEFAULT_AMOUNT));
        vm.expectRevert(abi.encodeWithSelector(ClearMacroBase.UnknownActionId.selector, UNKNOWN_ACTION_ID));
        dashboardClearMacro.buildBatchOperations(sf.host, actionParams, SIGNER);
    }
}
