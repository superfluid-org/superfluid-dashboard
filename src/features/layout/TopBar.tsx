import { alpha, AppBar, Stack, styled, Toolbar } from "@mui/material";
import { memo } from "react";
import useScrollPosition from "../../hooks/useScrollPosition";
import SelectNetwork from "../network/SelectNetwork";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import TransactionBell from "../transactions/TransactionBell";
import { menuDrawerWidth } from "./NavigationDrawer";

interface CustomAppBarProps {
  open: boolean;
  scrolled: boolean;
}
const CustomAppBar = styled(AppBar)<CustomAppBarProps>(
  ({ theme, open, scrolled }) => ({
    width: `calc(100% - ${menuDrawerWidth}px)`,
    marginLeft: `${menuDrawerWidth}px`,
    transition: [
      theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      theme.transitions.create(["border-bottom"], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.short,
      }),
    ].join(", "),
    ...(open && {
      width: `calc(100% - ${transactionDrawerWidth - menuDrawerWidth}px)`,
      transition: [
        theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        theme.transitions.create(["border-bottom"], {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.short,
        }),
      ].join(", "),
      marginRight: transactionDrawerWidth,
    }),
    borderBottom: `1px solid ${
      scrolled ? theme.palette.divider : "transparent"
    }`,
  })
);

export default memo(function TopBar() {
  const scrollTop = useScrollPosition();
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <CustomAppBar
      open={transactionDrawerOpen}
      scrolled={scrollTop > 0}
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
          <SelectNetwork />
          <TransactionBell />
        </Stack>
      </Stack>
    </CustomAppBar>
  );
});
