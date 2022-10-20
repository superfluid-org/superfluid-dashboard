import Decimal from "decimal.js";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { FC, useMemo } from "react";
import useEtherSignificantFlowingDecimal from "../token/useEtherSignificantFlowingDecimal";
import useFlowingBalance from "../token/useFlowingBalance";
import FiatAmount from "./FiatAmount";

interface FlowingFiatBalanceProps {
  balance: string;
  balanceTimestamp: number;
  flowRate: string;
  price: string;
}

const FlowingFiatBalance: FC<FlowingFiatBalanceProps> = ({
  balance,
  balanceTimestamp,
  flowRate,
  price,
}) => {
  const fiatDecimal = useMemo(() => new Decimal(price), [price]);

  const { weiValue } = useFlowingBalance(balance, balanceTimestamp, flowRate);
  const decimalPlaces = useEtherSignificantFlowingDecimal(flowRate, price);

  const fiatBalance = useMemo(() => {
    return new Decimal(formatEther(weiValue)).mul(fiatDecimal).toString();
  }, [weiValue, fiatDecimal, decimalPlaces]);

  return <FiatAmount price={fiatBalance} decimalPlaces={decimalPlaces} />;
};

export default FlowingFiatBalance;
