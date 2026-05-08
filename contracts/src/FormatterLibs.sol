// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.26;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

using Strings for uint256;

function _formatUnits(uint256 amount, uint8 exponent, uint8 maxDecimals)
    pure returns (string memory)
{
        // Step 1: Apply rounding first to the entire value
        if (exponent > maxDecimals) {
            uint256 factor = 10 ** (exponent - maxDecimals); // Scale factor to limit decimals
            amount = (amount + (factor / 2)) / factor; // Apply rounding
        }

        // Step 2: Calculate the integer part and fractional part after rounding
        uint256 intPart = amount / 10 ** maxDecimals;
        uint256 fracPart = amount % 10 ** maxDecimals;

        string memory intString = intPart.toString();

        // If fracPart is 0 after rounding, return just the integer part
        if (fracPart == 0) {
            return intString;
        }

        string memory fracString = fracPart.toString();

        // Add leading zeroes to the fractional part if needed
        while (bytes(fracString).length < maxDecimals) {
            fracString = string.concat("0", fracString);
        }

        // Step 4: Return the final formatted string with integer and fractional parts
        return string.concat(intString, ".", fracString);
    }

library FlowRateFormatter {
    enum Period {
        SECOND,
        MINUTE,
        HOUR,
        DAY,
        WEEK,
        MONTH,
        YEAR
    }

    error InvalidPeriod();

    function toFlowRatePerDay(int96 flowRate) internal pure returns (string memory) {
        return toFlowRateX(flowRate, Period.DAY, 5);
    }

    function toFlowRateX(int96 flowRate, Period period, uint8 maxDecimals) internal pure returns (string memory) {
        // Convert flow rate from wei/second to tokens/day. We know it's 18 decimals for all SuperTokens
        int256 absFlowRate = (flowRate < 0) ? -flowRate : flowRate;

        uint256 tokensPerPeriod = uint256(absFlowRate) * _getSecondsInPeriod(period);

        string memory frAbs = _formatUnits(tokensPerPeriod, 18, maxDecimals);

        return (flowRate < 0) ? string.concat("-", frAbs) : frAbs;
    }

    function _getSecondsInPeriod(Period period) private pure returns (uint256) {
        if (period == Period.SECOND) return 1;
        if (period == Period.MINUTE) return 60;
        if (period == Period.HOUR) return 3600;
        if (period == Period.DAY) return 86400;
        if (period == Period.WEEK) return 604800;
        if (period == Period.MONTH) return 2628000;
        if (period == Period.YEAR) return 31536000;

        revert InvalidPeriod();
    }
}

library AmountFormatter {
    function toHumanReadable(uint256 amount) internal pure returns (string memory) {
        return _formatUnits(amount, 18, 5);
    }
}