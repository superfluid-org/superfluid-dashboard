import { List } from "@mui/material";
import { transactionSelectors } from "@superfluid-finance/sdk-redux";
import { FC } from "react";
import { useAppSelector } from "../../redux/store";
import TransactionListItem from "./TransactionListItem";

const TransactionList: FC = () => {
  const transactions = useAppSelector((state) =>
    transactionSelectors.selectAll(state.transactions)
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
