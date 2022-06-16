// TODO(KK): What's a better name?
import { BigNumber, ethers } from "ethers";
import { FC, MouseEvent, useCallback, useEffect, useState } from "react";
import { Box, MenuItem, Select, TextField } from "@mui/material";
import { parseEther } from "@superfluid-finance/sdk-redux/node_modules/@ethersproject/units";
import { parseEtherOrZero } from "../../utils/tokenUtils";

/**
 * Enum numerical value is expressed in seconds.
 */
export enum UnitOfTime {
  Second = 1,
  Minute = 60,
  Hour = 3600,
  Day = 86400,
  Month = 2592000,
}

const unitOfTimeList = [
  UnitOfTime.Second,
  UnitOfTime.Minute,
  UnitOfTime.Hour,
  UnitOfTime.Day,
  UnitOfTime.Month,
];

export const timeUnitWordMap = {
  [UnitOfTime.Second]: "second",
  [UnitOfTime.Minute]: "minute",
  [UnitOfTime.Hour]: "hour",
  [UnitOfTime.Day]: "day",
  [UnitOfTime.Month]: "month",
};

export type FlowRateWei = {
  amountWei: string;
  unitOfTime: UnitOfTime;
};

export type FlowRateEther = {
  amountEther: string;
  unitOfTime: UnitOfTime;
};

export const flowRateWeiToString = (
  flowRateWei: FlowRateWei,
  tokenSymbol?: string
) =>
  tokenSymbol
    ? `${ethers.utils.formatEther(flowRateWei.amountWei)} ${tokenSymbol}/${
        timeUnitWordMap[flowRateWei.unitOfTime]
      }`
    : `${ethers.utils.formatEther(flowRateWei.amountWei)}/${
        timeUnitWordMap[flowRateWei.unitOfTime]
      }`;

export const flowRateEtherToString = (
  flowRateEther: FlowRateEther,
  tokenSymbol?: string
) =>
  tokenSymbol
    ? `${flowRateEther.amountEther} ${tokenSymbol}/${
        timeUnitWordMap[flowRateEther.unitOfTime]
      }`
    : `${flowRateEther.amountEther}/${
        timeUnitWordMap[flowRateEther.unitOfTime]
      }`;

export const calculateTotalAmountWei = (
  flowRate: FlowRateWei | FlowRateEther
) =>
  isFlowRateWei(flowRate)
    ? BigNumber.from(flowRate.amountWei).div(flowRate.unitOfTime)
    : parseEtherOrZero(flowRate.amountEther).isZero()
    ? BigNumber.from("0")
    : parseEther(flowRate.amountEther).div(flowRate.unitOfTime);

const isFlowRateWei = (
  flowRate: FlowRateWei | FlowRateEther
): flowRate is FlowRateWei => !!(flowRate as any).amountWei;

export const FlowRateInput: FC<{
  flowRateEther: FlowRateEther;
  onChange: (flowRate: FlowRateEther) => void;
  onBlur: () => void;
}> = ({ flowRateEther: flowRate, onChange, onBlur }) => {
  const [flowRateFocused, setFlowRateFocused] = useState(false);

  const onFlowRateFocus = () => {
    setFlowRateFocused(true);
  };

  const onFlowRateBlur = () => {
    onBlur();
    setFlowRateFocused(false);
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "6fr 4fr" }}>
      <TextField
        data-cy={"flow-rate-input"}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        placeholder="0.0"
        value={flowRate.amountEther}
        onBlur={onFlowRateBlur}
        onFocus={onFlowRateFocus}
        onChange={(e) => {
          onChange({
            ...flowRate,
            amountEther: e.currentTarget.value,
          });
        }}
        InputProps={{
          sx: { borderRadius: "10px 0 0 10px" },
        }}
        sx={{
          ".MuiOutlinedInput-notchedOutline": {
            borderRadius: "10px 0 0 10px",
            borderRight: 0,
          },
          "> .Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderRight: 0,
          },
          // TODO: This should have easier solution. Only with css would be perfect.
          ...(flowRateFocused
            ? {
                "& + .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderLeftColor: "primary.main",
                },
              }
            : {
                "&:hover + .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                  {
                    borderLeftColor: "text.primary",
                  },
              }),
        }}
      />
      <Select
        data-cy={"time-unit-selection-button"}
        value={flowRate.unitOfTime}
        onBlur={onBlur}
        onChange={(e) => {
          onChange({
            ...flowRate,
            unitOfTime: Number(e.target.value),
          });
        }}
        sx={{
          marginLeft: "-1px",
          ".MuiOutlinedInput-notchedOutline": {
            borderRadius: "0 10px 10px 0",
            ...(flowRateFocused && { borderLeft: "2px solid" }),
          },
        }}
      >
        {unitOfTimeList.map((unitOfTime) => (
          <MenuItem key={`${unitOfTime}-second(s)`} value={unitOfTime}>
            {`/ ${timeUnitWordMap[unitOfTime]}`}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
