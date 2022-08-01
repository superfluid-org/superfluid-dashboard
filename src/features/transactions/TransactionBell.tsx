import { Badge, IconButton, styled } from "@mui/material";
import { useLayoutContext } from "../layout/LayoutContext";
import {
  pendingTransactionsSelector,
  useAccountTransactionsSelector,
} from "../wallet/useAccountTransactions";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAccount } from "wagmi";
import { memo } from "react";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";

const TransactionIconButton = styled(IconButton)<{ open: boolean }>(
  ({ theme, open }) => ({
    ...(open && {
      marginRight: `${theme.spacing(-4.5 - 2)} !important`,
    }),
    transition: theme.transitions.create("margin-right", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  })
);

export default memo(function TransactionBell() {
  const { address: accountAddress } = useAccount();

  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useLayoutContext();

  const pendingTransactions = useAccountTransactionsSelector(
    pendingTransactionsSelector
  );

  if (!accountAddress) return null;

  return (
    <TransactionIconButton
      color="inherit"
      edge="end"
      onClick={() => setTransactionDrawerOpen(!transactionDrawerOpen)}
      open={transactionDrawerOpen}
    >
      <Badge
        invisible={!pendingTransactions.length || transactionDrawerOpen}
        badgeContent={""}
        color="warning"
        variant="dot"
      >
        <MenuOpenRoundedIcon />
      </Badge>
    </TransactionIconButton>
  );
});
