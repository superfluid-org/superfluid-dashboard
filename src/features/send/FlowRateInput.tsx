// TODO(KK): What's a better name?
import { BigNumber, ethers } from "ethers";
import { FC, useCallback, useEffect, useState } from "react";
import { Box, MenuItem, Select, TextField } from "@mui/material";

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

export type FlowRateWithTime = {
  amountWei: string;
  unitOfTime: UnitOfTime;
};

export const flowRateWithTimeToString = (
  flowRateWithTime: FlowRateWithTime,
  tokenSymbol?: string
) =>
  tokenSymbol
    ? `${ethers.utils.formatEther(flowRateWithTime.amountWei)} ${tokenSymbol}/${
        timeUnitWordMap[flowRateWithTime.unitOfTime]
      }`
    : `${ethers.utils.formatEther(flowRateWithTime.amountWei)}/${
        timeUnitWordMap[flowRateWithTime.unitOfTime]
      }`;

// TODO(KK): memoize
export const calculateTotalAmountWei = ({
  amountWei,
  unitOfTime,
}: FlowRateWithTime) => BigNumber.from(amountWei).div(unitOfTime);

export const FlowRateInput: FC<{
  flowRateWithTime: FlowRateWithTime;
  onChange: (flowRate: FlowRateWithTime) => void;
  onBlur: () => void;
}> = ({ flowRateWithTime, onChange, onBlur }) => {
  const [amount, setAmount] = useState<string>(
    !ethers.BigNumber.from(flowRateWithTime.amountWei).isZero()
      ? ethers.utils.formatEther(flowRateWithTime.amountWei)
      : ""
  );

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "6fr 4fr" }}>
      <TextField
        type="text"
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        placeholder="0.0"
        value={amount}
        onBlur={onBlur}
        onChange={(e) => {
          setAmount(e.currentTarget.value);
          const amountWei = ethers.utils.parseEther(
            Number(e.currentTarget.value)
              ? Number(e.currentTarget.value).toString()
              : "0"
          );
          onChange({
            ...flowRateWithTime,
            amountWei: amountWei.toString(),
          });
        }}
        inputProps={{
          sx: { borderRadius: "10px 0 0 10px" },
          pattern: "^[0-9]*[.,]?[0-9]*$",
          minlength: "1",
          maxLength: "79",
        }}
        sx={{
          ":hover, .Mui-focused": {
            zIndex: 1, // This helps to bring active right side border on top of select's border.
          },
          ".MuiOutlinedInput-notchedOutline": {
            borderRadius: "10px 0 0 10px",
          },
        }}
      />
      <Select
        value={flowRateWithTime.unitOfTime}
        onBlur={onBlur}
        onChange={(e) => {
          onChange({
            ...flowRateWithTime,
            unitOfTime: Number(e.target.value),
          });
        }}
        sx={{
          marginLeft: "-1px",
          ".MuiOutlinedInput-notchedOutline": {
            borderRadius: "0 10px 10px 0",
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
