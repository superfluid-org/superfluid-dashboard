// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.26;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {
    ISuperfluid,
    BatchOperation,
    IERC20Metadata
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/superfluid/SuperToken.sol";
import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

import {ClearMacroBase} from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroBase.sol";
import {
    IFlowScheduler
} from "@superfluid-finance/automation-contracts/scheduler/contracts/interface/IFlowScheduler.sol";
import {FlowRateFormatter, AmountFormatter} from "./FormatterLibs.sol";

using SuperTokenV1Library for ISuperToken;
using FlowRateFormatter for int96;
using AmountFormatter for uint256;

/**
 * @title DashboardClearMacro
 * @dev ClearMacro for dashboard operations (CFA flows, upgrade/downgrade, approve, transfer,
 *      flow scheduling via the FlowScheduler automation contract).
 *
 * Wire format for `Payload.action.params` (`actionParams`):
 * `abi.encode(uint8 actionId, bytes32 lang, bytes actionSpecificParams)`.
 */
contract DashboardClearMacro is ClearMacroBase {
    enum ActionId {
        _reserved,
        CreateFlow,
        UpdateFlow,
        DeleteFlow,
        Upgrade,
        Downgrade,
        Approve,
        Transfer,
        ScheduleFlow,
        DeleteFlowSchedule
    }

    error InvalidTimeWindow();
    error InvalidFlowRate();
    error ZeroAddress();
    error FeeNotRepresentable();
    error FeeTooHigh();

    bytes32 private constant _LANG_EN = bytes32("en");

    string private constant _TYPEDEF_CREATE_FLOW =
        "Action(string description,address token,address receiver,int96 flowRate)";
    string private constant _TYPEDEF_UPDATE_FLOW =
        "Action(string description,address token,address receiver,int96 flowRate)";
    string private constant _TYPEDEF_DELETE_FLOW =
        "Action(string description,address token,address sender,address receiver)";
    string private constant _TYPEDEF_UPGRADE = "Action(string description,address token,uint256 amount)";
    string private constant _TYPEDEF_DOWNGRADE = "Action(string description,address token,uint256 amount)";
    string private constant _TYPEDEF_APPROVE =
        "Action(string description,address token,address spender,uint256 amount)";
    string private constant _TYPEDEF_TRANSFER =
        "Action(string description,address token,address receiver,uint256 amount)";
    string private constant _TYPEDEF_SCHEDULE_FLOW =
        "Action(string description,address token,address receiver,uint32 startDate,int96 flowRate,uint32 endDate)";
    string private constant _TYPEDEF_DELETE_FLOW_SCHEDULE = "Action(string description,address token,address receiver)";

    /// Upper bound for the base fee: 10 whole fee SuperTokens (always 18 decimals). Any sane relay fee
    /// is far below this; the cap turns a fee misconfiguration into an immediate deploy failure.
    uint256 private constant _MAX_BASE_FEE = 10e18;

    /// How long after `startDate` the keeper may still execute the scheduled start (dashboard default).
    uint32 private constant _START_MAX_DELAY = 1 days;
    uint8 private constant _ACL_CREATE = 1;
    uint8 private constant _ACL_DELETE = 4;

    IConstantFlowAgreementV1 internal immutable _cfa;
    IFlowScheduler internal immutable _flowScheduler;

    // Relay fee configuration. A fee of `_baseFeeAmount * feeUnits` is charged in `_feeSuperToken` to
    // `_feeReceiver` on every action: 1 unit for the relayed transaction itself, plus 2 units per keeper
    // execution a new schedule reserves (so 3 with one scheduled date, 5 with both). Zero => feeless.
    ISuperToken internal immutable _feeSuperToken;
    uint256 internal immutable _baseFeeAmount;
    address internal immutable _feeReceiver;

    struct CreateFlowParams {
        ISuperToken superToken;
        address receiver;
        int96 flowRate;
    }

    struct UpdateFlowParams {
        ISuperToken superToken;
        address receiver;
        int96 flowRate;
    }

    struct DeleteFlowParams {
        ISuperToken superToken;
        address sender;
        address receiver;
    }

    struct UpgradeParams {
        ISuperToken superToken;
        uint256 amount;
    }

    struct DowngradeParams {
        ISuperToken superToken;
        uint256 amount;
    }

    struct ApproveParams {
        ISuperToken superToken;
        address spender;
        uint256 amount;
    }

    struct TransferParams {
        ISuperToken superToken;
        address receiver;
        uint256 amount;
    }

    /// `startDate == 0` means no scheduled start (stop-only); `endDate == 0` means no scheduled stop.
    struct ScheduleFlowParams {
        ISuperToken superToken;
        address receiver;
        uint32 startDate;
        int96 flowRate;
        uint32 endDate;
    }

    struct DeleteFlowScheduleParams {
        ISuperToken superToken;
        address receiver;
    }

    constructor(
        ISuperfluid host,
        IFlowScheduler flowScheduler,
        ISuperToken feeSuperToken,
        uint256 baseFeeAmount,
        address feeReceiver
    ) {
        if (address(flowScheduler) == address(0)) revert ZeroAddress();
        // Require fee config only when a fee is actually charged, so baseFeeAmount == 0 deploys feeless.
        if (baseFeeAmount != 0 && (address(feeSuperToken) == address(0) || feeReceiver == address(0))) {
            revert ZeroAddress();
        }
        // The description formatter (AmountFormatter.toHumanReadable) rounds to 5 decimals. Constrain the fee
        // to that granularity so the disclosed amount always equals the exact amount charged: baseFeeAmount
        // and baseFeeAmount * feeUnits (feeUnits <= 5) both stay multiples of 1e13 = 10^(18-5) for an
        // 18-decimal SuperToken.
        if (baseFeeAmount % 1e13 != 0) revert FeeNotRepresentable();
        if (baseFeeAmount > _MAX_BASE_FEE) revert FeeTooHigh();
        _cfa = IConstantFlowAgreementV1(
            address(host.getAgreementClass(keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")))
        );
        _flowScheduler = flowScheduler;
        _feeSuperToken = feeSuperToken;
        _baseFeeAmount = baseFeeAmount;
        _feeReceiver = feeReceiver;
    }

    function _registerActions() internal override {
        _registerAction(
            uint8(ActionId.CreateFlow),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "CreateFlow",
                actionTypeDefinition: _TYPEDEF_CREATE_FLOW,
                getActionStructHash: _getActionStructHashCreateFlow,
                buildOperations: _buildOperationsCreateFlow,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.UpdateFlow),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "UpdateFlow",
                actionTypeDefinition: _TYPEDEF_UPDATE_FLOW,
                getActionStructHash: _getActionStructHashUpdateFlow,
                buildOperations: _buildOperationsUpdateFlow,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.DeleteFlow),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "DeleteFlow",
                actionTypeDefinition: _TYPEDEF_DELETE_FLOW,
                getActionStructHash: _getActionStructHashDeleteFlow,
                buildOperations: _buildOperationsDeleteFlow,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.Upgrade),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "Upgrade",
                actionTypeDefinition: _TYPEDEF_UPGRADE,
                getActionStructHash: _getActionStructHashUpgrade,
                buildOperations: _buildOperationsUpgrade,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.Downgrade),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "Downgrade",
                actionTypeDefinition: _TYPEDEF_DOWNGRADE,
                getActionStructHash: _getActionStructHashDowngrade,
                buildOperations: _buildOperationsDowngrade,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.Approve),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "Approve",
                actionTypeDefinition: _TYPEDEF_APPROVE,
                getActionStructHash: _getActionStructHashApprove,
                buildOperations: _buildOperationsApprove,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.Transfer),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "Transfer",
                actionTypeDefinition: _TYPEDEF_TRANSFER,
                getActionStructHash: _getActionStructHashTransfer,
                buildOperations: _buildOperationsTransfer,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.ScheduleFlow),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "ScheduleFlow",
                actionTypeDefinition: _TYPEDEF_SCHEDULE_FLOW,
                getActionStructHash: _getActionStructHashScheduleFlow,
                buildOperations: _buildOperationsScheduleFlow,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            uint8(ActionId.DeleteFlowSchedule),
            ClearMacroBase.ActionSpec({
                primaryTypeName: "DeleteFlowSchedule",
                actionTypeDefinition: _TYPEDEF_DELETE_FLOW_SCHEDULE,
                getActionStructHash: _getActionStructHashDeleteFlowSchedule,
                buildOperations: _buildOperationsDeleteFlowSchedule,
                postCheck: _noOpPostCheck
            })
        );
    }

    function _encodeRaw(ActionId actionId, bytes32 lang, bytes memory actionSpecificParams)
        private
        pure
        returns (bytes memory actionParams)
    {
        return abi.encode(uint8(actionId), lang, actionSpecificParams);
    }

    function encodeCreateFlow(bytes32 lang, CreateFlowParams calldata p)
        external
        pure
        returns (bytes memory actionParams)
    {
        return _encodeRaw(ActionId.CreateFlow, lang, abi.encode(p.superToken, p.receiver, p.flowRate));
    }

    function encodeUpdateFlow(bytes32 lang, UpdateFlowParams calldata p)
        external
        pure
        returns (bytes memory actionParams)
    {
        return _encodeRaw(ActionId.UpdateFlow, lang, abi.encode(p.superToken, p.receiver, p.flowRate));
    }

    function encodeDeleteFlow(bytes32 lang, DeleteFlowParams calldata p)
        external
        pure
        returns (bytes memory actionParams)
    {
        return _encodeRaw(ActionId.DeleteFlow, lang, abi.encode(p.superToken, p.sender, p.receiver));
    }

    function encodeUpgrade(bytes32 lang, UpgradeParams calldata p) external pure returns (bytes memory actionParams) {
        return _encodeRaw(ActionId.Upgrade, lang, abi.encode(p.superToken, p.amount));
    }

    function encodeDowngrade(bytes32 lang, DowngradeParams calldata p)
        external
        pure
        returns (bytes memory actionParams)
    {
        return _encodeRaw(ActionId.Downgrade, lang, abi.encode(p.superToken, p.amount));
    }

    function encodeApprove(bytes32 lang, ApproveParams calldata p) external pure returns (bytes memory actionParams) {
        return _encodeRaw(ActionId.Approve, lang, abi.encode(p.superToken, p.spender, p.amount));
    }

    function encodeTransfer(bytes32 lang, TransferParams calldata p) external pure returns (bytes memory actionParams) {
        return _encodeRaw(ActionId.Transfer, lang, abi.encode(p.superToken, p.receiver, p.amount));
    }

    function encodeScheduleFlow(bytes32 lang, ScheduleFlowParams calldata p)
        external
        pure
        returns (bytes memory actionParams)
    {
        return _encodeRaw(
            ActionId.ScheduleFlow, lang, abi.encode(p.superToken, p.receiver, p.startDate, p.flowRate, p.endDate)
        );
    }

    function encodeDeleteFlowSchedule(bytes32 lang, DeleteFlowScheduleParams calldata p)
        external
        pure
        returns (bytes memory actionParams)
    {
        return _encodeRaw(ActionId.DeleteFlowSchedule, lang, abi.encode(p.superToken, p.receiver));
    }

    function describeCreateFlow(bytes32 lang, CreateFlowParams calldata p) external view returns (string memory) {
        return _descriptionCreateFlow(lang, p.superToken, p.receiver, p.flowRate);
    }

    function describeUpdateFlow(bytes32 lang, UpdateFlowParams calldata p) external view returns (string memory) {
        return _descriptionUpdateFlow(lang, p.superToken, p.receiver, p.flowRate);
    }

    function describeDeleteFlow(bytes32 lang, DeleteFlowParams calldata p) external view returns (string memory) {
        return _descriptionDeleteFlow(lang, p.superToken, p.sender, p.receiver);
    }

    function describeUpgrade(bytes32 lang, UpgradeParams calldata p) external view returns (string memory) {
        return _descriptionUpgrade(lang, p.superToken, p.amount);
    }

    function describeDowngrade(bytes32 lang, DowngradeParams calldata p) external view returns (string memory) {
        return _descriptionDowngrade(lang, p.superToken, p.amount);
    }

    function describeApprove(bytes32 lang, ApproveParams calldata p) external view returns (string memory) {
        return _descriptionApprove(lang, p.superToken, p.spender, p.amount);
    }

    function describeTransfer(bytes32 lang, TransferParams calldata p) external view returns (string memory) {
        return _descriptionTransfer(lang, p.superToken, p.receiver, p.amount);
    }

    function describeScheduleFlow(bytes32 lang, ScheduleFlowParams calldata p) external view returns (string memory) {
        return _descriptionScheduleFlow(lang, p.superToken, p.receiver, p.startDate, p.flowRate, p.endDate);
    }

    function describeDeleteFlowSchedule(bytes32 lang, DeleteFlowScheduleParams calldata p)
        external
        view
        returns (string memory)
    {
        return _descriptionDeleteFlowSchedule(lang, p.superToken, p.receiver);
    }

    function _buildOperationsCreateFlow(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        CreateFlowParams memory p = abi.decode(actionSpecificParams, (CreateFlowParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            target: address(_cfa),
            data: abi.encode(
                abi.encodeCall(_cfa.createFlow, (p.superToken, p.receiver, p.flowRate, new bytes(0))), new bytes(0)
            )
        });
        return _appendFee(operations, account, 1);
    }

    function _buildOperationsUpdateFlow(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        UpdateFlowParams memory p = abi.decode(actionSpecificParams, (UpdateFlowParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            target: address(_cfa),
            data: abi.encode(
                abi.encodeCall(_cfa.updateFlow, (p.superToken, p.receiver, p.flowRate, new bytes(0))), new bytes(0)
            )
        });
        return _appendFee(operations, account, 1);
    }

    // Also removes the signer's flow schedule row for (token, signer, receiver) when one exists,
    // so cancelling a scheduled stream is one signed action. Gated on `account == p.sender`
    // because the FlowScheduler resolves the row's sender from the batch signer: CFA lets the
    // flow's receiver delete too, and an unconditional call would then target the wrong row
    // (token, receiver, receiver). The existence check keeps the common schedule-less delete
    // light on gas. The description stays state-independent ("if you are the sender ... any
    // matching schedule") so a schedule change between signing and execution cannot flip the
    // recomputed struct hash into InvalidSignature.
    function _buildOperationsDeleteFlow(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        DeleteFlowParams memory p = abi.decode(actionSpecificParams, (DeleteFlowParams));
        bool deleteSchedule = account == p.sender && _scheduleExists(p.superToken, account, p.receiver);
        uint256 i = 0;
        operations = new ISuperfluid.Operation[](deleteSchedule ? 2 : 1);
        operations[i++] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            target: address(_cfa),
            data: abi.encode(
                abi.encodeCall(_cfa.deleteFlow, (p.superToken, p.sender, p.receiver, new bytes(0))), new bytes(0)
            )
        });
        if (deleteSchedule) {
            operations[i++] = ISuperfluid.Operation({
                operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
                target: address(_flowScheduler),
                data: abi.encodeCall(IFlowScheduler.deleteFlowSchedule, (p.superToken, p.receiver, new bytes(0)))
            });
        }
        return _appendFee(operations, account, 1);
    }

    function _buildOperationsUpgrade(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        UpgradeParams memory p = abi.decode(actionSpecificParams, (UpgradeParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERTOKEN_UPGRADE,
            target: address(p.superToken),
            data: abi.encode(p.amount)
        });
        return _appendFee(operations, account, 1);
    }

    function _buildOperationsDowngrade(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        DowngradeParams memory p = abi.decode(actionSpecificParams, (DowngradeParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERTOKEN_DOWNGRADE,
            target: address(p.superToken),
            data: abi.encode(p.amount)
        });
        return _appendFee(operations, account, 1);
    }

    function _buildOperationsApprove(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        ApproveParams memory p = abi.decode(actionSpecificParams, (ApproveParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_ERC20_APPROVE,
            target: address(p.superToken),
            data: abi.encode(p.spender, p.amount)
        });
        return _appendFee(operations, account, 1);
    }

    function _buildOperationsTransfer(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        TransferParams memory p = abi.decode(actionSpecificParams, (TransferParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_ERC20_TRANSFER_FROM,
            target: address(p.superToken),
            data: abi.encode(account, p.receiver, p.amount)
        });
        return _appendFee(operations, account, 1);
    }

    // Grants the FlowScheduler the flow operator permissions it needs (create for a scheduled
    // start, delete for a scheduled stop) in the same batch that creates the schedule. Only the
    // missing permission bits and allowance top-up are granted — repeated schedule edits do not
    // accumulate allowance, and an existing full-control grant (allowance = type(int96).max)
    // would otherwise overflow CFA's checked allowance addition and revert the whole action.
    // The FlowScheduler accepts a zero/negative-rate start schedule but CFA rejects it at
    // execution time, so that combination is rejected here instead of failing at the keeper.
    // A positive flowRate with no start date means "immediate start": the batch also opens the
    // flow right now (CFA createFlow, executed as the signer — no operator grant needed for it)
    // and the schedule only carries the stop; the stored schedule row keeps flowRate 0, the same
    // shape an end-only schedule created directly by the dashboard has.
    function _buildOperationsScheduleFlow(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        ScheduleFlowParams memory p = abi.decode(actionSpecificParams, (ScheduleFlowParams));
        if (p.startDate == 0 && p.endDate == 0) revert InvalidTimeWindow();
        if (p.startDate != 0 ? p.flowRate <= 0 : p.flowRate < 0) revert InvalidFlowRate();
        bool immediateStart = p.startDate == 0 && p.flowRate > 0;

        (uint8 permissionsToAdd, int96 allowanceToAdd) = _missingSchedulerGrant(p, account);
        bool needsGrant = permissionsToAdd != 0 || allowanceToAdd != 0;

        uint256 i = 0;
        operations = new ISuperfluid.Operation[]((needsGrant ? 1 : 0) + 1 + (immediateStart ? 1 : 0));
        if (needsGrant) {
            operations[i++] = ISuperfluid.Operation({
                operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
                target: address(_cfa),
                data: abi.encode(
                    abi.encodeCall(
                        _cfa.increaseFlowRateAllowanceWithPermissions,
                        (p.superToken, address(_flowScheduler), permissionsToAdd, allowanceToAdd, new bytes(0))
                    ),
                    new bytes(0)
                )
            });
        }
        operations[i++] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            target: address(_flowScheduler),
            data: abi.encodeCall(
                IFlowScheduler.createFlowSchedule,
                (
                    p.superToken,
                    p.receiver,
                    p.startDate,
                    p.startDate != 0 ? _START_MAX_DELAY : 0,
                    p.startDate != 0 ? p.flowRate : int96(0),
                    uint256(0),
                    p.endDate,
                    new bytes(0),
                    new bytes(0)
                )
            )
        });
        if (immediateStart) {
            // Reverts if a flow already exists — deliberate: the signed text promises to START a
            // stream, and silently updating an existing one would exceed that consent.
            operations[i++] = ISuperfluid.Operation({
                operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
                target: address(_cfa),
                data: abi.encode(
                    abi.encodeCall(_cfa.createFlow, (p.superToken, p.receiver, p.flowRate, new bytes(0))),
                    new bytes(0)
                )
            });
        }

        // Fee weighting lives in _scheduleFeeUnits: a new schedule pays 2x base per keeper execution it
        // reserves on top of the relay itself; modifying an existing schedule only pays the setup tx.
        (uint256 feeUnits,) = _scheduleFeeUnits(p, account);
        return _appendFee(operations, account, feeUnits);
    }

    // Diff between what the schedule needs from the FlowScheduler as flow operator and what the
    // signer has already granted, so the grant operation covers only the shortfall.
    function _missingSchedulerGrant(ScheduleFlowParams memory p, address account)
        internal
        view
        returns (uint8 permissionsToAdd, int96 allowanceToAdd)
    {
        uint8 neededPermissions = (p.startDate != 0 ? _ACL_CREATE : 0) | (p.endDate != 0 ? _ACL_DELETE : 0);
        int96 neededAllowance = p.startDate != 0 ? p.flowRate : int96(0);
        (, uint8 existingPermissions, int96 existingAllowance) =
            _cfa.getFlowOperatorData(p.superToken, account, address(_flowScheduler));
        permissionsToAdd = neededPermissions & ~existingPermissions;
        allowanceToAdd = existingAllowance >= neededAllowance ? int96(0) : neededAllowance - existingAllowance;
    }

    // Appends a relay fee of `_baseFeeAmount * feeUnits` to the action's operations. The fee is an ERC20
    // transferFrom of the fee SuperToken from the signer (`account`) to `_feeReceiver`. Because the batch
    // runs with the signer as msg.sender, this is a self-spend (holder == spender) and needs no allowance —
    // the same mechanism the Transfer action relies on. Returns the array unchanged when feeless.
    function _appendFee(ISuperfluid.Operation[] memory core, address account, uint256 feeUnits)
        internal
        view
        returns (ISuperfluid.Operation[] memory ops)
    {
        uint256 feeAmount = _baseFeeAmount * feeUnits;
        if (feeAmount == 0) return core;
        ops = new ISuperfluid.Operation[](core.length + 1);
        for (uint256 j = 0; j < core.length; j++) {
            ops[j] = core[j];
        }
        ops[core.length] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_ERC20_TRANSFER_FROM,
            target: address(_feeSuperToken),
            data: abi.encode(account, _feeReceiver, feeAmount)
        });
    }

    // Whether a FlowScheduler schedule already exists for this (token, sender, receiver). A stored schedule
    // always has a start or an end date, so this distinguishes a new schedule from a modification.
    function _scheduleExists(ISuperToken superToken, address sender, address receiver)
        internal
        view
        returns (bool)
    {
        IFlowScheduler.FlowSchedule memory s = _flowScheduler.getFlowSchedule(address(superToken), sender, receiver);
        return s.startDate != 0 || s.endDate != 0;
    }

    // The single definition of the ScheduleFlow fee weighting, shared by the operations builder and
    // `previewRelayFee`: 1 unit for the relayed setup tx, plus 2 units per keeper execution a new schedule
    // reserves (scheduled start / scheduled stop). `maxUnits` treats the schedule as new (its full keeper
    // reservation); `currentUnits` is what would actually be charged for `account` now (1 when a schedule
    // row already exists = a modify).
    function _scheduleFeeUnits(ScheduleFlowParams memory p, address account)
        internal
        view
        returns (uint256 currentUnits, uint256 maxUnits)
    {
        maxUnits = 1 + (p.startDate != 0 ? 2 : 0) + (p.endDate != 0 ? 2 : 0);
        currentUnits = _scheduleExists(p.superToken, account, p.receiver) ? 1 : maxUnits;
    }

    /// @notice The Super Token relay fees are charged in (address(0) on a feeless deployment).
    function feeToken() external view returns (ISuperToken) {
        return _feeSuperToken;
    }

    /// @notice The base fee charged for a relayed transaction. A new schedule additionally pays 2x base per
    ///         keeper execution it reserves, so it totals 3x (one scheduled date) or 5x (start and stop).
    function baseFee() external view returns (uint256) {
        return _baseFeeAmount;
    }

    /// @notice Quote the relay fee for an encoded action without executing it.
    /// @param actionParams The output of `encode<Action>` — `abi.encode(uint8 actionId, bytes32 lang, bytes
    ///        actionSpecificParams)`.
    /// @param account The signer the fee would be charged to (used to tell a new schedule from a modify).
    /// @return feeToken The Super Token the fee is charged in (address(0) on a feeless deployment).
    /// @return feeReceiver Where the fee is sent.
    /// @return currentFee The fee that would be charged now for `account`.
    /// @return maxFee The upper bound (a schedule counts as new). Size balances/permits against this, since
    ///         schedule state can change between quoting and execution.
    function previewRelayFee(bytes calldata actionParams, address account)
        external
        view
        returns (ISuperToken feeToken, address feeReceiver, uint256 currentFee, uint256 maxFee)
    {
        (uint8 actionId,, bytes memory actionSpecificParams) = abi.decode(actionParams, (uint8, bytes32, bytes));
        _getAction(actionId); // reverts UnknownActionId for an unregistered id (matches the exec paths)
        uint256 currentUnits = 1;
        uint256 maxUnits = 1;
        if (actionId == uint8(ActionId.ScheduleFlow)) {
            (currentUnits, maxUnits) = _scheduleFeeUnits(abi.decode(actionSpecificParams, (ScheduleFlowParams)), account);
        }
        return (_feeSuperToken, _feeReceiver, _baseFeeAmount * currentUnits, _baseFeeAmount * maxUnits);
    }

    function _buildOperationsDeleteFlowSchedule(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        DeleteFlowScheduleParams memory p = abi.decode(actionSpecificParams, (DeleteFlowScheduleParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            target: address(_flowScheduler),
            data: abi.encodeCall(IFlowScheduler.deleteFlowSchedule, (p.superToken, p.receiver, new bytes(0)))
        });
        return _appendFee(operations, account, 1);
    }

    function _getActionStructHashCreateFlow(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        CreateFlowParams memory p = abi.decode(actionSpecificParams, (CreateFlowParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_CREATE_FLOW)),
                keccak256(bytes(_descriptionCreateFlow(lang, p.superToken, p.receiver, p.flowRate))),
                p.superToken,
                p.receiver,
                p.flowRate
            )
        );
    }

    function _getActionStructHashUpdateFlow(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        UpdateFlowParams memory p = abi.decode(actionSpecificParams, (UpdateFlowParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_UPDATE_FLOW)),
                keccak256(bytes(_descriptionUpdateFlow(lang, p.superToken, p.receiver, p.flowRate))),
                p.superToken,
                p.receiver,
                p.flowRate
            )
        );
    }

    function _getActionStructHashDeleteFlow(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        DeleteFlowParams memory p = abi.decode(actionSpecificParams, (DeleteFlowParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_DELETE_FLOW)),
                keccak256(bytes(_descriptionDeleteFlow(lang, p.superToken, p.sender, p.receiver))),
                p.superToken,
                p.sender,
                p.receiver
            )
        );
    }

    function _getActionStructHashUpgrade(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        UpgradeParams memory p = abi.decode(actionSpecificParams, (UpgradeParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_UPGRADE)),
                keccak256(bytes(_descriptionUpgrade(lang, p.superToken, p.amount))),
                p.superToken,
                p.amount
            )
        );
    }

    function _getActionStructHashDowngrade(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        DowngradeParams memory p = abi.decode(actionSpecificParams, (DowngradeParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_DOWNGRADE)),
                keccak256(bytes(_descriptionDowngrade(lang, p.superToken, p.amount))),
                p.superToken,
                p.amount
            )
        );
    }

    function _getActionStructHashApprove(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        ApproveParams memory p = abi.decode(actionSpecificParams, (ApproveParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_APPROVE)),
                keccak256(bytes(_descriptionApprove(lang, p.superToken, p.spender, p.amount))),
                p.superToken,
                p.spender,
                p.amount
            )
        );
    }

    function _getActionStructHashTransfer(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        TransferParams memory p = abi.decode(actionSpecificParams, (TransferParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_TRANSFER)),
                keccak256(bytes(_descriptionTransfer(lang, p.superToken, p.receiver, p.amount))),
                p.superToken,
                p.receiver,
                p.amount
            )
        );
    }

    function _getActionStructHashScheduleFlow(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        ScheduleFlowParams memory p = abi.decode(actionSpecificParams, (ScheduleFlowParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_SCHEDULE_FLOW)),
                keccak256(
                    bytes(_descriptionScheduleFlow(lang, p.superToken, p.receiver, p.startDate, p.flowRate, p.endDate))
                ),
                p.superToken,
                p.receiver,
                p.startDate,
                p.flowRate,
                p.endDate
            )
        );
    }

    function _getActionStructHashDeleteFlowSchedule(bytes memory actionSpecificParams, bytes32 lang)
        internal
        view
        returns (bytes32)
    {
        DeleteFlowScheduleParams memory p = abi.decode(actionSpecificParams, (DeleteFlowScheduleParams));
        return keccak256(
            abi.encode(
                keccak256(abi.encodePacked(_TYPEDEF_DELETE_FLOW_SCHEDULE)),
                keccak256(bytes(_descriptionDeleteFlowSchedule(lang, p.superToken, p.receiver))),
                p.superToken,
                p.receiver
            )
        );
    }

    function _descriptionCreateFlow(bytes32 lang, ISuperToken token, address receiver, int96 flowRate)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Create a new flow of ", flowRate.toFlowRatePerDay(), " ", token.symbol(), "/day to ", _hex(receiver),
            _feeSuffix(1)
        );
    }

    function _descriptionUpdateFlow(bytes32 lang, ISuperToken token, address receiver, int96 flowRate)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return
            string.concat(
                "Update flow to ", flowRate.toFlowRatePerDay(), " ", token.symbol(), "/day to ", _hex(receiver),
                _feeSuffix(1)
            );
    }

    function _descriptionDeleteFlow(bytes32 lang, ISuperToken token, address sender, address receiver)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Delete flow of ",
            token.symbol(),
            " from ",
            _hex(sender),
            " to ",
            _hex(receiver),
            " and, if you are the sender, cancel any matching schedule for it",
            _feeSuffix(1)
        );
    }

    function _descriptionUpgrade(bytes32 lang, ISuperToken token, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        address underlyingToken = token.getUnderlyingToken();
        return string.concat(
            "Upgrade ", amount.toHumanReadable(), " ", IERC20Metadata(underlyingToken).symbol(), " to ", token.symbol(),
            _feeSuffix(1)
        );
    }

    function _descriptionDowngrade(bytes32 lang, ISuperToken token, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        address underlyingToken = token.getUnderlyingToken();
        return string.concat(
            "Downgrade ",
            amount.toHumanReadable(),
            " ",
            token.symbol(),
            " to ",
            IERC20Metadata(underlyingToken).symbol(),
            _feeSuffix(1)
        );
    }

    function _descriptionApprove(bytes32 lang, ISuperToken token, address spender, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Approve ", _hex(spender), " for an allowance of ", amount.toHumanReadable(), " ", token.symbol(),
            _feeSuffix(1)
        );
    }

    function _descriptionTransfer(bytes32 lang, ISuperToken token, address receiver, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Transfer ", amount.toHumanReadable(), " ", token.symbol(), " to ", _hex(receiver), _feeSuffix(1)
        );
    }

    function _descriptionScheduleFlow(
        bytes32 lang,
        ISuperToken token,
        address receiver,
        uint32 startDate,
        int96 flowRate,
        uint32 endDate
    ) internal view returns (string memory) {
        _requireEnglish(lang);
        if (startDate != 0 && endDate != 0) {
            return string.concat(
                "Schedule a stream of ",
                flowRate.toFlowRatePerDay(),
                " ",
                token.symbol(),
                "/day to ",
                _hex(receiver),
                ", starting at ",
                Strings.toString(startDate),
                " and stopping at ",
                Strings.toString(endDate),
                " (unix time), and authorize the Flow Scheduler",
                _scheduleFeeSuffix(startDate, endDate)
            );
        } else if (startDate != 0) {
            return string.concat(
                "Schedule a stream of ",
                flowRate.toFlowRatePerDay(),
                " ",
                token.symbol(),
                "/day to ",
                _hex(receiver),
                ", starting at ",
                Strings.toString(startDate),
                " (unix time), and authorize the Flow Scheduler",
                _scheduleFeeSuffix(startDate, endDate)
            );
        } else if (flowRate > 0) {
            // Immediate start: the action opens the flow NOW and schedules only the stop.
            return string.concat(
                "Start a stream of ",
                flowRate.toFlowRatePerDay(),
                " ",
                token.symbol(),
                "/day to ",
                _hex(receiver),
                " immediately, stopping at ",
                Strings.toString(endDate),
                " (unix time), and authorize the Flow Scheduler",
                _scheduleFeeSuffix(startDate, endDate)
            );
        } else {
            return string.concat(
                "Schedule the stream of ",
                token.symbol(),
                " to ",
                _hex(receiver),
                " to stop at ",
                Strings.toString(endDate),
                " (unix time), and authorize the Flow Scheduler",
                _scheduleFeeSuffix(startDate, endDate)
            );
        }
    }

    function _descriptionDeleteFlowSchedule(bytes32 lang, ISuperToken token, address receiver)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Cancel the scheduled stream of ", token.symbol(), " to ", _hex(receiver), _feeSuffix(1)
        );
    }

    function _requireEnglish(bytes32 lang) internal pure {
        if (lang != _LANG_EN) revert UnsupportedLanguage();
    }

    function _hex(address account) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(account)), 20);
    }

    // Fee disclosure for a fixed-fee action. Returns "" when feeless.
    function _feeSuffix(uint256 feeUnits) internal view returns (string memory) {
        if (_baseFeeAmount == 0) return "";
        return string.concat(
            ", plus a relay fee of ",
            (_baseFeeAmount * feeUnits).toHumanReadable(),
            " ",
            _feeSuperToken.symbol(),
            " payable to ",
            _hex(_feeReceiver)
        );
    }

    // Fee disclosure for ScheduleFlow. The description cannot see the signer, so it cannot tell whether the
    // schedule is new or a modification; it discloses both exact amounts (a new schedule pays 2x base per
    // reserved keeper execution, a modification only pays the setup tx). The receiver is stated once so it
    // applies to both. Must mirror the weighting in `_scheduleFeeUnits`.
    function _scheduleFeeSuffix(uint32 startDate, uint32 endDate) internal view returns (string memory) {
        if (_baseFeeAmount == 0) return "";
        uint256 newFeeUnits = 1 + (startDate != 0 ? 2 : 0) + (endDate != 0 ? 2 : 0);
        return string.concat(
            ", plus a relay fee payable to ",
            _hex(_feeReceiver),
            " of ",
            (_baseFeeAmount * newFeeUnits).toHumanReadable(),
            " ",
            _feeSuperToken.symbol(),
            " for a new schedule, or ",
            _baseFeeAmount.toHumanReadable(),
            " ",
            _feeSuperToken.symbol(),
            " when modifying an existing schedule"
        );
    }
}
