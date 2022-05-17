import { List } from "@mui/material";
import { memo } from "react";
import TransactionListItem from "./TransactionListItem";
import {
  useWalletTransactionsSelector,
  transactionsByTimestampSelector,
} from "../wallet/useWalletTransactions";

export default memo(function TransactionList() {
  const transactions = useWalletTransactionsSelector(
    transactionsByTimestampSelector
  );

  return (
    <List>
      {transactions.map((transaction) => (
        <TransactionListItem key={transaction.hash} transaction={transaction} />
      ))}
    </List>
  );
});
