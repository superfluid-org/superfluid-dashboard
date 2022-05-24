import { List } from "@mui/material";
import { memo } from "react";
import TransactionListItem from "./TransactionListItem";
import {
  useAccountTransactionsSelector,
  transactionsByTimestampSelector,
} from "../wallet/useAccountTransactions";

export default memo(function TransactionList() {
  const transactions = useAccountTransactionsSelector(
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
