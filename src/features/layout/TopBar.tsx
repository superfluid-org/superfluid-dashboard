import { alpha, AppBar, Button, Stack, styled, Toolbar } from "@mui/material";
import { memo } from "react";
import useBodyScrolled from "../../hooks/useBodyScrolled";
import ImpersonationChip from "../impersonation/ImpersonationChip";
import SelectNetwork from "../network/SelectNetwork";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import TransactionBell from "../transactions/TransactionBell";
import { menuDrawerWidth } from "./NavigationDrawer";

interface CustomAppBarProps {
  open: boolean;
  isScrolled?: boolean;
}
const CustomAppBar = styled(AppBar)<CustomAppBarProps>(
  ({ theme, open, isScrolled }) => ({
    width: `calc(100% - ${menuDrawerWidth}px)`,
    marginLeft: `${menuDrawerWidth}px`,
    background: alpha(theme.palette.background.paper, isScrolled ? 1 : 0),
    transition: theme.transitions.create("all", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    ...(open && {
      width: `calc(100% - ${transactionDrawerWidth - menuDrawerWidth}px)`,
      marginRight: transactionDrawerWidth,
    }),
    borderBottom: `1px solid ${alpha(
      theme.palette.divider,
      isScrolled ? 0.12 : 0 // 0.12 is divider's default alpha channel
    )}`,
  })
);

export default memo(function TopBar() {
  const isScrolled = useBodyScrolled();
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <CustomAppBar
      open={transactionDrawerOpen}
      isScrolled={isScrolled}
      position="fixed"
      elevation={0}
    >
      <Stack
        component={Toolbar}
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <ImpersonationChip />
          <SelectNetwork />
          <TransactionBell />
        </Stack>
      </Stack>
    </CustomAppBar>
  );
});