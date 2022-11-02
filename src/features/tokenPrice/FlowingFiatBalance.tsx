import { FC, memo } from "react";
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
  return <FiatAmount wei={weiValue} price={price} />;
};

export default memo(FlowingFiatBalance);
