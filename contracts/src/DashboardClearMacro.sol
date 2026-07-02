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

    /// How long after `startDate` the keeper may still execute the scheduled start (dashboard default).
    uint32 private constant _START_MAX_DELAY = 1 days;
    uint8 private constant _ACL_CREATE = 1;
    uint8 private constant _ACL_DELETE = 4;

    IConstantFlowAgreementV1 internal immutable _cfa;
    IFlowScheduler internal immutable _flowScheduler;

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

    constructor(ISuperfluid host, IFlowScheduler flowScheduler) {
        if (address(flowScheduler) == address(0)) revert ZeroAddress();
        _cfa = IConstantFlowAgreementV1(
            address(host.getAgreementClass(keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")))
        );
        _flowScheduler = flowScheduler;
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

    function _buildOperationsCreateFlow(ISuperfluid, bytes memory actionSpecificParams, address)
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
    }

    function _buildOperationsUpdateFlow(ISuperfluid, bytes memory actionSpecificParams, address)
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
    }

    function _buildOperationsDeleteFlow(ISuperfluid, bytes memory actionSpecificParams, address)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        DeleteFlowParams memory p = abi.decode(actionSpecificParams, (DeleteFlowParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            target: address(_cfa),
            data: abi.encode(
                abi.encodeCall(_cfa.deleteFlow, (p.superToken, p.sender, p.receiver, new bytes(0))), new bytes(0)
            )
        });
    }

    function _buildOperationsUpgrade(ISuperfluid, bytes memory actionSpecificParams, address)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        UpgradeParams memory p = abi.decode(actionSpecificParams, (UpgradeParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERTOKEN_UPGRADE,
            target: address(p.superToken),
            data: abi.encode(p.amount)
        });
    }

    function _buildOperationsDowngrade(ISuperfluid, bytes memory actionSpecificParams, address)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        DowngradeParams memory p = abi.decode(actionSpecificParams, (DowngradeParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERTOKEN_DOWNGRADE,
            target: address(p.superToken),
            data: abi.encode(p.amount)
        });
    }

    function _buildOperationsApprove(ISuperfluid, bytes memory actionSpecificParams, address)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        ApproveParams memory p = abi.decode(actionSpecificParams, (ApproveParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_ERC20_APPROVE,
            target: address(p.superToken),
            data: abi.encode(p.spender, p.amount)
        });
    }

    function _buildOperationsTransfer(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        TransferParams memory p = abi.decode(actionSpecificParams, (TransferParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_ERC20_TRANSFER_FROM,
            target: address(p.superToken),
            data: abi.encode(account, p.receiver, p.amount)
        });
    }

    // Grants the FlowScheduler the flow operator permissions it needs (create for a scheduled
    // start, delete for a scheduled stop) in the same batch that creates the schedule. Only the
    // missing permission bits and allowance top-up are granted — repeated schedule edits do not
    // accumulate allowance, and an existing full-control grant (allowance = type(int96).max)
    // would otherwise overflow CFA's checked allowance addition and revert the whole action.
    // The FlowScheduler accepts a zero/negative-rate start schedule but CFA rejects it at
    // execution time, so that combination is rejected here instead of failing at the keeper.
    function _buildOperationsScheduleFlow(ISuperfluid, bytes memory actionSpecificParams, address account)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        ScheduleFlowParams memory p = abi.decode(actionSpecificParams, (ScheduleFlowParams));
        if (p.startDate == 0 && p.endDate == 0) revert InvalidTimeWindow();
        if (p.startDate != 0 ? p.flowRate <= 0 : p.flowRate != 0) revert InvalidFlowRate();

        (uint8 permissionsToAdd, int96 allowanceToAdd) = _missingSchedulerGrant(p, account);
        bool needsGrant = permissionsToAdd != 0 || allowanceToAdd != 0;

        operations = new ISuperfluid.Operation[](needsGrant ? 2 : 1);
        if (needsGrant) {
            operations[0] = ISuperfluid.Operation({
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
        operations[operations.length - 1] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_APP_ACTION,
            target: address(_flowScheduler),
            data: abi.encodeCall(
                IFlowScheduler.createFlowSchedule,
                (
                    p.superToken,
                    p.receiver,
                    p.startDate,
                    p.startDate != 0 ? _START_MAX_DELAY : 0,
                    p.flowRate,
                    uint256(0),
                    p.endDate,
                    new bytes(0),
                    new bytes(0)
                )
            )
        });
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

    function _buildOperationsDeleteFlowSchedule(ISuperfluid, bytes memory actionSpecificParams, address)
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
            "Create a new flow of ", flowRate.toFlowRatePerDay(), " ", token.symbol(), "/day to ", _hex(receiver)
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
                "Update flow to ", flowRate.toFlowRatePerDay(), " ", token.symbol(), "/day to ", _hex(receiver)
            );
    }

    function _descriptionDeleteFlow(bytes32 lang, ISuperToken token, address sender, address receiver)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat("Delete flow of ", token.symbol(), " from ", _hex(sender), " to ", _hex(receiver));
    }

    function _descriptionUpgrade(bytes32 lang, ISuperToken token, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        address underlyingToken = token.getUnderlyingToken();
        return string.concat(
            "Upgrade ", amount.toHumanReadable(), " ", IERC20Metadata(underlyingToken).symbol(), " to ", token.symbol()
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
            IERC20Metadata(underlyingToken).symbol()
        );
    }

    function _descriptionApprove(bytes32 lang, ISuperToken token, address spender, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Approve ", _hex(spender), " for an allowance of ", amount.toHumanReadable(), " ", token.symbol()
        );
    }

    function _descriptionTransfer(bytes32 lang, ISuperToken token, address receiver, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat("Transfer ", amount.toHumanReadable(), " ", token.symbol(), " to ", _hex(receiver));
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
                " (unix time), and authorize the Flow Scheduler"
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
                " (unix time), and authorize the Flow Scheduler"
            );
        } else {
            return string.concat(
                "Schedule the stream of ",
                token.symbol(),
                " to ",
                _hex(receiver),
                " to stop at ",
                Strings.toString(endDate),
                " (unix time), and authorize the Flow Scheduler"
            );
        }
    }

    function _descriptionDeleteFlowSchedule(bytes32 lang, ISuperToken token, address receiver)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat("Cancel the scheduled stream of ", token.symbol(), " to ", _hex(receiver));
    }

    function _requireEnglish(bytes32 lang) internal pure {
        if (lang != _LANG_EN) revert UnsupportedLanguage();
    }

    function _hex(address account) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(account)), 20);
    }
}
