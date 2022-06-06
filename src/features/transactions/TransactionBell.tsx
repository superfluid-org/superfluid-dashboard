import { Badge, IconButton } from "@mui/material";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import {
  pendingTransactionsSelector,
  useAccountTransactionsSelector,
} from "../wallet/useAccountTransactions";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAccount } from "wagmi";
import { memo } from "react";

export default memo(function TransactionBell() {
  const { data: account } = useAccount();

  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useTransactionDrawerContext();

  const pendingTransactions = useAccountTransactionsSelector(
    pendingTransactionsSelector
  );

  if (!account) return null;

  return (
    <IconButton
      color="inherit"
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
