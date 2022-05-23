import { Badge, IconButton } from "@mui/material";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import { memo } from "react";
import {
  pendingTransactionsSelector,
  useWalletTransactionsSelector,
} from "../wallet/useWalletTransactions";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAccount } from "wagmi";

export default memo(function TransactionBell() {
  const { data: wagmiAccount } = useAccount();

  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useTransactionDrawerContext();

  const pendingTransactions = useWalletTransactionsSelector(
    pendingTransactionsSelector
  );

  return (
    <IconButton
      sx={{
        ...(wagmiAccount ? {} : { display: "none" }),
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
