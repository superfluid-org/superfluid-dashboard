import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import {
  alpha,
  AppBar,
  Box,
  IconButton,
  Stack,
  styled,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { memo } from "react";
import NotificationsBell from "../../components/NotificationsBell/NotificationsBell";
import useBodyScrolled from "../../hooks/useBodyScrolled";
import ImpersonationChip from "../impersonation/ImpersonationChip";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import SelectNetwork from "../network/SelectNetwork";

import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";
import TransactionBell from "../transactions/TransactionBell";
import ConnectWallet from "../wallet/ConnectWallet";
import { useLayoutContext } from "./LayoutContext";
import { menuDrawerWidth } from "./NavigationDrawer";
import { useSwitchChain } from "wagmi";
import { useAccount } from "@/hooks/useAccount"
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";

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
  const isBelowLg = useMediaQuery(theme.breakpoints.down("lg"));
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { address: accountAddress, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const { network: selectedNetwork, setExpectedNetwork: setSelectedNetwork, stopAutoSwitchToWalletNetwork } =
    useExpectedNetwork();

  const { isImpersonated } = useImpersonation();

  const onNetworkChange = (network: Network) => {
    setSelectedNetwork(network.id);
    stopAutoSwitchToWalletNetwork(); // If user explicitly chooses a network from the drop-down, we'll respect that decision and not switch to the wallet's network automatically.

    if (accountAddress && switchChain) {
      switchChain({ chainId: network.id });
    }
  };

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
        {isBelowLg && (
          <IconButton onClick={openNavigationDrawer} color="inherit">
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box flex={1} />

        <Stack direction="row" gap={isBelowMd ? 1 : 2} alignItems="center">
          {isBelowLg && !isImpersonated && (
            <ConnectWallet ButtonProps={{ size: "small" }} />
          )}
          <ImpersonationChip />
          <SelectNetwork
            disabled={!selectedNetwork}
            network={selectedNetwork}
            onChange={onNetworkChange}
            placeholder={"Select Network"}
          />
          {/* 
            // Notifications hidden until a source of notifications is added.
          <NotificationsBell /> 
          */}
          <TransactionBell />
        </Stack>
      </Stack>
    </CustomAppBar>
  );
});
