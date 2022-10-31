import DoneIcon from "@mui/icons-material/Done";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { FC } from "react";
import {
  TrackedTransaction,
  TransactionStatus,
} from "@superfluid-finance/sdk-redux";
import { Avatar } from "@mui/material";
import { useTheme } from "@mui/system";
import { getTransactionStatusColor } from "./TransactionListItem";

const getTransactionStatusIcon = (status: TransactionStatus) => {
  switch (status) {
    case "Pending":
      return MoreHorizIcon;
    case "Succeeded":
      return DoneIcon;
    case "Failed":
      return CloseIcon;
    default:
      return QuestionMarkIcon;
  }
};

export const TransactionListItemAvatar: FC<{
  status: TransactionStatus;
}> = ({ status }) => {
  const Icon = getTransactionStatusIcon(status);
  const bgcolor = getTransactionStatusColor(status);

  return (
    <Avatar
      data-cy={`${status}-tx-status`}
      sx={{ bgcolor, width: 28, height: 28 }}
    >
      <Icon fontSize="small" />
    </Avatar>
  );
};

export const TransactionListSubItemAvatar: FC<{
  status: TransactionStatus;
}> = ({ status }) => {
  const Icon = getTransactionStatusIcon(status);
  return (
    <Avatar sx={{ bgcolor: "text.secondary", width: 16, height: 16 }}>
      <Icon
        sx={{
          fontSize: 12,
        }}
      />
    </Avatar>
  );
};
