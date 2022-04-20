import { List } from "@mui/material";
import { transactionSelectors } from "@superfluid-finance/sdk-redux";
import { memo } from "react";
import TransactionListItem from "./TransactionListItem";
import { useWalletContext } from "../wallet/WalletContext";
import { useAppSelector } from "../redux/store";

export default memo(function TransactionList() {
  const { walletAddress } = useWalletContext();

  const transactions = useAppSelector((state) =>
    transactionSelectors
      .selectAll(state.superfluid_transactions)
      .filter((x) => x.signer === walletAddress)
      .sort((a, b) => (a.timestampMs > b.timestampMs ? -1 : 1))
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
});
