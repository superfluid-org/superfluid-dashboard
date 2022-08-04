import { Divider, List } from "@mui/material";
import { Fragment, memo } from "react";
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
    <List disablePadding>
      {transactions.map((transaction) => (
        <Fragment key={transaction.hash}>
          <TransactionListItem transaction={transaction} />
          <Divider component="li" />
        </Fragment>
      ))}
    </List>
  );
});
