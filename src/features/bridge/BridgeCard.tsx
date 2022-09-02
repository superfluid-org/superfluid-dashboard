import LIFI, { Route } from "@lifi/sdk";

import {
  Box,
  Button,
  Card,
  OutlinedInput,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";
import { parseAmountOrZero } from "../../utils/tokenUtils";
import { Network } from "../network/networks";
import NetworkSelectInput from "../network/NetworkSelectInput";
import { TokenMinimal } from "../redux/endpoints/tokenTypes";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import BridgeSettings from "./BridgeSettings";
import RouteCard from "./RouteCard";
import useBridgeNetworks from "./useBridgeNetworks";
import useBridgeTokens from "./useBridgeTokens";

interface BridgeCardProps {}

const BridgeCard: FC<BridgeCardProps> = ({}) => {
  const theme = useTheme();

  const { visibleAddress } = useVisibleAddress();

  const [fromNetwork, setFromNetwork] = useState<Network>();
  const [toNetwork, setToNetwork] = useState<Network>();

  const [fromToken, setFromToken] = useState<TokenMinimal>();
  const [toToken, setToToken] = useState<TokenMinimal>();

  const [amount, setAmount] = useState("1");

  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [loadingAvailableRoutes, setLoadingAvailableRoutes] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  const lifi = useMemo(
    () =>
      new LIFI({
        apiUrl: "https://staging.li.quest/v1/",
      }),
    []
  );

  const [fromTokens, fromTokensLoading] = useBridgeTokens(lifi, fromNetwork);
  const [toTokens, toTokensLoading] = useBridgeTokens(lifi, toNetwork);

  const [bridgeNetworks] = useBridgeNetworks(lifi);

  const onFromNetworkChange = (network: Network) => setFromNetwork(network);
  const onToNetworkChange = (network: Network) => setToNetwork(network);

  const activateRoute = (routeId: string) => () => {
    setActiveRouteId(routeId);
  };

  const activeRoute = useMemo(
    () => availableRoutes.find((route) => route.id === activeRouteId),
    [availableRoutes, activeRouteId]
  );

  useEffect(() => {
    if (
      !fromNetwork ||
      !toNetwork ||
      !fromToken ||
      !toToken ||
      !visibleAddress ||
      !amount
    ) {
      return;
    }

    console.log("Fetching routes");
    setLoadingAvailableRoutes(true);

    const parsedAmount = parseAmountOrZero({
      value: amount,
      decimals: fromToken.decimals,
    }).toString();

    lifi
      .getRoutes({
        fromAmount: parsedAmount,
        fromChainId: fromNetwork.id,
        toChainId: toNetwork.id,
        fromTokenAddress: fromToken.address,
        toTokenAddress: toToken.address,
        fromAddress: visibleAddress,
        toAddress: visibleAddress,
        options: {
          integrator: "app.superfluid.finance",
          order: "RECOMMENDED",
          slippage: 0.03,
          // bridges: {
          //   allow: []
          // },
          // exchanges: {allow: []}
        },
      })
      .then((routesResponse) => {
        setAvailableRoutes(routesResponse.routes || []);
      })
      .finally(() => {
        setLoadingAvailableRoutes(false);
      });
  }, [
    fromNetwork,
    toNetwork,
    fromToken,
    toToken,
    amount,
    lifi,
    visibleAddress,
    setAvailableRoutes,
    setLoadingAvailableRoutes,
  ]);

  const hasAllInputs =
    fromNetwork &&
    toNetwork &&
    fromToken &&
    toToken &&
    visibleAddress &&
    amount;

  // console.log({ activeRoute, availableRoutes });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        [theme.breakpoints.up("md")]: {
          my: 4,
        },
      }}
    >
      <Card
        elevation={1}
        sx={{
          maxWidth: "600px",
          width: "100%",
          position: "relative",
          [theme.breakpoints.down("md")]: {
            boxShadow: "none",
            backgroundImage: "none",
            borderRadius: 0,
            border: 0,
            p: 0,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flex={1}
          sx={{ mb: 4 }}
        >
          <Button
            color="primary"
            variant="textContained"
            size="large"
            sx={{ alignSelf: "flex-start", pointerEvents: "none" }}
          >
            Bridge
          </Button>

          <BridgeSettings />
        </Stack>

        <Stack spacing={2}>
          <Stack direction="row">
            <NetworkSelectInput
              networkSelection={bridgeNetworks}
              selectedNetwork={fromNetwork}
              onChange={onFromNetworkChange}
              placeholder="Select from network"
              ButtonProps={{ sx: { flexGrow: 1 } }}
            />
            <TokenDialogButton
              token={fromToken}
              tokenSelection={{
                showUpgrade: false,
                tokenPairsQuery: {
                  data: fromTokens,
                  isFetching: fromTokensLoading,
                },
              }}
              onTokenSelect={setFromToken}
              ButtonProps={{ variant: "input", disabled: !fromNetwork }}
            />
          </Stack>

          <OutlinedInput
            fullWidth
            placeholder="0.0"
            value={amount}
            type="text"
            inputMode="decimal"
            inputProps={{
              sx: {
                ...theme.typography.mediumInput,
              },
            }}
            sx={{ background: "transparent" }}
          />

          <Stack alignItems="center">
            <Image
              unoptimized
              src="/icons/lifi-bridge.svg"
              width={24}
              height={24}
              layout="fixed"
              alt="LIFI Bridge"
            />
          </Stack>

          <Stack direction="row">
            <NetworkSelectInput
              networkSelection={bridgeNetworks}
              selectedNetwork={toNetwork}
              onChange={onToNetworkChange}
              placeholder="Select to network"
              ButtonProps={{ sx: { flexGrow: 1 } }}
            />
            <TokenDialogButton
              token={toToken}
              tokenSelection={{
                showUpgrade: false,
                tokenPairsQuery: {
                  data: toTokens,
                  isFetching: toTokensLoading,
                },
              }}
              onTokenSelect={setToToken}
              ButtonProps={{ variant: "input", disabled: !toNetwork }}
            />
          </Stack>

          {loadingAvailableRoutes && (
            <Typography>Loading available routes</Typography>
          )}

          {hasAllInputs && (
            <>
              {!loadingAvailableRoutes && availableRoutes.length === 0 ? (
                <Typography>Could not find any routes</Typography>
              ) : (
                <Stack>
                  {availableRoutes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      toToken={toToken}
                      toNetwork={toNetwork}
                      onClick={activateRoute(route.id)}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}
        </Stack>
      </Card>
    </Box>
  );
};

export default BridgeCard;
