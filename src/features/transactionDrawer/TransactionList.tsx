import {
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
} from "@mui/material";
import { FC, Fragment, memo } from "react";
import TransactionListItem from "./TransactionListItem";
import {
  useAccountTransactionsSelector,
  transactionsByTimestampSelector,
} from "../wallet/useAccountTransactions";
import { useAccount } from "@/hooks/useAccount";

// Deliberately not the project-wide `loading-skeletons` hook: this drawer is
// mounted on every page (persistent variant), and that hook is asserted
// globally in Cypress.
const TransactionListItemSkeleton = () => (
  <ListItem data-cy={"transaction-list-skeletons"} aria-hidden>
    <ListItemAvatar>
      <Skeleton variant="circular" width={28} height={28} />
    </ListItemAvatar>
    <ListItemText
      primary={<Skeleton variant="text" width={160} />}
      secondary={<Skeleton variant="text" width={120} />}
    />
  </ListItem>
);

const TransactionListMessage: FC<{ dataCy: string; message: string }> = ({
  dataCy,
  message,
}) => (
  <ListItem>
    <ListItemText
      data-cy={dataCy}
      translate="yes"
      primary={message}
      slotProps={{
        primary: {
          align: "center",
          color: "text.secondary",
        },
      }}
    />
  </ListItem>
);

export default memo(function TransactionList() {
  const { transactions, isResolving } = useAccountTransactionsSelector(
    transactionsByTimestampSelector
  );
  const { address: accountAddress } = useAccount();

  // The wallet stack hasn't settled yet (AppKit still reports no address while
  // connecting), so we don't know the account's transactions — showing an empty
  // list here would read as "you have none".
  if (isResolving) {
    return (
      <List disablePadding aria-busy>
        {[0, 1, 2].map((index) => (
          <Fragment key={index}>
            <TransactionListItemSkeleton />
            <Divider component="li" />
          </Fragment>
        ))}
      </List>
    );
  }

  return (
    <List disablePadding>
      {transactions.length > 0 ? (
        transactions.map((transaction) => (
          <Fragment key={transaction.hash}>
            <TransactionListItem transaction={transaction} />
            <Divider component="li" />
          </Fragment>
        ))
      ) : accountAddress ? (
        <TransactionListMessage
          dataCy="no-transactions-message"
          message="No transactions yet"
        />
      ) : (
        // The drawer can outlive a disconnect — its open state lives in the
        // layout context — so don't claim an account has no transactions when
        // there is no account.
        <TransactionListMessage
          dataCy="no-account-message"
          message="Connect a wallet to see your transactions"
        />
      )}
    </List>
  );
});
