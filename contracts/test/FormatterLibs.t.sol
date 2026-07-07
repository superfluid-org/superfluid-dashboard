// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Test, stdError} from "forge-std/Test.sol";

import {_formatUnits, FlowRateFormatter, AmountFormatter} from "../src/FormatterLibs.sol";

// External wrappers so vm.expectRevert applies to the library calls and fuzz inputs go through
// calldata. `flowRateXRaw` coerces the Period enum in assembly: an out-of-range value can never
// arrive through the ABI (decoding panics first), so this is the only way to reach InvalidPeriod.
contract FormatterLibsHarness {
    function formatUnits(uint256 amount, uint8 exponent, uint8 maxDecimals) external pure returns (string memory) {
        return _formatUnits(amount, exponent, maxDecimals);
    }

    function flowRatePerDay(int96 flowRate) external pure returns (string memory) {
        return FlowRateFormatter.toFlowRatePerDay(flowRate);
    }

    function flowRateX(int96 flowRate, FlowRateFormatter.Period period, uint8 maxDecimals)
        external
        pure
        returns (string memory)
    {
        return FlowRateFormatter.toFlowRateX(flowRate, period, maxDecimals);
    }

    function flowRateXRaw(int96 flowRate, uint8 rawPeriod, uint8 maxDecimals)
        external
        pure
        returns (string memory)
    {
        FlowRateFormatter.Period period;
        assembly {
            period := rawPeriod
        }
        return FlowRateFormatter.toFlowRateX(flowRate, period, maxDecimals);
    }

    function humanReadable(uint256 amount) external pure returns (string memory) {
        return AmountFormatter.toHumanReadable(amount);
    }
}

