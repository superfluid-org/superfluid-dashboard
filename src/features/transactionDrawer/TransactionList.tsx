import { List } from "@mui/material";
import { transactionSelectors } from "@superfluid-finance/sdk-redux";
import { FC } from "react";
import TransactionListItem from "./TransactionListItem";
import { useWalletContext } from "../wallet/WalletContext";
import { useAppSelector } from "../redux/store";

const TransactionList: FC = () => {
  const { walletAddress } = useWalletContext();

  const transactions = useAppSelector((state) =>
    transactionSelectors
      .selectAll(state.superfluid_transactions)
      .filter((x) => x.signer === walletAddress)
      .sort((a, b) => a.timestampMs > b.timestampMs ? -1 : 1)
  );

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {transactions.map((transaction) => (
        <TransactionListItem
          key={transaction.hash}
          transaction={transaction}
        ></TransactionListItem>
      ))}
    </List>
  );
};

export default TransactionList;
