import {
  Avatar,
  Button,
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { FC, useMemo } from "react";
import DoneIcon from "@mui/icons-material/Done";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { useRouter } from "next/router";
import { useTransactionContext } from "./TransactionContext";
import shortenAddress from "../../shortenAddress";

const TransactionListItemAvatar: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  switch (transaction.status) {
    case "Pending":
      return (
        <Avatar sx={{ bgcolor: "yellow" }}>
          <MoreHorizIcon></MoreHorizIcon>
        </Avatar>
      );
    case "Succeeded":
      return (
        <Avatar sx={{ bgcolor: "green" }}>
          <DoneIcon></DoneIcon>
        </Avatar>
      );
    case "Failed":
      return (
        <Avatar sx={{ bgcolor: "red" }}>
          <CloseIcon></CloseIcon>
        </Avatar>
      );
    case "Unknown":
      return (
        <Avatar sx={{ bgcolor: "grey" }}>
          <QuestionMarkIcon></QuestionMarkIcon>
        </Avatar>
      );
  }
};

const TransactionRecoveryButton: FC<{
  transaction: TrackedTransaction;
}> = ({ transaction }) => {
  const router = useRouter();
  const { setTransactionToRecover } = useTransactionContext();

  switch (transaction.title) {
    case "Downgrade from Super Token":
      return (
        <Button
          variant="outlined"
          onClick={() => {
            setTransactionToRecover(transaction);
            router.push("/downgrade");
          }}
        >
          Recover
        </Button>
      );
    case "Upgrade to Super Token":
      return (
        <Button
          variant="outlined"
          onClick={() => {
            setTransactionToRecover(transaction);
            router.push("/upgrade");
          }}
        >
          Recover
        </Button>
      );
    default:
      return null;
  }
};

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  const shortenedHash = useMemo(() => shortenAddress(transaction.hash), [transaction]);

  return (
    <ListItem button alignItems="flex-start">
      <ListItemAvatar>
        <TransactionListItemAvatar
          transaction={transaction}
        ></TransactionListItemAvatar>
      </ListItemAvatar>
      <ListItemText
        primary={transaction.title}
        secondary={
          <>
            {transaction.status === "Pending" && <LinearProgress />}
            <Typography
              sx={{ display: "block" }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              {shortenedHash}
            </Typography>
            {/* transaction.status === "Failed" &&  */}

            {/* <TransactionRecoveryButton
              transaction={transaction}
            ></TransactionRecoveryButton> */}
          </>
        }
      ></ListItemText>
    </ListItem>
  );
};

export default TransactionListItem;