// The descriptions signed via ClearMacro embed these formatter outputs verbatim, and the
// FeeNotRepresentable constructor guard relies on 1e13-multiples formatting exactly — so the
// literals and rounding behavior below are part of the clear-signing contract.
contract FormatterLibsTest is Test {
    // toFlowRatePerDay(DEFAULT_FLOW_RATE) as used across the DashboardClearMacro tests.
    int96 internal constant DEFAULT_FLOW_RATE = 1_157_407_407_407; // 0.1/day

    FormatterLibsHarness internal harness;

    function setUp() public {
        harness = new FormatterLibsHarness();
    }

    function testFormatUnitsWholeNumber() external view {
        assertEq(harness.formatUnits(1e18, 18, 5), "1");
    }

    function testFormatUnitsZero() external view {
        assertEq(harness.formatUnits(0, 18, 5), "0");
    }

    function testFormatUnitsKeepsTrailingZeros() external view {
        assertEq(harness.formatUnits(1e15, 18, 5), "0.00100");
    }

    function testFormatUnitsPadsLeadingFractionZeros() external view {
        assertEq(harness.formatUnits(1e13, 18, 5), "0.00001");
    }

    function testFormatUnitsRoundsHalfUp() external view {
        assertEq(harness.formatUnits(5e12, 18, 5), "0.00001"); // exact half rounds up
    }

    function testFormatUnitsRoundsDownBelowHalf() external view {
        assertEq(harness.formatUnits(4_999_999_999_999, 18, 5), "0");
    }

    function testFormatUnitsRoundingStaysInFraction() external view {
        assertEq(harness.formatUnits(999_990e12, 18, 5), "0.99999");
    }

    function testFormatUnitsRoundingCarriesToIntegerPart() external view {
        assertEq(harness.formatUnits(1e18 - 5e12, 18, 5), "1"); // carry collapses the fraction
    }

    function testFormatUnitsFracZeroShortCircuit() external view {
        assertEq(harness.formatUnits(42e18, 18, 5), "42");
    }

    function testFormatUnitsNoRoundingWhenExponentEqualsMaxDecimals() external view {
        assertEq(harness.formatUnits(123456, 5, 5), "1.23456");
    }

    function testFlowRatePerDayDefaultRate() external view {
        assertEq(harness.flowRatePerDay(DEFAULT_FLOW_RATE), "0.10000");
    }

    function testFlowRatePerDayNegative() external view {
        assertEq(harness.flowRatePerDay(-DEFAULT_FLOW_RATE), "-0.10000");
    }

    function testFlowRatePerDayZero() external view {
        assertEq(harness.flowRatePerDay(0), "0");
    }

    function testFlowRateXAllPeriods() external view {
        assertEq(harness.flowRateX(1e13, FlowRateFormatter.Period.SECOND, 5), "0.00001");
        assertEq(harness.flowRateX(1e13, FlowRateFormatter.Period.MINUTE, 5), "0.00060");
        assertEq(harness.flowRateX(1e13, FlowRateFormatter.Period.HOUR, 5), "0.03600");
        assertEq(harness.flowRateX(1e13, FlowRateFormatter.Period.DAY, 5), "0.86400");
        assertEq(harness.flowRateX(1e13, FlowRateFormatter.Period.WEEK, 5), "6.04800");
        assertEq(harness.flowRateX(1e13, FlowRateFormatter.Period.MONTH, 5), "26.28000");
        assertEq(harness.flowRateX(1e13, FlowRateFormatter.Period.YEAR, 5), "315.36000");
    }

    // An out-of-range period cannot reach the InvalidPeriod revert: the compiler's enum cleanup
    // panics (0x21) first, even when the value is smuggled in via assembly. The custom error is
    // therefore purely defensive; this test locks in that an invalid period always reverts.
    function testFlowRateXOutOfRangePeriodPanics() external {
        vm.expectRevert(stdError.enumConversionError);
        harness.flowRateXRaw(1e13, 7, 5);
    }

    // Locks the fee literals disclosed by DashboardClearMacro for BASE_FEE = 1e15 (1x/2x/3x).
    function testToHumanReadableFeeAmounts() external view {
        assertEq(harness.humanReadable(1e15), "0.00100");
        assertEq(harness.humanReadable(2e15), "0.00200");
        assertEq(harness.humanReadable(3e15), "0.00300");
    }

    // Any fee amount that passes the FeeNotRepresentable guard (a multiple of 1e13) formats without
    // loss: the disclosed string equals the exact amount charged.
    function testFuzzFormatUnitsRoundTripForRepresentableAmounts(uint256 k) external view {
        k = bound(k, 0, 1e12);
        uint256 amount = k * 1e13;
        assertEq(_parseUnits(harness.formatUnits(amount, 18, 5)), amount);
    }

    // The formatter rounds half-up to the nearest 1e13 step: error is in (-5e12, +5e12].
    function testFuzzFormatUnitsRoundsToNearestStep(uint256 amount) external view {
        amount = bound(amount, 0, 1e28);
        uint256 parsed = _parseUnits(harness.formatUnits(amount, 18, 5));
        assertEq(parsed % 1e13, 0);
        assertTrue(parsed + 5e12 > amount);
        assertTrue(parsed <= amount + 5e12);
    }

    // Excludes type(int96).min: `-flowRate` is evaluated in int96 and would panic before promotion.
    function testFuzzFlowRatePerDaySignSymmetry(int96 flowRate) external view {
        flowRate = int96(bound(int256(flowRate), 1, int256(type(int96).max)));
        assertEq(harness.flowRatePerDay(-flowRate), string.concat("-", harness.flowRatePerDay(flowRate)));
    }

    // Parses the formatter's "[-]int[.frac]" output back to 18-decimal wei (absolute value).
    function _parseUnits(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 intPart;
        uint256 fracPart;
        uint256 fracDigits;
        bool inFraction;
        for (uint256 i = 0; i < b.length; ++i) {
            bytes1 c = b[i];
            if (c == "-") continue;
            if (c == ".") {
                inFraction = true;
                continue;
            }
            uint256 digit = uint256(uint8(c)) - 48;
            require(digit <= 9, "not a digit");
            if (inFraction) {
                fracPart = fracPart * 10 + digit;
                ++fracDigits;
            } else {
                intPart = intPart * 10 + digit;
            }
        }
        return intPart * 1e18 + fracPart * 10 ** (18 - fracDigits);
    }
}
