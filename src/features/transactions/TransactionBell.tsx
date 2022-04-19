import { Badge, IconButton } from "@mui/material";
import { transactionSelectors } from "@superfluid-finance/sdk-redux";
import { useWalletContext } from "../wallet/WalletContext";
import { useAppSelector } from "../redux/store";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { FC } from "react";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";

export const TransactionBell: FC = () => {
  const { walletAddress } = useWalletContext();
  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useTransactionDrawerContext();

  const pendingTransactions = useAppSelector((state) =>
    walletAddress
      ? transactionSelectors
          .selectAll(state.superfluid_transactions)
          .filter((x) => x.signer === walletAddress && x.status === "Pending")
      : []
  );

  return (
    <IconButton
      color="primary"
      aria-label="open drawer"
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
        <NotificationsOutlinedIcon />
      </Badge>
    </IconButton>
  );
};
