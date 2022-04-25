import { List } from "@mui/material";
import { memo } from "react";
import TransactionListItem from "./TransactionListItem";
import { useWalletTransactions } from "../wallet/useWalletTransactions";

export default memo(function TransactionList() {
  const transactions = useWalletTransactions((x) =>
    x.sort((a, b) => (a.timestampMs > b.timestampMs ? -1 : 1))
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
