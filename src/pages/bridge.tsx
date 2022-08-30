import LIFI, { Token } from "@lifi/sdk";
import {
  Box,
  Button,
  Card,
  Container,
  FormGroup,
  Input,
  OutlinedInput,
  Stack,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { NextPage } from "next";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SEO from "../components/SEO/SEO";
import useBridgeTokens from "../features/bridge/useBridgeTokens";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import NetworkBadge from "../features/network/NetworkBadge";
import { Network, networkIDs, networks } from "../features/network/networks";
import NetworkSelectInput from "../features/network/NetworkSelectInput";
import SelectNetworkMenu from "../features/network/NetworkSelectMenu";
import {
  isUnderlying,
  TokenMinimal,
  TokenType,
} from "../features/redux/endpoints/tokenTypes";
import { subgraphApi } from "../features/redux/store";
import { TokenDialogButton } from "../features/tokenWrapping/TokenDialogButton";

const Send: NextPage = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();

  const [fromNetwork, setFromNetwork] = useState<Network>();
  const [toNetwork, setToNetwork] = useState<Network>();
  const [amountDecimal, setAmountDecimal] = useState("");
  const [fromToken, setFromToken] = useState<TokenMinimal>();
  const [toToken, setToToken] = useState<TokenMinimal>();

  const [networkSelection, setNetworkSelection] = useState<Network[]>([]);
  const [tokenSelection, setTokenSelection] = useState<{
    [chainId: string]: TokenMinimal[];
  }>({});

  const lifi = useMemo(
    () =>
      new LIFI({
        apiUrl: "https://staging.li.quest/v1/",
      }),
    []
  );

  const [fromTokens, fromTokensLoading] = useBridgeTokens(lifi, fromNetwork);

  const [toTokens, toTokensLoading] = useBridgeTokens(lifi, toNetwork);

  useEffect(() => {
    lifi.getChains().then((chainsResponse) => {
      setNetworkSelection(
        networks.filter((network) =>
          chainsResponse.some((lifiNetwork) => lifiNetwork.id === network.id)
        )
      );
    });
  }, [lifi]);

  const fromTokenSelection = useMemo(() => {
    if (fromNetwork && tokenSelection) {
      return tokenSelection[fromNetwork?.id] || [];
    }
    return [];
  }, [fromNetwork, tokenSelection]);

  const onFromNetworkChange = (network: Network) => setFromNetwork(network);
  const onToNetworkChange = (network: Network) => setToNetwork(network);

  console.log({ fromNetwork, fromTokens });

  return (
    <SEO title="Bridge | Superfluid">
      <Container maxWidth="lg">
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
            <Button
              color="primary"
              variant="textContained"
              size="large"
              sx={{ alignSelf: "flex-start", pointerEvents: "none", mb: 4 }}
            >
              Bridge
            </Button>

            <Stack spacing={2}>
              <Stack direction="row">
                <NetworkSelectInput
                  networkSelection={networkSelection}
                  selectedNetwork={fromNetwork}
                  onChange={onFromNetworkChange}
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
                value={amountDecimal}
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
                  networkSelection={networkSelection}
                  selectedNetwork={toNetwork}
                  onChange={onToNetworkChange}
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

              <OutlinedInput
                fullWidth
                placeholder="0.0"
                value={amountDecimal}
                type="text"
                inputMode="decimal"
                inputProps={{
                  sx: {
                    ...theme.typography.mediumInput,
                  },
                }}
                sx={{ background: "transparent" }}
              />
            </Stack>
          </Card>
        </Box>
      </Container>
    </SEO>
  );
};

export default Send;
