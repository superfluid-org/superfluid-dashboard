import { FC, memo } from "react";
import useFlowingBalance from "../token/useFlowingBalance";
import FiatAmount from "./FiatAmount";
import { Skeleton } from "@mui/material";

type FlowingFiatBalanceData = {
  balance: string;
  balanceTimestamp: number;
  flowRate: string;
  price: number;
}

type FlowingFiatBalanceProps = FlowingFiatBalanceData | {
  data: FlowingFiatBalanceData | undefined;
}

const FlowingFiatBalance: FC<FlowingFiatBalanceProps > = (props) => {
  const data = "data" in props ? props.data : props;
  if (data) {
    return <FlowingFiatBalanceCore {...data} />;
  } else {
    return <Skeleton />;
  }
};

const FlowingFiatBalanceCore: FC<FlowingFiatBalanceData > = ({ balance, balanceTimestamp, flowRate, price }) => {
  const { weiValue } = useFlowingBalance(balance, balanceTimestamp, flowRate);
  return <FiatAmount wei={weiValue} price={price} />;
};

export default memo(FlowingFiatBalance);
