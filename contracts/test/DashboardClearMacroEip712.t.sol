// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {VmSafe} from "forge-std/Vm.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {DashboardClearMacro} from "../src/DashboardClearMacro.sol";
import {DashboardClearMacroTestBase} from "./DashboardClearMacroTestBase.t.sol";

/**
 * EIP-712 cross-checks. The main suite signs and verifies through `forwarder.getDigest`, so a
 * systematically wrong type string or field ordering would still round-trip unnoticed. These tests
 * recompute every hashing layer independently — from type-definition literals redeclared here, not
 * read from the contract — so any drift in the published EIP-712 surface fails loudly.
 */
contract DashboardClearMacroEip712Test is DashboardClearMacroTestBase {
    // Mirrors of the contract's typedefs, deliberately duplicated as literals: changing a typedef in
    // DashboardClearMacro without a coordinated wallet-side change must break this suite.
    string internal constant TYPEDEF_SECURITY =
        "Security(string domain,address macroContract,string provider,"
        "uint256 validAfter,uint256 validBefore,uint256 nonce)";
    string internal constant TYPEDEF_CREATE_FLOW =
        "Action(string description,address token,address receiver,int96 flowRate)";
    string internal constant TYPEDEF_UPDATE_FLOW =
        "Action(string description,address token,address receiver,int96 flowRate)";
    string internal constant TYPEDEF_DELETE_FLOW =
        "Action(string description,address token,address sender,address receiver)";
    string internal constant TYPEDEF_UPGRADE = "Action(string description,address token,uint256 amount)";
    string internal constant TYPEDEF_DOWNGRADE = "Action(string description,address token,uint256 amount)";
    string internal constant TYPEDEF_APPROVE =
        "Action(string description,address token,address spender,uint256 amount)";
    string internal constant TYPEDEF_TRANSFER =
        "Action(string description,address token,address receiver,uint256 amount)";
    string internal constant TYPEDEF_SCHEDULE_FLOW =
        "Action(string description,address token,address receiver,uint32 startDate,int96 flowRate,uint32 endDate)";
    string internal constant TYPEDEF_DELETE_FLOW_SCHEDULE =
        "Action(string description,address token,address receiver)";

    uint32 internal constant START_DATE = 1750000000;
    uint32 internal constant END_DATE = 1760000000;

    function testPrimaryTypeNamesAndTypeDefinitionsAllActions() external view {
        _assertTypeSurface(_encCreateFlow(), "CreateFlow", TYPEDEF_CREATE_FLOW);
        _assertTypeSurface(_encUpdateFlow(), "UpdateFlow", TYPEDEF_UPDATE_FLOW);
        _assertTypeSurface(_encDeleteFlow(), "DeleteFlow", TYPEDEF_DELETE_FLOW);
        _assertTypeSurface(_encUpgrade(), "Upgrade", TYPEDEF_UPGRADE);
        _assertTypeSurface(_encDowngrade(), "Downgrade", TYPEDEF_DOWNGRADE);
        _assertTypeSurface(_encApprove(), "Approve", TYPEDEF_APPROVE);
        _assertTypeSurface(_encTransfer(), "Transfer", TYPEDEF_TRANSFER);
        _assertTypeSurface(_scheduleParams(bob, START_DATE, DEFAULT_FLOW_RATE, END_DATE), "ScheduleFlow", TYPEDEF_SCHEDULE_FLOW);
        _assertTypeSurface(_encDeleteFlowSchedule(), "DeleteFlowSchedule", TYPEDEF_DELETE_FLOW_SCHEDULE);

        // The forwarder composes the full EIP-712 type definition from the macro's parts.
        assertEq(
            forwarder.getTypeDefinition(dashboardClearMacro, _payloadFor(_encTransfer())),
            string.concat("Transfer", "(Action action,Security security)", TYPEDEF_TRANSFER, TYPEDEF_SECURITY)
        );
    }

    function testDomainSeparatorMatchesErc5267() external view {
        (, string memory name, string memory version, uint256 chainId, address verifyingContract,,) =
            forwarder.eip712Domain();
        assertEq(name, "ClearMacro");
        assertEq(version, "1");
        assertEq(chainId, block.chainid);
        assertEq(verifyingContract, address(forwarder));
    }

    // Recomputes every layer of the Transfer digest from first principles (the description is built
    // from string literals, not describeTransfer) and pinpoints which layer diverges on failure.
    function testDigestMatchesIndependentRecomputation() external view {
        bytes memory actionParams = _encTransfer();
        bytes memory payload = _payloadFor(actionParams);

        bytes32 actionStructHash = keccak256(
            abi.encode(
                keccak256(bytes(TYPEDEF_TRANSFER)),
                keccak256(bytes(_expectedTransferDescription())),
                superToken,
                bob,
                DEFAULT_AMOUNT
            )
        );
        assertEq(dashboardClearMacro.getActionStructHash(actionParams), actionStructHash, "action struct hash");

        bytes32 primaryTypeHash = keccak256(
            bytes(string.concat("Transfer", "(Action action,Security security)", TYPEDEF_TRANSFER, TYPEDEF_SECURITY))
        );
        assertEq(forwarder.getTypeHash(dashboardClearMacro, payload), primaryTypeHash, "primary type hash");

        bytes32 securityStructHash = keccak256(
            abi.encode(
                keccak256(bytes(TYPEDEF_SECURITY)),
                keccak256(bytes(SECURITY_DOMAIN)),
                address(dashboardClearMacro),
                keccak256(bytes(PROVIDER)),
                uint256(0),
                uint256(0),
                uint256(0)
            )
        );
        bytes32 structHash = keccak256(abi.encode(primaryTypeHash, actionStructHash, securityStructHash));
        assertEq(forwarder.getStructHash(dashboardClearMacro, payload), structHash, "struct hash");

        bytes32 digest = keccak256(abi.encodePacked(hex"1901", _domainSeparator(), structHash));
        assertEq(forwarder.getDigest(dashboardClearMacro, payload), digest, "digest");
    }

    // The actual clear-signing guarantee: a wallet that reconstructs the digest purely from the
    // published type strings — never calling getDigest — produces a signature the forwarder accepts.
    function testIndependentlySignedDigestExecutes() external {
        VmSafe.Wallet memory signer = _newSigner("independent-signer");
        _fundSuper(signer, 1e18);
        uint256 bobBefore = superToken.balanceOf(bob);
        uint256 feeReceiverBefore = superToken.balanceOf(FEE_RECEIVER);

        uint256 nonce = forwarder.getNonce(signer.addr, 0);
        bytes memory payload = _getEncodedPayload(_encTransfer(), PROVIDER, 0, 0, nonce, address(dashboardClearMacro));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer, _recomputedTransferDigest(nonce));
        forwarder.runMacro(dashboardClearMacro, payload, signer.addr, abi.encodePacked(r, s, v));

        assertEq(superToken.balanceOf(bob), bobBefore + DEFAULT_AMOUNT);
        assertEq(superToken.balanceOf(FEE_RECEIVER), feeReceiverBefore + BASE_FEE);
    }

    function _recomputedTransferDigest(uint256 nonce) internal view returns (bytes32) {
        bytes32 actionStructHash = keccak256(
            abi.encode(
                keccak256(bytes(TYPEDEF_TRANSFER)),
                keccak256(bytes(_expectedTransferDescription())),
                superToken,
                bob,
                DEFAULT_AMOUNT
            )
        );
        bytes32 primaryTypeHash = keccak256(
            bytes(string.concat("Transfer", "(Action action,Security security)", TYPEDEF_TRANSFER, TYPEDEF_SECURITY))
        );
        bytes32 securityStructHash = keccak256(
            abi.encode(
                keccak256(bytes(TYPEDEF_SECURITY)),
                keccak256(bytes(SECURITY_DOMAIN)),
                address(dashboardClearMacro),
                keccak256(bytes(PROVIDER)),
                uint256(0),
                uint256(0),
                nonce
            )
        );
        return keccak256(
            abi.encodePacked(
                hex"1901", _domainSeparator(), keccak256(abi.encode(primaryTypeHash, actionStructHash, securityStructHash))
            )
        );
    }

    // The struct hash commits to the exact describe<Action> output, so what the wallet renders is
    // what the signature covers.
    function testActionStructHashCommitsToDescriptionFlowAndTokenOps() external view {
        {
            string memory desc = dashboardClearMacro.describeCreateFlow(
                LANG_EN,
                DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encCreateFlow()),
                keccak256(
                    abi.encode(
                        keccak256(bytes(TYPEDEF_CREATE_FLOW)), keccak256(bytes(desc)), superToken, bob, DEFAULT_FLOW_RATE
                    )
                ),
                "CreateFlow"
            );
        }
        {
            string memory desc = dashboardClearMacro.describeUpdateFlow(
                LANG_EN,
                DashboardClearMacro.UpdateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encUpdateFlow()),
                keccak256(
                    abi.encode(
                        keccak256(bytes(TYPEDEF_UPDATE_FLOW)), keccak256(bytes(desc)), superToken, bob, DEFAULT_FLOW_RATE
                    )
                ),
                "UpdateFlow"
            );
        }
        {
            string memory desc = dashboardClearMacro.describeDeleteFlow(
                LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: alice, receiver: bob})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encDeleteFlow()),
                keccak256(
                    abi.encode(keccak256(bytes(TYPEDEF_DELETE_FLOW)), keccak256(bytes(desc)), superToken, alice, bob)
                ),
                "DeleteFlow"
            );
        }
        {
            string memory desc = dashboardClearMacro.describeUpgrade(
                LANG_EN, DashboardClearMacro.UpgradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encUpgrade()),
                keccak256(
                    abi.encode(keccak256(bytes(TYPEDEF_UPGRADE)), keccak256(bytes(desc)), superToken, DEFAULT_AMOUNT)
                ),
                "Upgrade"
            );
        }
        {
            string memory desc = dashboardClearMacro.describeDowngrade(
                LANG_EN, DashboardClearMacro.DowngradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encDowngrade()),
                keccak256(
                    abi.encode(keccak256(bytes(TYPEDEF_DOWNGRADE)), keccak256(bytes(desc)), superToken, DEFAULT_AMOUNT)
                ),
                "Downgrade"
            );
        }
    }

    function testActionStructHashCommitsToDescriptionTransferAndScheduleOps() external view {
        {
            string memory desc = dashboardClearMacro.describeApprove(
                LANG_EN, DashboardClearMacro.ApproveParams({superToken: superToken, spender: alice, amount: DEFAULT_AMOUNT})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encApprove()),
                keccak256(
                    abi.encode(
                        keccak256(bytes(TYPEDEF_APPROVE)), keccak256(bytes(desc)), superToken, alice, DEFAULT_AMOUNT
                    )
                ),
                "Approve"
            );
        }
        {
            string memory desc = dashboardClearMacro.describeTransfer(
                LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encTransfer()),
                keccak256(
                    abi.encode(
                        keccak256(bytes(TYPEDEF_TRANSFER)), keccak256(bytes(desc)), superToken, bob, DEFAULT_AMOUNT
                    )
                ),
                "Transfer"
            );
        }
        {
            string memory desc = dashboardClearMacro.describeScheduleFlow(
                LANG_EN,
                DashboardClearMacro.ScheduleFlowParams({
                    superToken: superToken,
                    receiver: bob,
                    startDate: START_DATE,
                    flowRate: DEFAULT_FLOW_RATE,
                    endDate: END_DATE
                })
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_scheduleParams(bob, START_DATE, DEFAULT_FLOW_RATE, END_DATE)),
                keccak256(
                    abi.encode(
                        keccak256(bytes(TYPEDEF_SCHEDULE_FLOW)),
                        keccak256(bytes(desc)),
                        superToken,
                        bob,
                        START_DATE,
                        DEFAULT_FLOW_RATE,
                        END_DATE
                    )
                ),
                "ScheduleFlow"
            );
        }
        {
            string memory desc = dashboardClearMacro.describeDeleteFlowSchedule(
                LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
            );
            assertEq(
                dashboardClearMacro.getActionStructHash(_encDeleteFlowSchedule()),
                keccak256(
                    abi.encode(keccak256(bytes(TYPEDEF_DELETE_FLOW_SCHEDULE)), keccak256(bytes(desc)), superToken, bob)
                ),
                "DeleteFlowSchedule"
            );
        }
    }

    function testActionStructHashChangesWhenDescriptionTampered() external view {
        string memory desc = dashboardClearMacro.describeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
        bytes32 tamperedHash = keccak256(
            abi.encode(
                keccak256(bytes(TYPEDEF_TRANSFER)),
                keccak256(bytes(string.concat(desc, " "))),
                superToken,
                bob,
                DEFAULT_AMOUNT
            )
        );
        assertTrue(dashboardClearMacro.getActionStructHash(_encTransfer()) != tamperedHash);
    }

    function _assertTypeSurface(bytes memory actionParams, string memory primaryTypeName, string memory typeDefinition)
        internal
        view
    {
        bytes memory payload = _payloadFor(actionParams);
        assertEq(dashboardClearMacro.getPrimaryTypeName(payload), primaryTypeName);
        assertEq(dashboardClearMacro.getActionTypeDefinition(payload), typeDefinition);
    }

    // getPrimaryTypeName/getActionTypeDefinition expect the full Payload encoding (getActionStructHash
    // takes the bare actionParams). Security contents don't affect the type surface.
    function _payloadFor(bytes memory actionParams) internal view returns (bytes memory) {
        return _getEncodedPayload(actionParams, PROVIDER, 0, 0, 0, address(dashboardClearMacro));
    }

    function _domainSeparator() internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("ClearMacro")),
                keccak256(bytes("1")),
                block.chainid,
                address(forwarder)
            )
        );
    }

    // Built from literals on purpose — must not call describeTransfer (see file header).
    function _expectedTransferDescription() internal view returns (string memory) {
        return string.concat(
            "Transfer 0.10000 ",
            superToken.symbol(),
            " to ",
            Strings.toHexString(uint256(uint160(bob)), 20),
            ", plus a relay fee of 0.00100 ",
            superToken.symbol(),
            " payable to ",
            Strings.toHexString(uint256(uint160(FEE_RECEIVER)), 20)
        );
    }

    function _encCreateFlow() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeCreateFlow(
            LANG_EN,
            DashboardClearMacro.CreateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
    }

    function _encUpdateFlow() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeUpdateFlow(
            LANG_EN,
            DashboardClearMacro.UpdateFlowParams({superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE})
        );
    }

    function _encDeleteFlow() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({superToken: superToken, sender: alice, receiver: bob})
        );
    }

    function _encUpgrade() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeUpgrade(
            LANG_EN, DashboardClearMacro.UpgradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
    }

    function _encDowngrade() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeDowngrade(
            LANG_EN, DashboardClearMacro.DowngradeParams({superToken: superToken, amount: DEFAULT_AMOUNT})
        );
    }

    function _encApprove() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeApprove(
            LANG_EN, DashboardClearMacro.ApproveParams({superToken: superToken, spender: alice, amount: DEFAULT_AMOUNT})
        );
    }

    function _encTransfer() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT})
        );
    }

    function _encDeleteFlowSchedule() internal view returns (bytes memory) {
        return dashboardClearMacro.encodeDeleteFlowSchedule(
            LANG_EN, DashboardClearMacro.DeleteFlowScheduleParams({superToken: superToken, receiver: bob})
        );
    }
}
