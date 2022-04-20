import { FC, memo } from "react";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import { menuDrawerWidth } from "./NavigationDrawer";
import { AppBar, Card, Divider, Stack, styled, Toolbar } from "@mui/material";
import SelectNetwork from "../network/SelectNetwork";
import ConnectWallet from "../wallet/ConnectWallet";
import TransactionBell from "../transactions/TransactionBell";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";

const CustomAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${transactionDrawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: transactionDrawerWidth,
  }),
}));

export default memo(function TopBar() {
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <CustomAppBar
      open={transactionDrawerOpen}
      position="fixed"
      sx={{
        color: "text.primary",
        width: `calc(100% - ${menuDrawerWidth}px)`,
        ml: `${menuDrawerWidth}px`,
        boxShadow: "none",
        bgcolor: "background.paper"
      }}
    >
      <Stack
        component={Toolbar}
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <SelectNetwork></SelectNetwork>
          <ConnectWallet></ConnectWallet>
          <TransactionBell />
        </Stack>
      </Stack>
      <Divider />
    </CustomAppBar>
  );
});
