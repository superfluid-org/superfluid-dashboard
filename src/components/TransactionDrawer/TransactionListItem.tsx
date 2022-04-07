import {
  Avatar,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { FC } from "react";
import DoneIcon from "@mui/icons-material/Done";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { useAppSelector } from "../../redux/store";
import {
  TransactionRecoveries,
  transactionRecoverySelectors,
} from "../../redux/transactionRecoverySlice";
import { useRouter } from "next/router";
import { useTransactionContext } from "./TransactionContext";

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
  transactionRecovery: TransactionRecoveries;
}> = ({ transactionRecovery }) => {
  const router = useRouter();
  const { setTransactionRecovery } = useTransactionContext();
  
  switch (transactionRecovery.key) {
    case "SUPER_TOKEN_DOWNGRADE":
      return (
        <Button variant="outlined" onClick={() => {
          setTransactionRecovery(transactionRecovery)
          router.push("/downgrade");
        }}>Recover</Button>
      );
    case "SUPER_TOKEN_UPGRADE":
      return (
        <Button variant="outlined" onClick={() => {
          setTransactionRecovery(transactionRecovery)
          router.push("/upgrade");
        }}>Recover</Button>
      );
    default:
      return null;
  }
};

const getTitle = (transaction: TrackedTransaction) => {
  switch (transaction.key) {
    case "FLOW_CREATE":
      return "Create Stream"
    case "FLOW_UPDATE":
      return "Update Stream"
    case "FLOW_DELETE":
      return "Close Stream"
    case "INDEX_CREATE":
      return "Create Index"
    case "INDEX_DISTRIBUTE":
      return "Distribute Index"
    case "INDEX_UPDATE_SUBSCRIPTION_UNITS":
      return "Update Index Subscription Units"
    case "INDEX_SUBSCRIPTION_APPROVE":
      return "Approve Index Subscription"
    case "INDEX_SUBSCRIPTION_CLAIM":
      return "Claim Index Subscription"
    case "INDEX_DELETE_SUBSCRIPTION":
      return "Delete Index Subscription"
    case "INDEX_SUBSCRIPTION_REVOKE":
      return "Revoke Index Subscription"
    case "SUPER_TOKEN_UPGRADE":
      return "Upgrade to Super Token"
    case "SUPER_TOKEN_DOWNGRADE":
      return "Downgrade from Super Token"
    case "SUPER_TOKEN_TRANSFER":
      return "Transfer"
    case "APPROVE":
      return "Approve"
  } 
}

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  const transactionRecovery = useAppSelector((state) =>
    transactionRecoverySelectors.selectById(
      state.transactionRecovery,
      transaction.hash
    )
  );

  return (
    <ListItem button alignItems="flex-start">
      <ListItemAvatar>
        <TransactionListItemAvatar
          transaction={transaction}
        ></TransactionListItemAvatar>
      </ListItemAvatar>
      <ListItemText
        primary={getTitle(transaction)}
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
            {/* transaction.status === "Failed" &&  */}
            {!!transactionRecovery && (
              <TransactionRecoveryButton
                transactionRecovery={transactionRecovery}
              >
              </TransactionRecoveryButton>
            )}
            {/* <Typography
                    sx={{ display: "block" }}S
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {123}
                  </Typography> */}
          </>
        }
      ></ListItemText>
    </ListItem>
  );
};

export default TransactionListItem;
