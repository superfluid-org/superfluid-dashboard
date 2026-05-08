// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.26;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { ISuperfluid, BatchOperation, IERC20Metadata } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperToken } from "@superfluid-finance/ethereum-contracts/contracts/superfluid/SuperToken.sol";
import { IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

import { ClearMacroBase } from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroBase.sol";
import { FlowRateFormatter, AmountFormatter } from "./FormatterLibs.sol";

using SuperTokenV1Library for ISuperToken;
using FlowRateFormatter for int96;
using AmountFormatter for uint256;

contract DashboardClearMacro is ClearMacroBase {
    uint8 public constant ACTION_CREATE_FLOW = 1;
    uint8 public constant ACTION_UPDATE_FLOW = 2;
    uint8 public constant ACTION_DELETE_FLOW = 3;
    uint8 public constant ACTION_UPGRADE = 4;
    uint8 public constant ACTION_DOWNGRADE = 5;
    uint8 public constant ACTION_APPROVE = 6;
    uint8 public constant ACTION_TRANSFER = 7;

    bytes32 private constant LANG_EN = bytes32("en");

    string private constant TYPEDEF_CREATE_FLOW =
        "Action(string description,address token,address receiver,int96 flowRate)";
    string private constant TYPEDEF_UPDATE_FLOW =
        "Action(string description,address token,address receiver,int96 flowRate)";
    string private constant TYPEDEF_DELETE_FLOW =
        "Action(string description,address token,address sender,address receiver)";
    string private constant TYPEDEF_UPGRADE = "Action(string description,address token,uint256 amount)";
    string private constant TYPEDEF_DOWNGRADE = "Action(string description,address token,uint256 amount)";
    string private constant TYPEDEF_APPROVE =
        "Action(string description,address token,address spender,uint256 amount)";
    string private constant TYPEDEF_TRANSFER =
        "Action(string description,address token,address receiver,uint256 amount)";

    bytes32 public constant TYPEHASH_CREATE_FLOW = keccak256(bytes(TYPEDEF_CREATE_FLOW));
    bytes32 public constant TYPEHASH_UPDATE_FLOW = keccak256(bytes(TYPEDEF_UPDATE_FLOW));
    bytes32 public constant TYPEHASH_DELETE_FLOW = keccak256(bytes(TYPEDEF_DELETE_FLOW));
    bytes32 public constant TYPEHASH_UPGRADE = keccak256(bytes(TYPEDEF_UPGRADE));
    bytes32 public constant TYPEHASH_DOWNGRADE = keccak256(bytes(TYPEDEF_DOWNGRADE));
    bytes32 public constant TYPEHASH_APPROVE = keccak256(bytes(TYPEDEF_APPROVE));
    bytes32 public constant TYPEHASH_TRANSFER = keccak256(bytes(TYPEDEF_TRANSFER));

    IConstantFlowAgreementV1 internal immutable _cfa;

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

    constructor(ISuperfluid host) {
        _cfa = IConstantFlowAgreementV1(
            address(host.getAgreementClass(keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")))
        );
    }

    function _registerActions() internal override {
        _registerAction(
            ACTION_CREATE_FLOW,
            ActionSpec({
                primaryTypeName: "DashboardCreateFlow",
                actionTypeDefinition: TYPEDEF_CREATE_FLOW,
                getActionStructHash: _getActionStructHashCreateFlow,
                buildOperations: _buildOperationsForCreateFlow,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            ACTION_UPDATE_FLOW,
            ActionSpec({
                primaryTypeName: "DashboardUpdateFlow",
                actionTypeDefinition: TYPEDEF_UPDATE_FLOW,
                getActionStructHash: _getActionStructHashUpdateFlow,
                buildOperations: _buildOperationsForUpdateFlow,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            ACTION_DELETE_FLOW,
            ActionSpec({
                primaryTypeName: "DashboardDeleteFlow",
                actionTypeDefinition: TYPEDEF_DELETE_FLOW,
                getActionStructHash: _getActionStructHashDeleteFlow,
                buildOperations: _buildOperationsForDeleteFlow,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            ACTION_UPGRADE,
            ActionSpec({
                primaryTypeName: "DashboardUpgrade",
                actionTypeDefinition: TYPEDEF_UPGRADE,
                getActionStructHash: _getActionStructHashUpgrade,
                buildOperations: _buildOperationsForUpgrade,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            ACTION_DOWNGRADE,
            ActionSpec({
                primaryTypeName: "DashboardDowngrade",
                actionTypeDefinition: TYPEDEF_DOWNGRADE,
                getActionStructHash: _getActionStructHashDowngrade,
                buildOperations: _buildOperationsForDowngrade,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            ACTION_APPROVE,
            ActionSpec({
                primaryTypeName: "DashboardApprove",
                actionTypeDefinition: TYPEDEF_APPROVE,
                getActionStructHash: _getActionStructHashApprove,
                buildOperations: _buildOperationsForApprove,
                postCheck: _noOpPostCheck
            })
        );
        _registerAction(
            ACTION_TRANSFER,
            ActionSpec({
                primaryTypeName: "DashboardTransfer",
                actionTypeDefinition: TYPEDEF_TRANSFER,
                getActionStructHash: _getActionStructHashTransfer,
                buildOperations: _buildOperationsForTransfer,
                postCheck: _noOpPostCheck
            })
        );
    }

    function encodeCreateFlow(bytes32 lang, CreateFlowParams calldata p) external pure returns (bytes memory) {
        return abi.encode(ACTION_CREATE_FLOW, lang, abi.encode(p.superToken, p.receiver, p.flowRate));
    }

    function encodeUpdateFlow(bytes32 lang, UpdateFlowParams calldata p) external pure returns (bytes memory) {
        return abi.encode(ACTION_UPDATE_FLOW, lang, abi.encode(p.superToken, p.receiver, p.flowRate));
    }

    function encodeDeleteFlow(bytes32 lang, DeleteFlowParams calldata p) external pure returns (bytes memory) {
        return abi.encode(ACTION_DELETE_FLOW, lang, abi.encode(p.superToken, p.sender, p.receiver));
    }

    function encodeUpgrade(bytes32 lang, UpgradeParams calldata p) external pure returns (bytes memory) {
        return abi.encode(ACTION_UPGRADE, lang, abi.encode(p.superToken, p.amount));
    }

    function encodeDowngrade(bytes32 lang, DowngradeParams calldata p) external pure returns (bytes memory) {
        return abi.encode(ACTION_DOWNGRADE, lang, abi.encode(p.superToken, p.amount));
    }

    function encodeApprove(bytes32 lang, ApproveParams calldata p) external pure returns (bytes memory) {
        return abi.encode(ACTION_APPROVE, lang, abi.encode(p.superToken, p.spender, p.amount));
    }

    function encodeTransfer(bytes32 lang, TransferParams calldata p) external pure returns (bytes memory) {
        return abi.encode(ACTION_TRANSFER, lang, abi.encode(p.superToken, p.receiver, p.amount));
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

    function _buildOperationsForCreateFlow(ISuperfluid, bytes memory actionParams, address)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        CreateFlowParams memory p = abi.decode(actionParams, (CreateFlowParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            target: address(_cfa),
            data: abi.encode(abi.encodeCall(_cfa.createFlow, (p.superToken, p.receiver, p.flowRate, new bytes(0))), new bytes(0))
        });
    }

    function _buildOperationsForUpdateFlow(ISuperfluid, bytes memory actionParams, address)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        UpdateFlowParams memory p = abi.decode(actionParams, (UpdateFlowParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            target: address(_cfa),
            data: abi.encode(abi.encodeCall(_cfa.updateFlow, (p.superToken, p.receiver, p.flowRate, new bytes(0))), new bytes(0))
        });
    }

    function _buildOperationsForDeleteFlow(ISuperfluid, bytes memory actionParams, address)
        internal
        view
        returns (ISuperfluid.Operation[] memory operations)
    {
        DeleteFlowParams memory p = abi.decode(actionParams, (DeleteFlowParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERFLUID_CALL_AGREEMENT,
            target: address(_cfa),
            data: abi.encode(abi.encodeCall(_cfa.deleteFlow, (p.superToken, p.sender, p.receiver, new bytes(0))), new bytes(0))
        });
    }

    function _buildOperationsForUpgrade(ISuperfluid, bytes memory actionParams, address)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        UpgradeParams memory p = abi.decode(actionParams, (UpgradeParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERTOKEN_UPGRADE,
            target: address(p.superToken),
            data: abi.encode(p.amount)
        });
    }

    function _buildOperationsForDowngrade(ISuperfluid, bytes memory actionParams, address)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        DowngradeParams memory p = abi.decode(actionParams, (DowngradeParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_SUPERTOKEN_DOWNGRADE,
            target: address(p.superToken),
            data: abi.encode(p.amount)
        });
    }

    function _buildOperationsForApprove(ISuperfluid, bytes memory actionParams, address)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        ApproveParams memory p = abi.decode(actionParams, (ApproveParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_ERC20_APPROVE,
            target: address(p.superToken),
            data: abi.encode(p.spender, p.amount)
        });
    }

    function _buildOperationsForTransfer(ISuperfluid, bytes memory actionParams, address msgSender)
        internal
        pure
        returns (ISuperfluid.Operation[] memory operations)
    {
        TransferParams memory p = abi.decode(actionParams, (TransferParams));
        operations = new ISuperfluid.Operation[](1);
        operations[0] = ISuperfluid.Operation({
            operationType: BatchOperation.OPERATION_TYPE_ERC20_TRANSFER_FROM,
            target: address(p.superToken),
            data: abi.encode(msgSender, p.receiver, p.amount)
        });
    }

    function _getActionStructHashCreateFlow(bytes memory actionParams, bytes32 lang) internal view returns (bytes32) {
        CreateFlowParams memory p = abi.decode(actionParams, (CreateFlowParams));
        return keccak256(
            abi.encode(
                TYPEHASH_CREATE_FLOW,
                keccak256(bytes(_descriptionCreateFlow(lang, p.superToken, p.receiver, p.flowRate))),
                p.superToken,
                p.receiver,
                p.flowRate
            )
        );
    }

    function _getActionStructHashUpdateFlow(bytes memory actionParams, bytes32 lang) internal view returns (bytes32) {
        UpdateFlowParams memory p = abi.decode(actionParams, (UpdateFlowParams));
        return keccak256(
            abi.encode(
                TYPEHASH_UPDATE_FLOW,
                keccak256(bytes(_descriptionUpdateFlow(lang, p.superToken, p.receiver, p.flowRate))),
                p.superToken,
                p.receiver,
                p.flowRate
            )
        );
    }

    function _getActionStructHashDeleteFlow(bytes memory actionParams, bytes32 lang) internal view returns (bytes32) {
        DeleteFlowParams memory p = abi.decode(actionParams, (DeleteFlowParams));
        return keccak256(
            abi.encode(
                TYPEHASH_DELETE_FLOW,
                keccak256(bytes(_descriptionDeleteFlow(lang, p.superToken, p.sender, p.receiver))),
                p.superToken,
                p.sender,
                p.receiver
            )
        );
    }

    function _getActionStructHashUpgrade(bytes memory actionParams, bytes32 lang) internal view returns (bytes32) {
        UpgradeParams memory p = abi.decode(actionParams, (UpgradeParams));
        return keccak256(
            abi.encode(
                TYPEHASH_UPGRADE,
                keccak256(bytes(_descriptionUpgrade(lang, p.superToken, p.amount))),
                p.superToken,
                p.amount
            )
        );
    }

    function _getActionStructHashDowngrade(bytes memory actionParams, bytes32 lang) internal view returns (bytes32) {
        DowngradeParams memory p = abi.decode(actionParams, (DowngradeParams));
        return keccak256(
            abi.encode(
                TYPEHASH_DOWNGRADE,
                keccak256(bytes(_descriptionDowngrade(lang, p.superToken, p.amount))),
                p.superToken,
                p.amount
            )
        );
    }

    function _getActionStructHashApprove(bytes memory actionParams, bytes32 lang) internal view returns (bytes32) {
        ApproveParams memory p = abi.decode(actionParams, (ApproveParams));
        return keccak256(
            abi.encode(
                TYPEHASH_APPROVE,
                keccak256(bytes(_descriptionApprove(lang, p.superToken, p.spender, p.amount))),
                p.superToken,
                p.spender,
                p.amount
            )
        );
    }

    function _getActionStructHashTransfer(bytes memory actionParams, bytes32 lang) internal view returns (bytes32) {
        TransferParams memory p = abi.decode(actionParams, (TransferParams));
        return keccak256(
            abi.encode(
                TYPEHASH_TRANSFER,
                keccak256(bytes(_descriptionTransfer(lang, p.superToken, p.receiver, p.amount))),
                p.superToken,
                p.receiver,
                p.amount
            )
        );
    }

    function _descriptionCreateFlow(bytes32 lang, ISuperToken token, address receiver, int96 flowRate)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat("Create a new flow of ", flowRate.toFlowRatePerDay(), " ", token.symbol(), "/day to ", _hex(receiver));
    }

    function _descriptionUpdateFlow(bytes32 lang, ISuperToken token, address receiver, int96 flowRate)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat("Update flow to ", flowRate.toFlowRatePerDay(), " ", token.symbol(), "/day to ", _hex(receiver));
    }

    function _descriptionDeleteFlow(bytes32 lang, ISuperToken token, address sender, address receiver)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Delete flow of ", token.symbol(), " from ", _hex(sender), " to ", _hex(receiver)
        );
    }

    function _descriptionUpgrade(bytes32 lang, ISuperToken token, uint256 amount) internal view returns (string memory) {
        _requireEnglish(lang);
        address underlyingToken = token.getUnderlyingToken();
        return string.concat(
            "Upgrade ",
            amount.toHumanReadable(),
            " ",
            IERC20Metadata(underlyingToken).symbol(),
            " to ",
            token.symbol()
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
            "Approve ",
            _hex(spender),
            " for an allowance of ",
            amount.toHumanReadable(),
            " ",
            token.symbol()
        );
    }

    function _descriptionTransfer(bytes32 lang, ISuperToken token, address receiver, uint256 amount)
        internal
        view
        returns (string memory)
    {
        _requireEnglish(lang);
        return string.concat(
            "Transfer ",
            amount.toHumanReadable(),
            " ",
            token.symbol(),
            " to ",
            _hex(receiver)
        );
    }

    function _requireEnglish(bytes32 lang) internal pure {
        if (lang != LANG_EN) revert UnsupportedLanguage();
    }

    function _hex(address account) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(account)), 20);
    }
}
