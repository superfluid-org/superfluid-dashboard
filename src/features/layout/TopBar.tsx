import { AppBar, Stack, styled, Toolbar } from "@mui/material";
import { memo } from "react";
import SelectNetwork from "../network/SelectNetwork";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import TransactionBell from "../transactions/TransactionBell";
import { menuDrawerWidth } from "./NavigationDrawer";

const CustomAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${transactionDrawerWidth - menuDrawerWidth}px)`,
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
        width: `calc(100% - ${menuDrawerWidth}px)`,
        ml: `${menuDrawerWidth}px`,
        boxShadow: "none",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        component={Toolbar}
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <SelectNetwork />
          <TransactionBell />
        </Stack>
      </Stack>
    </CustomAppBar>
  );
});
