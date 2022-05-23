import { alpha, AppBar, Button, Stack, styled, Toolbar } from "@mui/material";
import { memo } from "react";
import useScrollPosition from "../../hooks/useScrollPosition";
import SelectNetwork from "../network/SelectNetwork";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import TransactionBell from "../transactions/TransactionBell";
import { menuDrawerWidth } from "./NavigationDrawer";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNetwork } from "wagmi";


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
  const { switchNetwork } = useNetwork();

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
          {/* <ConnectButton></ConnectButton> */}
          {/* <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              return (
                <div
                  {...(!mounted && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!mounted || !account || !chain) {
                      return (
                        <button onClick={openConnectModal} type="button">
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button onClick={openChainModal} type="button">
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={openChainModal}
                          style={{ display: "flex", alignItems: "center" }}
                          type="button"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button onClick={openAccountModal} type="button">
                          {account.displayName}
                          {account.displayBalance
                            ? ` (${account.displayBalance})`
                            : ""}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom> */}

          <SelectNetwork />
          <TransactionBell />
        </Stack>
      </Stack>
    </CustomAppBar>
  );
});
