import { Badge, IconButton } from "@mui/material";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import { memo } from "react";
import {
  pendingTransactionsSelector,
  useAccountTransactionsSelector,
} from "../wallet/useAccountTransactions";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAccount } from "wagmi";

export default memo(function TransactionBell() {
  const { data: account } = useAccount();

  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useTransactionDrawerContext();

  const pendingTransactions = useAccountTransactionsSelector(
    pendingTransactionsSelector
  );

  return (
    <IconButton
      sx={{
        ...(account ? {} : { display: "none" }),
      }}
      edge="end"
      onClick={() => setTransactionDrawerOpen(!transactionDrawerOpen)}
    >
      <Badge
        invisible={!pendingTransactions.length || transactionDrawerOpen}
        badgeContent={""}
        color="warning"
        variant="dot"
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
});
