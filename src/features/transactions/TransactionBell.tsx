import { Badge, IconButton } from "@mui/material";
import { useWalletContext } from "../wallet/WalletContext";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import { memo } from "react";
import {
  pendingTransactionsSelector,
  useWalletTransactionsSelector,
} from "../wallet/useWalletTransactions";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default memo(function TransactionBell() {
  const { walletAddress } = useWalletContext();
  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useTransactionDrawerContext();

  const pendingTransactions = useWalletTransactionsSelector(
    pendingTransactionsSelector
  );

  return (
    <IconButton
      sx={{
        ...(walletAddress ? {} : { display: "none" }),
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
