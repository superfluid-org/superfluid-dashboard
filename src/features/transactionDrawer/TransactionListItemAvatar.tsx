import DoneIcon from "@mui/icons-material/Done";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { FC } from "react";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import { Avatar } from "@mui/material";

export const TransactionListItemAvatar: FC<{
  transaction: TrackedTransaction;
}> = ({ transaction }) => {
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
