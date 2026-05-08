// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import { VmSafe } from "forge-std/Vm.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

import { FoundrySuperfluidTester } from "@superfluid-finance/ethereum-contracts/test/foundry/FoundrySuperfluidTester.t.sol";
import { IERC20, ISuperToken, ISuperfluidToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { SuperTokenV1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";
import { ClearMacroForwarderV1, NonceManager } from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroForwarderV1.sol";
import { ClearMacroBase } from "@superfluid-finance/ethereum-contracts/contracts/utils/ClearMacroBase.sol";
import { IClearMacroForwarderV1 } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/utils/IClearMacroForwarderV1.sol";

import { DashboardClearMacro } from "../src/DashboardClearMacro.sol";

using SuperTokenV1Library for ISuperToken;

contract DashboardClearMacroTest is FoundrySuperfluidTester {
    bytes32 internal constant LANG_EN = bytes32("en");
    string internal constant PROVIDER = "dashboard-provider";
    int96 internal constant DEFAULT_FLOW_RATE = 1_157_407_407_407; // 0.1/day
    uint256 internal constant DEFAULT_AMOUNT = 1e17;

    DashboardClearMacro internal dashboardMacro;
    ClearMacroForwarderV1 internal forwarder;

    constructor() FoundrySuperfluidTester(5) { }

    function setUp() public override {
        super.setUp();
        dashboardMacro = new DashboardClearMacro(sf.host);
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
            } catch { }
        }
        revert("unable to grant provider role");
    }

    function testCreateFlow() external {
        VmSafe.Wallet memory signer = _newSigner("create");
        _fundSuper(signer, 100e18);

        bytes memory action = dashboardMacro.encodeCreateFlow(
            LANG_EN, DashboardClearMacro.CreateFlowParams({ superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE })
        );
        _runAsProvider(signer, action, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), DEFAULT_FLOW_RATE);
    }

    function testUpdateFlow() external {
        VmSafe.Wallet memory signer = _newSigner("update");
        _fundSuper(signer, 100e18);
        bytes memory createAction = dashboardMacro.encodeCreateFlow(
            LANG_EN, DashboardClearMacro.CreateFlowParams({ superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE })
        );
        _runAsProvider(signer, createAction, 0, PROVIDER, 0, 0);

        int96 newRate = DEFAULT_FLOW_RATE * 2;
        bytes memory action = dashboardMacro.encodeUpdateFlow(
            LANG_EN, DashboardClearMacro.UpdateFlowParams({ superToken: superToken, receiver: bob, flowRate: newRate })
        );
        _runAsProvider(signer, action, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), newRate);
    }

    function testDeleteFlow() external {
        VmSafe.Wallet memory signer = _newSigner("delete");
        _fundSuper(signer, 100e18);
        bytes memory createAction = dashboardMacro.encodeCreateFlow(
            LANG_EN, DashboardClearMacro.CreateFlowParams({ superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE })
        );
        _runAsProvider(signer, createAction, 0, PROVIDER, 0, 0);

        bytes memory action = dashboardMacro.encodeDeleteFlow(
            LANG_EN,
            DashboardClearMacro.DeleteFlowParams({ superToken: superToken, sender: signer.addr, receiver: bob })
        );
        _runAsProvider(signer, action, 0, PROVIDER, 0, 0);

        assertEq(superToken.getFlowRate(signer.addr, bob), 0);
    }

    function testUpgrade() external {
        VmSafe.Wallet memory signer = _newSigner("upgrade");
        _fundUnderlyingAndApprove(signer, 1e18);

        bytes memory action = dashboardMacro.encodeUpgrade(
            LANG_EN, DashboardClearMacro.UpgradeParams({ superToken: superToken, amount: DEFAULT_AMOUNT })
        );
        _runAsProvider(signer, action, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), DEFAULT_AMOUNT);
    }

    function testDowngrade() external {
        VmSafe.Wallet memory signer = _newSigner("downgrade");
        _fundSuper(signer, 1e18);

        bytes memory action = dashboardMacro.encodeDowngrade(
            LANG_EN, DashboardClearMacro.DowngradeParams({ superToken: superToken, amount: DEFAULT_AMOUNT })
        );
        _runAsProvider(signer, action, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), 1e18 - DEFAULT_AMOUNT);
    }

    function testApprove() external {
        VmSafe.Wallet memory signer = _newSigner("approve");
        _fundSuper(signer, 1e18);

        bytes memory action = dashboardMacro.encodeApprove(
            LANG_EN, DashboardClearMacro.ApproveParams({ superToken: superToken, spender: bob, amount: DEFAULT_AMOUNT })
        );
        _runAsProvider(signer, action, 0, PROVIDER, 0, 0);

        assertEq(superToken.allowance(signer.addr, bob), DEFAULT_AMOUNT);
    }

    function testTransfer() external {
        VmSafe.Wallet memory signer = _newSigner("transfer");
        _fundSuper(signer, 1e18);
        uint256 bobBefore = superToken.balanceOf(bob);

        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        _runAsProvider(signer, action, 0, PROVIDER, 0, 0);

        assertEq(superToken.balanceOf(signer.addr), 1e18 - DEFAULT_AMOUNT);
        assertEq(superToken.balanceOf(bob), bobBefore + DEFAULT_AMOUNT);
    }

    function testEnglishDescriptionsForAllActions() external view {
        string memory receiverHex = Strings.toHexString(uint256(uint160(bob)), 20);
        string memory spenderHex = Strings.toHexString(uint256(uint160(alice)), 20);
        string memory createDesc = dashboardMacro.describeCreateFlow(
            LANG_EN, DashboardClearMacro.CreateFlowParams({ superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE })
        );
        assertTrue(_contains(createDesc, "Create a new flow of"));
        assertTrue(_contains(createDesc, superToken.symbol()));
        assertTrue(_contains(createDesc, receiverHex));

        string memory updateDesc = dashboardMacro.describeUpdateFlow(
            LANG_EN, DashboardClearMacro.UpdateFlowParams({ superToken: superToken, receiver: bob, flowRate: DEFAULT_FLOW_RATE })
        );
        assertTrue(_contains(updateDesc, "Update flow to"));
        assertTrue(_contains(updateDesc, superToken.symbol()));
        assertTrue(_contains(updateDesc, receiverHex));

        string memory deleteDesc = dashboardMacro.describeDeleteFlow(
            LANG_EN, DashboardClearMacro.DeleteFlowParams({ superToken: superToken, sender: alice, receiver: bob })
        );
        assertTrue(_contains(deleteDesc, "Delete flow of"));
        assertTrue(_contains(deleteDesc, superToken.symbol()));
        assertTrue(_contains(deleteDesc, spenderHex));
        assertTrue(_contains(deleteDesc, receiverHex));

        string memory upgradeDesc = dashboardMacro.describeUpgrade(
            LANG_EN, DashboardClearMacro.UpgradeParams({ superToken: superToken, amount: DEFAULT_AMOUNT })
        );
        assertTrue(_contains(upgradeDesc, "Upgrade"));
        assertTrue(_contains(upgradeDesc, superToken.symbol()));

        string memory downgradeDesc = dashboardMacro.describeDowngrade(
            LANG_EN, DashboardClearMacro.DowngradeParams({ superToken: superToken, amount: DEFAULT_AMOUNT })
        );
        assertTrue(_contains(downgradeDesc, "Downgrade"));
        assertTrue(_contains(downgradeDesc, superToken.symbol()));

        string memory approveDesc = dashboardMacro.describeApprove(
            LANG_EN, DashboardClearMacro.ApproveParams({ superToken: superToken, spender: alice, amount: DEFAULT_AMOUNT })
        );
        assertTrue(_contains(approveDesc, "Approve"));
        assertTrue(_contains(approveDesc, spenderHex));

        string memory transferDesc = dashboardMacro.describeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        assertTrue(_contains(transferDesc, "Transfer"));
        assertTrue(_contains(transferDesc, receiverHex));
    }

    function testRevertsOnInvalidSignature() external {
        VmSafe.Wallet memory signer = _newSigner("sig-good");
        VmSafe.Wallet memory wrongSigner = _newSigner("sig-bad");
        _fundSuper(signer, 1e18);

        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        bytes memory payload = _buildPayload(action, PROVIDER, 0, 0, 0, address(dashboardMacro));
        bytes memory badSig = _signPayload(wrongSigner, payload);

        vm.expectRevert(ClearMacroForwarderV1.InvalidSignature.selector);
        forwarder.runMacro(dashboardMacro, payload, signer.addr, badSig);
    }

    function testRevertsOnMacroMismatch() external {
        VmSafe.Wallet memory signer = _newSigner("mismatch");
        _fundSuper(signer, 1e18);
        DashboardClearMacro otherMacro = new DashboardClearMacro(sf.host);

        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        bytes memory payload = _buildPayload(action, PROVIDER, 0, 0, 0, address(dashboardMacro));
        bytes memory sig = _signPayload(signer, payload);

        vm.expectRevert(
            abi.encodeWithSelector(ClearMacroForwarderV1.MacroContractMismatch.selector, address(dashboardMacro), address(otherMacro))
        );
        forwarder.runMacro(otherMacro, payload, signer.addr, sig);
    }

    function testRevertsWhenProviderMissingRole() external {
        VmSafe.Wallet memory signer = _newSigner("missing-role");
        _fundSuper(signer, 1e18);

        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        bytes memory payload = _buildPayload(action, "other-provider", 0, 0, 0, address(dashboardMacro));
        bytes memory sig = _signPayload(signer, payload);

        vm.prank(address(0xBEEF));
        vm.expectRevert(
            abi.encodeWithSelector(
                ClearMacroForwarderV1.ProviderNotAuthorized.selector,
                "other-provider",
                address(0xBEEF)
            )
        );
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);
    }

    function testSelfRelaySucceeds() external {
        VmSafe.Wallet memory signer = _newSigner("self-relay");
        _fundSuper(signer, 1e18);
        uint256 bobBefore = superToken.balanceOf(bob);

        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        bytes memory payload = _buildPayload(action, "self", 0, 0, 0, address(dashboardMacro));
        bytes memory sig = _signPayload(signer, payload);

        vm.prank(signer.addr);
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);
        assertEq(superToken.balanceOf(bob), bobBefore + DEFAULT_AMOUNT);
    }

    function testSelfRelayRevertsWhenDifferentExecutor() external {
        VmSafe.Wallet memory signer = _newSigner("self-relay-revert");
        _fundSuper(signer, 1e18);

        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        bytes memory payload = _buildPayload(action, "self", 0, 0, 0, address(dashboardMacro));
        bytes memory sig = _signPayload(signer, payload);

        vm.expectRevert(
            abi.encodeWithSelector(ClearMacroForwarderV1.ProviderNotAuthorized.selector, "self", address(this))
        );
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);
    }

    function testRevertsOnUnsupportedLanguage() external {
        address signer = _newSigner("lang").addr;
        bytes memory action = dashboardMacro.encodeTransfer(
            bytes32("fr"), DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        bytes memory payload = _buildPayload(action, PROVIDER, 0, 0, forwarder.getNonce(signer, 0), address(dashboardMacro));

        vm.expectRevert(ClearMacroBase.UnsupportedLanguage.selector);
        forwarder.getDigest(dashboardMacro, payload);
    }

    function testRevertsOnUnknownActionId() external {
        address signer = _newSigner("unknown-action").addr;
        bytes memory action = abi.encode(uint8(99), LANG_EN, abi.encode(superToken, bob, DEFAULT_AMOUNT));
        bytes memory payload = _buildPayload(action, PROVIDER, 0, 0, forwarder.getNonce(signer, 0), address(dashboardMacro));

        vm.expectRevert(abi.encodeWithSelector(ClearMacroBase.UnknownActionId.selector, uint8(99)));
        forwarder.getDigest(dashboardMacro, payload);
    }

    function testNonceReplayReverts() external {
        VmSafe.Wallet memory signer = _newSigner("replay");
        _fundSuper(signer, 1e18);
        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );

        uint256 nonce = forwarder.getNonce(signer.addr, 0);
        bytes memory payload = _buildPayload(action, PROVIDER, 0, 0, nonce, address(dashboardMacro));
        bytes memory sig = _signPayload(signer, payload);

        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);

        vm.expectRevert(abi.encodeWithSelector(NonceManager.InvalidNonce.selector, signer.addr, nonce));
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);
    }

    function testNonceMustBeSequentialPerKey() external {
        VmSafe.Wallet memory signer = _newSigner("seq");
        _fundSuper(signer, 2e18);
        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );
        uint192 key = 7;

        uint256 nonceSeq1 = (uint256(key) << 64) | 1;
        bytes memory payloadSeq1 = _buildPayload(action, PROVIDER, 0, 0, nonceSeq1, address(dashboardMacro));
        bytes memory sigSeq1 = _signPayload(signer, payloadSeq1);

        vm.expectRevert(abi.encodeWithSelector(NonceManager.InvalidNonce.selector, signer.addr, nonceSeq1));
        forwarder.runMacro(dashboardMacro, payloadSeq1, signer.addr, sigSeq1);

        uint256 nonceSeq0 = uint256(key) << 64;
        bytes memory payloadSeq0 = _buildPayload(action, PROVIDER, 0, 0, nonceSeq0, address(dashboardMacro));
        bytes memory sigSeq0 = _signPayload(signer, payloadSeq0);
        forwarder.runMacro(dashboardMacro, payloadSeq0, signer.addr, sigSeq0);
        forwarder.runMacro(dashboardMacro, payloadSeq1, signer.addr, sigSeq1);
    }

    function testValidityWindowBoundaries() external {
        VmSafe.Wallet memory signer = _newSigner("window");
        _fundSuper(signer, 2e18);
        bytes memory action = dashboardMacro.encodeTransfer(
            LANG_EN, DashboardClearMacro.TransferParams({ superToken: superToken, receiver: bob, amount: DEFAULT_AMOUNT })
        );

        uint256 validAfter = block.timestamp + 100;
        uint256 validBefore = block.timestamp + 300;

        uint256 nonce = forwarder.getNonce(signer.addr, 0);
        bytes memory payload = _buildPayload(action, PROVIDER, validAfter, validBefore, nonce, address(dashboardMacro));
        bytes memory sig = _signPayload(signer, payload);

        vm.expectRevert(
            abi.encodeWithSelector(
                ClearMacroForwarderV1.OutsideValidityWindow.selector, block.timestamp, validBefore, validAfter
            )
        );
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);

        vm.warp(validAfter);
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);

        nonce = forwarder.getNonce(signer.addr, 0);
        payload = _buildPayload(action, PROVIDER, 0, validBefore, nonce, address(dashboardMacro));
        sig = _signPayload(signer, payload);
        vm.warp(validBefore + 1);
        vm.expectRevert(
            abi.encodeWithSelector(
                ClearMacroForwarderV1.OutsideValidityWindow.selector, validBefore + 1, validBefore, uint256(0)
            )
        );
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);
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

    function _buildPayload(
        bytes memory action,
        string memory provider,
        uint256 validAfter,
        uint256 validBefore,
        uint256 nonce,
        address macroAddress
    ) internal view returns (bytes memory) {
        IClearMacroForwarderV1.Security memory security = IClearMacroForwarderV1.Security({
            domain: "app.superfluid",
            macroContract: macroAddress,
            provider: provider,
            validAfter: validAfter,
            validBefore: validBefore,
            nonce: nonce
        });
        return forwarder.encodeParams(action, security);
    }

    function _runAsProvider(
        VmSafe.Wallet memory signer,
        bytes memory action,
        uint192 key,
        string memory provider,
        uint256 validAfter,
        uint256 validBefore
    ) internal {
        uint256 nonce = forwarder.getNonce(signer.addr, key);
        bytes memory payload = _buildPayload(action, provider, validAfter, validBefore, nonce, address(dashboardMacro));
        bytes memory sig = _signPayload(signer, payload);
        forwarder.runMacro(dashboardMacro, payload, signer.addr, sig);
    }

    function _signPayload(VmSafe.Wallet memory signer, bytes memory payload) internal returns (bytes memory) {
        bytes32 digest = forwarder.getDigest(dashboardMacro, payload);
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
