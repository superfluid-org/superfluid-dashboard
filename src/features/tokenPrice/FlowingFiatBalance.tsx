import Decimal from "decimal.js";
import { formatEther } from "ethers/lib/utils";
import { FC, memo, useMemo } from "react";
import useEtherSignificantFlowingDecimal from "../token/useEtherSignificantFlowingDecimal";
import useFlowingBalance from "../token/useFlowingBalance";
import FiatAmount from "./FiatAmount";

interface FlowingFiatBalanceProps {
  balance: string;
  balanceTimestamp: number;
  flowRate: string;
  price: number;
}

const FlowingFiatBalance: FC<FlowingFiatBalanceProps> = ({
  balance,
  balanceTimestamp,
  flowRate,
  price,
}) => {
  const { weiValue } = useFlowingBalance(balance, balanceTimestamp, flowRate);
  const decimalPlaces = useEtherSignificantFlowingDecimal(flowRate, price);

  return (
    <FiatAmount
      amount={formatEther(weiValue)}
      price={price}
      decimalPlaces={decimalPlaces}
    />
  );
};

export default memo(FlowingFiatBalance);
