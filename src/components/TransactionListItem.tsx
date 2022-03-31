import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { ethers } from "ethers";
import { FC } from "react";
import DoneIcon from '@mui/icons-material/Done';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const TransactionListItemAvatar: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  switch (transaction.status) {
    case "Pending":
      return <Avatar sx={{ bgcolor: "yellow" }}><MoreHorizIcon></MoreHorizIcon></Avatar>;
    case "Succeeded":
      return <Avatar sx={{ bgcolor: "green" }}><DoneIcon></DoneIcon></Avatar>;
    case "Failed":
      return <Avatar sx={{ bgcolor: "red" }}><CloseIcon></CloseIcon></Avatar>;
    case "Unknown":
      return <Avatar sx={{ bgcolor: "grey" }}><QuestionMarkIcon></QuestionMarkIcon></Avatar>;
  }
};

const TransactionListItem: FC<{ transaction: TrackedTransaction }> = ({
  transaction,
}) => {
  return (
    <ListItem button alignItems="flex-start">
      <ListItemAvatar>
        <TransactionListItemAvatar transaction={transaction}></TransactionListItemAvatar>
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
            {/* <Typography
                    sx={{ display: "block" }}
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
