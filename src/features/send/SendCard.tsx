import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import {
  Alert,
  AlertTitle,
  alpha,
  Box,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber, ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, memo, useCallback, useMemo, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import {
  getSuperTokenType,
  isSuper,
  isWrappable,
  SuperTokenMinimal,
  TokenMinimal,
} from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi, subgraphApi } from "../redux/store";
import { BalanceSuperToken } from "../tokenWrapping/BalanceSuperToken";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import {
  RestorationType,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { TransactionButton } from "../transactions/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactions/TransactionDialog";
import { useWalletContext } from "../wallet/WalletContext";
import AddressSearch from "./AddressSearch";
import { DisplayAddress } from "./DisplayAddressChip";
import {
  calculateTotalAmountWei,
  FlowRateInput,
  FlowRateWithTime,
  UnitOfTime,
} from "./FlowRateInput";
import { SendStreamPreview } from "./SendStreamPreview";

interface FormLabelProps {
  children?: React.ReactNode;
}

const FormLabel: FC<FormLabelProps> = ({ children }) => (
  <Typography variant="h6" sx={{ ml: 1.25, mb: 0.75 }}>
    {children}
  </Typography>
);

const createDefaultFlowRate = () => ({
  amountWei: "0",
  unitOfTime: UnitOfTime.Hour,
});

export default memo(function SendCard(props: {
  restoration: SendStreamRestoration | undefined;
}) {
  const theme = useTheme();
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
  const { setTransactionDrawerOpen } = useTransactionDrawerContext();
  const router = useRouter();

  const [receiver, setReceiver] = useState<DisplayAddress | undefined>(
    props.restoration?.receiver
  );
  const [selectedToken, setSelectedToken] = useState<
    SuperTokenMinimal | undefined
  >(props.restoration?.token);
  const [flowRate, setFlowRate] = useState<FlowRateWithTime>(
    props.restoration?.flowRate ?? createDefaultFlowRate()
  );
  const [understandLiquidationRisk, setUnderstandLiquidationRisk] =
    useState(false);

  const amountPerSecond = useMemo(
    () =>
      flowRate
        ? ethers.utils
            .formatEther(
              BigNumber.from(flowRate.amountWei).div(flowRate.unitOfTime)
            )
            .toString()
        : "",
    [flowRate?.amountWei, flowRate?.unitOfTime]
  );

  const isWrappableSuperToken = selectedToken
    ? isWrappable(selectedToken)
    : false;
  const onTokenSelect = useCallback(
    (token: TokenMinimal) => {
      if (isSuper(token)) {
        setSelectedToken(token);
      } else {
        throw new Error("Only super token selection is supported");
      }
    },
    [setSelectedToken]
  );

  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();

  const superTokensQuery = subgraphApi.useTokensQuery({
    chainId: network.chainId,
    filter: {
      isSuperToken: true,
      isListed: true,
    },
  });
  const superTokens = useMemo(
    () =>
      superTokensQuery.data?.items?.map((x) => ({
        type: getSuperTokenType({ ...x, network, address: x.id }),
        address: x.id,
        name: x.name,
        symbol: x.symbol,
      })),
    [superTokensQuery.data]
  );

  const shouldSearchForExistingStreams =
    !!walletAddress && !!receiver && !!selectedToken && !!flowRate;
  const existingStreams = subgraphApi.useStreamsQuery(
    shouldSearchForExistingStreams
      ? {
          chainId: network.chainId,
          filter: {
            sender: walletAddress,
            receiver: receiver.hash,
            token: selectedToken.address,
            currentFlowRate_not: "0",
          },
          pagination: {
            skip: 0,
            take: 1,
          },
        }
      : skipToken
  );
  const existingStream = existingStreams.data?.items?.[0];

  const hasAllDataForStream =
    receiver &&
    selectedToken &&
    flowRate &&
    !BigNumber.from(flowRate.amountWei).isZero();

  const isSendDisabled =
    !!existingStream || !hasAllDataForStream || !understandLiquidationRisk;

  const sendStreamRestoration: SendStreamRestoration | undefined =
    hasAllDataForStream
      ? {
          type: RestorationType.SendStream,
          chainId: network.chainId,
          token: selectedToken,
          receiver: receiver,
          flowRate: flowRate,
        }
      : undefined;

  return (
    <Card
      sx={{
        maxWidth: "600px",
        borderRadius: "20px",
        p: 4,
      }}
      elevation={1}
    >
      <Stack spacing={4}>
        <Typography variant="h4" component="h1">
          Send Stream
        </Typography>

        <Stack spacing={2.5}>
          <Box>
            <FormLabel>Receiver Wallet Address</FormLabel>
            <AddressSearch
              address={receiver}
              onChange={(address) => {
                setReceiver(address);
              }}
            />
          </Box>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2.5 }}
          >
            <Stack justifyContent="stretch">
              <FormLabel>Super Token</FormLabel>
              <TokenDialogButton
                token={selectedToken}
                tokenSelection={{
                  showUpgrade: true,
                  tokenPairsQuery: {
                    data: superTokens,
                    isLoading: superTokensQuery.isLoading,
                    isUninitialized: superTokensQuery.isUninitialized,
                  },
                }}
                onTokenSelect={onTokenSelect}
              />
            </Stack>

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mr: 0.75 }}
              >
                <FormLabel>Flow Rate</FormLabel>
                <InfoIcon fontSize="small" />
              </Stack>

              <FlowRateInput
                flowRateWithTime={flowRate}
                onChange={setFlowRate}
              />
            </Box>
          </Box>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "4fr 3fr", gap: 2.5 }}
          >
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mr: 0.75 }}
              >
                <FormLabel>Ends on</FormLabel>
                <InfoIcon fontSize="small" />
              </Stack>
              <TextField value="∞" disabled fullWidth />
            </Box>
            <Box>
              <FormLabel>Amount per second</FormLabel>
              <TextField
                disabled
                value={amountPerSecond.toString()}
                fullWidth
              />
            </Box>
          </Box>

          {selectedToken && walletAddress && (
            <Stack direction="row" alignItems="center" justifyContent="center">
              <BalanceSuperToken
                chainId={network.chainId}
                accountAddress={walletAddress}
                tokenAddress={selectedToken.address}
              />

              {isWrappableSuperToken && (
                <Link
                  href={`/wrap?upgrade&token=${selectedToken.address}&network=${network.slugName}`}
                  passHref
                >
                  <Tooltip title="Wrap">
                    <IconButton>
                      <AddCircleOutline />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
            </Stack>
          )}
        </Stack>

        <Stack gap={2.5}>
          {sendStreamRestoration && (
            <>
              <Divider />
              {!existingStream && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: [2.5, 3],
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  {/** TODO(KK): Create separate preview? */}
                  <SendStreamPreview
                    receiver={sendStreamRestoration.receiver}
                    token={sendStreamRestoration.token}
                    flowRateWithTime={sendStreamRestoration.flowRate}
                  />
                </Paper>
              )}

              {existingStream && (
                <Alert severity="error">
                  <AlertTitle>Stream already exists!</AlertTitle>
                  <Typography variant="body2">
                    Updating a stream is currently not supported.
                  </Typography>
                </Alert>
              )}

              <Alert severity="warning">
                <AlertTitle>Protect your buffer!</AlertTitle>
                <Typography variant="body2">
                  If you do not cancel this stream before your balance reaches
                  zero, you will lose your buffer.
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={understandLiquidationRisk}
                        onChange={() =>
                          setUnderstandLiquidationRisk(
                            !understandLiquidationRisk
                          )
                        }
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I understand the risk.
                      </Typography>
                    }
                  />
                </FormGroup>
              </Alert>
            </>
          )}

          <TransactionButton
            hidden={false}
            disabled={isSendDisabled}
            mutationResult={flowCreateResult}
            onClick={(setTransactionDialogContent) => {
              if (isSendDisabled) {
                throw Error("This should never happen.");
              }

              flowCreateTrigger({
                chainId: network.chainId,
                flowRateWei: calculateTotalAmountWei(flowRate).toString(),
                receiverAddress: receiver.hash,
                superTokenAddress: selectedToken.address,
                userDataBytes: undefined,
                waitForConfirmation: false,
                transactionExtraData: {
                  restoration: sendStreamRestoration,
                },
              })
                .unwrap()
                .then(() => {});

              setTransactionDialogContent({
                successActions: (
                  <TransactionDialogActions>
                    <TransactionDialogButton
                      color="primary"
                      onClick={() =>
                        router
                          .push("/")
                          .then(() => setTransactionDrawerOpen(true))
                      }
                    >
                      Go to tokens page ➜
                    </TransactionDialogButton>
                  </TransactionDialogActions>
                ),
              });
            }}
          >
            Send
          </TransactionButton>
        </Stack>
      </Stack>
    </Card>
  );
});
