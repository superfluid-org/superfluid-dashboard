import {
  alpha,
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  styled,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { memo } from "react";
import useBodyScrolled from "../../hooks/useBodyScrolled";
import ImpersonationChip from "../impersonation/ImpersonationChip";
import SelectNetwork from "../network/SelectNetwork";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";
import { useLayoutContext } from "./LayoutContext";
import TransactionBell from "../transactions/TransactionBell";
import { menuDrawerWidth } from "./NavigationDrawer";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import useMediaBreakpoints from "../../hooks/useMediaBreakpoints";

interface CustomAppBarProps {
  transactionDrawerOpen: boolean;
  navigationDrawerOpen: boolean;
  isScrolled?: boolean;
}

const CustomAppBar = styled(AppBar, {
  shouldForwardProp: (prop: string) =>
    !["transactionDrawerOpen", "navigationDrawerOpen", "isScrolled"].includes(
      prop
    ),
})<CustomAppBarProps>(
  ({ theme, transactionDrawerOpen, navigationDrawerOpen, isScrolled }) => ({
    borderRadius: 0,
    border: 0,
    background: alpha(theme.palette.background.paper, isScrolled ? 1 : 0),
    right: 0,
    left: 0,
    width: "auto",
    transition: theme.transitions.create(["border", "background", "right"], {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    ...(transactionDrawerOpen && {
      right: transactionDrawerWidth,
      [theme.breakpoints.down("md")]: {
        right: 0,
      },
    }),
    ...(navigationDrawerOpen && {
      left: menuDrawerWidth,
      [theme.breakpoints.down("md")]: {
        left: 0,
      },
    }),
    borderBottom: `1px solid ${alpha(
      theme.palette.divider,
      isScrolled ? 0.12 : 0 // 0.12 is divider's default alpha channel
    )}`,
  })
);

export default memo(function TopBar() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const isScrolled = useBodyScrolled();
  const {
    transactionDrawerOpen,
    navigationDrawerOpen,
    setNavigationDrawerOpen,
  } = useLayoutContext();

  const openNavigationDrawer = () => setNavigationDrawerOpen(true);

  return (
    <CustomAppBar
      transactionDrawerOpen={transactionDrawerOpen}
      navigationDrawerOpen={navigationDrawerOpen}
      isScrolled={isScrolled}
      position="fixed"
      elevation={0}
    >
      <Stack component={Toolbar} direction="row" alignItems="center">
        {isSmallScreen && (
          <IconButton onClick={openNavigationDrawer} color="inherit">
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box flex={1} />

        <Stack direction="row" spacing={2} alignItems="center">
          <ImpersonationChip />
          <SelectNetwork />
          <TransactionBell />
        </Stack>
      </Stack>
    </CustomAppBar>
  );
});
