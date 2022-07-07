import { Badge, IconButton } from "@mui/material";
import { useLayoutContext } from "../layout/LayoutContext";
import {
  pendingTransactionsSelector,
  useAccountTransactionsSelector,
} from "../wallet/useAccountTransactions";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAccount } from "wagmi";
import { memo } from "react";

export default memo(function TransactionBell() {
  const { data: account } = useAccount();
  const accountAddress = account?.address;

  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useLayoutContext();

  const pendingTransactions = useAccountTransactionsSelector(
    pendingTransactionsSelector
  );

  if (!accountAddress) return null;

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
