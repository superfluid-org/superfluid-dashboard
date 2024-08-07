"use client";

import { Box, useTheme } from "@mui/material";
import { ClientOnly } from "./ClientOnly";
import { LiFiWidget, WidgetConfig, WidgetSkeleton } from "@lifi/widget";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { ELEVATION1_BG } from "../theme/theme";
import { useAvailableNetworks } from "../network/AvailableNetworksContext";
import { useEffect, useMemo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useConnectButton } from "../wallet/ConnectButtonProvider";

export function LiFiWidgetManager() {
    const theme = useTheme();
    const { isEOA } = useVisibleAddress();
    const { availableNetworks } = useAvailableNetworks();

    const { openConnectModal } = useConnectButton();

    const config = useMemo(() => {
        const config = {
            appearance: theme.palette.mode,
            theme: {
                container: {
                    maxWidth: "560px",
                    margin: "32px auto",
                    display: "flex",
                    width: "100%",
                    minWidth: 0,
                    borderRadius: "20px",
                    border:
                        theme.palette.mode === "dark"
                            ? `1px solid ${theme.palette.other.outline}`
                            : "none",
                    backgroundColor: theme.palette.background.paper,
                    backgroundImage: ELEVATION1_BG,
                    boxShadow: theme.shadows[1],
                },
                // components: theme.components,
                palette: theme.palette,
                shape: theme.shape,
                typography: {
                    fontFamily: theme.typography.fontFamily,
                    body1: theme.typography.body1,
                    body2: theme.typography.body2,
                    
                }
            },
            chains: {
                allow: availableNetworks.map(x => x.id)
            },
            requiredUI: isEOA ? [] : ["toAddress"],
            hiddenUI: ["appearance"],
            walletConfig: {
                onConnect() {
                    openConnectModal()
                }
            }
        } as Partial<WidgetConfig>;

        return config;
    }, [isEOA, availableNetworks, theme, openConnectModal]);

    // # Side
    const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
    useEffect(() => {
        // We don't know when the Li.Fi widget form is filled and we don't want to automatically switch the expected network because that would re-render the Li.Fi widget.
        stopAutoSwitchToWalletNetwork(); 
    }, []);
    // ---

    return (
        <ClientOnly fallback={<WidgetSkeleton config={config} />}>
            <Box sx={{
                ".MuiScopedCssBaseline-root, #widget-header, .MuiAppBar-root": {
                    background: "none",
                },
                ".MuiButton-root": {
                    color: "#fff",
                    textTransform: "initial",
                    // padding: "14px 24px",
                    fontSize: "16px",
                    fontWeight: 500,
                    backgroundColor: theme.palette.primary.main,
                },
                ".MuiButton-root:hover": {
                    color: "#fff",
                    backgroundColor: "rgba(12, 149, 42, 1)",
                },
                ".MuiButton-sizeMedium": {
                    letterSpacing: "0.17px",
                },
            }}>
                <LiFiWidget
                    config={config}
                    integrator="Superfluid"
                />
            </Box>
        </ClientOnly>
    )
}