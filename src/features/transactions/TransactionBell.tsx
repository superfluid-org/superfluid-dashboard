import { Badge, IconButton } from "@mui/material";
import { useWalletContext } from "../wallet/WalletContext";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import { memo } from "react";
import { useWalletTransactions } from "../wallet/useWalletTransactions";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default memo(function TransactionBell() {
  const { walletAddress } = useWalletContext();
  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useTransactionDrawerContext();

  const pendingTransactions = useWalletTransactions((x) =>
    x.filter((x) => x.signer === walletAddress && x.status === "Pending")
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
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
});
