import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { transactionSelectors } from "@superfluid-finance/sdk-redux";
import { FC } from "react";
import { useAppSelector } from "../redux/store";
import TransactionListItem from "./TransactionListItem";

const TransactionList: FC = () => {
  const transactions = useAppSelector((state) =>
    transactionSelectors.selectAll(state.transactions)
  );

  return (
    <>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {transactions.map((transaction) => (
          <TransactionListItem transaction={transaction}></TransactionListItem>
        ))}
      </List>
    </>
  );
};

{
  /* <ListItem button alignItems="flex-start">
<ListItemAvatar>
  <Avatar>X</Avatar>
</ListItemAvatar>
<ListItemText
  primary={transaction.key}
  secondary={
    <>
      <Typography
        sx={{ display: "block" }}
        component="span"
        variant="body2"
        color="text.primary"
      >
        {transaction.hash}
      </Typography>
      <Typography
        sx={{ display: "block" }}
        component="span"
        variant="body2"
        color="text.primary"
      >
        {transaction.}
      </Typography>
    </>
  }
/>
</ListItem> */
}

export default TransactionList;
