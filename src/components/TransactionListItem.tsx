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
import { useAppSelector } from "../redux/store";
import {
  TransactionRecoveries,
  transactionRecoverySelectors,
} from "../redux/transactionRecoverySlice";
import Link from "../Link";

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

const TransactionRecoveryLink: FC<{
  transactionRecovery: TransactionRecoveries;
}> = ({ transactionRecovery, children }) => {
  switch (transactionRecovery.key) {
    case "SUPER_TOKEN_DOWNGRADE":
      return (
        <Link
          href={`/wrap?transactionRecoveryId=${transactionRecovery.transactionInfo.hash}`}
          passHref
        >
          {children}
        </Link>
      );
    case "SUPER_TOKEN_UPGRADE":
      return (<Link
        href={`/wrap?transactionRecoveryId=${transactionRecovery.transactionInfo.hash}`}
        passHref
      >
        {children}
      </Link>);
    default:
      return null;
  }
};

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  const transactionRecovery = useAppSelector((state) =>
    transactionRecoverySelectors.selectById(
      state.transactionRecovery,
      transaction.hash
    )
  );

  console.log({ transactionRecovery })

  return (
    <ListItem button alignItems="flex-start">
      <ListItemAvatar>
        <TransactionListItemAvatar
          transaction={transaction}
        ></TransactionListItemAvatar>
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
            {/* transaction.status === "Failed" &&  */}
            {!!transactionRecovery && (
              <TransactionRecoveryLink
                transactionRecovery={transactionRecovery}
              >
                <Button variant="outlined">Recover</Button>
              </TransactionRecoveryLink>
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
