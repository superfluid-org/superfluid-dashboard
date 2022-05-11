// TODO(KK): What's a better name?
import { BigNumber, BigNumberish, ethers } from "ethers";
import { FC, useEffect, useState } from "react";
import { MenuItem, Select, TextField } from "@mui/material";

/**
 * Enum numerical value is expressed in seconds.
 */
enum UnitOfTime {
  Second = 1,
  Minute = 60,
  Hour = 3600,
  Day = 86400,
}

const unitOfTimeList = [
  UnitOfTime.Second,
  UnitOfTime.Minute,
  UnitOfTime.Hour,
  UnitOfTime.Day,
];

export const timeUnitWordMap = {
  [UnitOfTime.Second]: "second",
  [UnitOfTime.Minute]: "minute",
  [UnitOfTime.Hour]: "hour",
  [UnitOfTime.Day]: "day",
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
    <>
      <TextField
        placeholder="0.0"
        value={amount}
        onChange={(e) => setAmount(e.currentTarget.value)}
        sx={{ border: 0, width: "50%" }}
      />
      <Select
        value={unitOfTime}
        label="Time multiplier"
        onChange={(e) => setUnitOfTime(Number(e.target.value))}
      >
        {unitOfTimeList.map((unitOfTime) => (
          <MenuItem key={`${unitOfTime}-second(s)`} value={unitOfTime}>{timeUnitWordMap[unitOfTime]}</MenuItem>
        ))}
      </Select>
    </>
  );
};