// TODO(KK): What's a better name?
import { BigNumber, BigNumberish, ethers } from "ethers";
import { FC, useEffect, useState } from "react";
import { Box, MenuItem, Select, Stack, TextField } from "@mui/material";

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
  amountWei: BigNumberish;
  unitOfTime: UnitOfTime;
};

// TODO(KK): memoize
export const calculateTotalAmountWei = ({
  amountWei,
  unitOfTime,
}: FlowRateWithTime) => BigNumber.from(amountWei).div(unitOfTime);

export const FlowRateInput: FC<{
  flowRateWithTime: FlowRateWithTime | undefined;
  onChange: (flowRate: FlowRateWithTime) => void;
}> = ({ flowRateWithTime: flowRate, onChange }) => {
  const [amount, setAmount] = useState<string>(
    flowRate ? ethers.utils.formatEther(flowRate.amountWei) : ""
  );

  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(flowRate?.amountWei ?? 0)
  );

  const [unitOfTime, setUnitOfTime] = useState<UnitOfTime>(
    flowRate?.unitOfTime ?? UnitOfTime.Hour
  );

  useEffect(
    () => setAmountWei(ethers.utils.parseEther(Number(amount) ? amount : "0")),
    [amount]
  );

  useEffect(
    () =>
      onChange({
        amountWei: amountWei,
        unitOfTime: unitOfTime,
      }),
    [onChange, amountWei, unitOfTime] // Don't put "onChange" here.
  );

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "6fr 4fr" }}>
      <TextField
        placeholder="0.0"
        value={amount}
        onChange={(e) => setAmount(e.currentTarget.value)}
        inputProps={{ sx: { borderRadius: "10px 0 0 10px" } }}
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
        value={unitOfTime}
        onChange={(e) => setUnitOfTime(Number(e.target.value))}
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
