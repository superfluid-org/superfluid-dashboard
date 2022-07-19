import { ErrorMessage } from "@hookform/error-message";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { formatEther, parseEther } from "ethers/lib/utils";
import Link from "next/link";
import { FC, memo, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import TooltipIcon from "../common/TooltipIcon";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { isWrappable } from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import { BalanceSuperToken } from "../tokenWrapping/BalanceSuperToken";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import {
  ModifyStreamRestoration,
  RestorationType,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { TransactionButton } from "../transactions/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactions/TransactionDialog";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AddressSearch from "./AddressSearch";
import { calculateTotalAmountWei, FlowRateInput } from "./FlowRateInput";
import { StreamingPreview } from "./SendStreamPreview";
import {
  PartialStreamingForm,
  ValidStreamingForm,
} from "./StreamingFormProvider";

interface FormLabelProps {
  children?: React.ReactNode;
}

const FormLabel: FC<FormLabelProps> = ({ children }) => (
  <Typography variant="h6" sx={{ ml: 1.25, mb: 0.75 }}>
    {children}
  </Typography>
);

export default memo(function SendCard() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();
  const getTransactionOverrides = useGetTransactionOverrides();

  const {
    watch,
    control,
    formState,
    getValues,
    reset: resetForm,
  } = useFormContext<PartialStreamingForm>();

  const [receiver, selectedToken, flowRateEther, understandLiquidationRisk] =
    watch([
      "data.receiver",
      "data.token",
      "data.flowRate",
      "data.understandLiquidationRisk",
    ]);

  const isWrappableSuperToken = selectedToken
    ? isWrappable(selectedToken)
    : false;

  const amountPerSecond = useMemo(
    () =>
      formatEther(
        parseEtherOrZero(flowRateEther.amountEther).div(
          flowRateEther.unitOfTime
        )
      ),
    [flowRateEther?.amountEther, flowRateEther?.unitOfTime]
  );

  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();
  const [flowUpdateTrigger, flowUpdateResult] = rpcApi.useFlowUpdateMutation();
  const [flowDeleteTrigger, flowDeleteResult] = rpcApi.useFlowDeleteMutation();

  const superTokensQuery = subgraphApi.useTokensQuery({
    chainId: network.id,
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
    [superTokensQuery.data, network]
  );

  const shouldSearchForActiveFlow =
    !!visibleAddress && !!receiver && !!selectedToken;

  const { currentData: activeFlow, data: _discard } =
    rpcApi.useGetActiveFlowQuery(
      shouldSearchForActiveFlow
        ? {
            chainId: network.id,
            tokenAddress: selectedToken.address,
            senderAddress: visibleAddress,
            receiverAddress: receiver,
          }
        : skipToken
    );

  const isSendDisabled = formState.isValidating || !formState.isValid;

  return (
    <Card
      elevation={1}
      sx={{
        maxWidth: "600px",
        [theme.breakpoints.down("md")]: {
          boxShadow: "none",
          backgroundImage: "none",
          borderRadius: 0,
          border: 0,
          p: 0,
        },
      }}
    >
      <Stack spacing={4}>
        <Button
          color="primary"
          variant="textContained"
          size="large"
          sx={{ alignSelf: "flex-start", pointerEvents: "none" }}
        >
          {activeFlow ? "Modify Stream" : "Send Stream"}
        </Button>

        <ErrorMessage
          name="data"
          render={({ message }) =>
            !!message && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {message}
              </Alert>
            )
          }
        />

        <Stack spacing={2.5}>
          <Box>
            <FormLabel>Receiver Wallet Address</FormLabel>
            <Controller
              control={control}
              name="data.receiver"
              render={({ field: { onChange, onBlur } }) => (
                <AddressSearch
                  address={receiver}
                  onChange={onChange}
                  onBlur={onBlur}
                  addressLength={isBelowMd ? "medium" : "long"}
                  ButtonProps={{ fullWidth: true }}
                />
              )}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 2.5,
              [theme.breakpoints.down("md")]: {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <Stack justifyContent="stretch">
              <FormLabel>Super Token</FormLabel>

              <Controller
                control={control}
                name="data.token"
                render={({ field: { onChange, onBlur } }) => (
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
                    onTokenSelect={onChange}
                    onBlur={onBlur}
                    ButtonProps={{ variant: "input" }}
                  />
                )}
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
                <TooltipIcon title="Flow rate is the velocity of tokens being streamed." />
              </Stack>

              <Controller
                control={control}
                name="data.flowRate"
                render={({ field: { onChange, onBlur } }) => (
                  <FlowRateInput
                    flowRateEther={flowRateEther}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "4fr 3fr",
              gap: 2.5,
              [theme.breakpoints.down("md")]: {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mr: 0.75 }}
              >
                <FormLabel>Ends on</FormLabel>
                <TooltipIcon title="If the end date is not specified, stream will run indefinitely or until you run out of tokens." />
              </Stack>
              <TextField data-cy={"ends-on"} value="∞" disabled fullWidth />
            </Box>
            <Box>
              <FormLabel>Amount per second</FormLabel>
              <TextField
                data-cy={"amount-per-second"}
                disabled
                value={amountPerSecond.toString()}
                fullWidth
              />
            </Box>
          </Box>

          <Alert severity="warning" icon={false}>
            <FormGroup>
              <Controller
                control={control}
                name="data.understandLiquidationRisk"
                render={({ field: { onChange, onBlur } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        data-cy={"risk-checkbox"}
                        checked={understandLiquidationRisk}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I understand that if I have to{" "}
                        <strong>
                          cancel the stream before my balance reaches zero
                        </strong>{" "}
                        or else I will be liquidated and{" "}
                        <strong>lose my buffer</strong>.
                      </Typography>
                    }
                  />
                )}
              />
            </FormGroup>
          </Alert>

          {selectedToken && visibleAddress && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              <BalanceSuperToken
                data-cy={"balance"}
                chainId={network.id}
                accountAddress={visibleAddress}
                tokenAddress={selectedToken.address}
                TypographyProps={{ variant: "h7mono" }}
              />

              {isWrappableSuperToken && (
                <Link
                  href={`/wrap?upgrade&token=${selectedToken.address}&network=${network.slugName}`}
                  passHref
                >
                  <Tooltip title="Wrap more">
                    <IconButton
                      data-cy={"balance-wrap-button"}
                      color="primary"
                      size="small"
                    >
                      <AddCircleOutline />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
            </Stack>
          )}
        </Stack>

        <Stack gap={2.5}>
          {receiver && selectedToken && (
            <>
              <Divider />
              <StreamingPreview
                receiver={receiver}
                token={selectedToken}
                flowRateEther={flowRateEther}
                existingStream={activeFlow ?? null}
              />
            </>
          )}

          {!activeFlow ? (
            <TransactionButton
              dataCy={"send-transaction-button"}
              hidden={false}
              disabled={isSendDisabled}
              mutationResult={flowCreateResult}
              onClick={async (signer, setTransactionDialogContent) => {
                if (!formState.isValid) {
                  throw Error(
                    `This should never happen. Form state: ${JSON.stringify(
                      formState,
                      null,
                      2
                    )}`
                  );
                }

                const { data: formData } = getValues() as ValidStreamingForm;

                const restoration: SendStreamRestoration = {
                  type: RestorationType.SendStream,
                  chainId: network.id,
                  token: formData.token,
                  receiver: formData.receiver,
                  flowRate: {
                    amountWei: parseEther(
                      formData.flowRate.amountEther
                    ).toString(),
                    unitOfTime: formData.flowRate.unitOfTime,
                  },
                };
                flowCreateTrigger({
                  signer,
                  chainId: network.id,
                  flowRateWei:
                    calculateTotalAmountWei(flowRateEther).toString(),
                  senderAddress: await signer.getAddress(),
                  receiverAddress: formData.receiver,
                  superTokenAddress: formData.token.address,
                  userDataBytes: undefined,
                  waitForConfirmation: false,
                  transactionExtraData: {
                    restoration: restoration,
                  },
                  overrides: await getTransactionOverrides(network),
                })
                  .unwrap()
                  .then(() => resetForm());

                // TODO(KK): "open another stream" button?
                setTransactionDialogContent({
                  successActions: (
                    <TransactionDialogActions>
                      <Link
                        href={getTokenPagePath({
                          network: network.slugName,
                          token: formData.token.address,
                        })}
                        passHref
                      >
                        <TransactionDialogButton color="primary">
                          Go to token page ➜
                        </TransactionDialogButton>
                      </Link>
                    </TransactionDialogActions>
                  ),
                });
              }}
            >
              Send
            </TransactionButton>
          ) : (
            <Stack direction="column" gap={1}>
              <TransactionButton
                hidden={false}
                disabled={isSendDisabled}
                mutationResult={flowUpdateResult}
                onClick={async (signer, setTransactionDialogContent) => {
                  if (!formState.isValid) {
                    throw Error("This should never happen.");
                  }

                  const { data: formData } = getValues() as ValidStreamingForm;
                  flowUpdateTrigger({
                    signer,
                    chainId: network.id,
                    flowRateWei: calculateTotalAmountWei({
                      amountWei: parseEther(
                        formData.flowRate.amountEther
                      ).toString(),
                      unitOfTime: formData.flowRate.unitOfTime,
                    }).toString(),
                    senderAddress: await signer.getAddress(),
                    receiverAddress: formData.receiver,
                    superTokenAddress: formData.token.address,
                    userDataBytes: undefined,
                    waitForConfirmation: false,
                    transactionExtraData: {
                      restoration: {
                        type: RestorationType.ModifyStream,
                        chainId: network.id,
                        token: formData.token,
                        receiver: formData.receiver,
                        flowRate: {
                          amountWei: parseEther(
                            formData.flowRate.amountEther
                          ).toString(),
                          unitOfTime: formData.flowRate.unitOfTime,
                        },
                      } as ModifyStreamRestoration,
                    },
                    overrides: await getTransactionOverrides(network),
                  }).unwrap();
                  // .then(() => resetForm()); // TODO(KK): Reset form. Can't do it ATM because then the transaction dialog gets lost.

                  // TODO(KK): Go to stream page instead?
                  setTransactionDialogContent({
                    successActions: (
                      <TransactionDialogActions>
                        <Link
                          href={getTokenPagePath({
                            network: network.slugName,
                            token: formData.token.address,
                          })}
                          passHref
                        >
                          <TransactionDialogButton color="primary">
                            Go to token page ➜
                          </TransactionDialogButton>
                        </Link>
                      </TransactionDialogActions>
                    ),
                  });
                }}
              >
                Modify
              </TransactionButton>
              <TransactionButton
                dataCy={"cancel-stream-button"}
                hidden={false}
                disabled={false}
                mutationResult={flowDeleteResult}
                ButtonProps={{
                  variant: "outlined",
                }}
                onClick={async (signer) => {
                  const receiverAddress = receiver;
                  const superTokenAddress = selectedToken?.address;
                  const senderAddress = visibleAddress;
                  if (
                    !receiverAddress ||
                    !superTokenAddress ||
                    !senderAddress
                  ) {
                    throw Error("This should never happen.");
                  }

                  flowDeleteTrigger({
                    signer,
                    receiverAddress,
                    superTokenAddress,
                    senderAddress,
                    chainId: network.id,
                    userDataBytes: undefined,
                    waitForConfirmation: false,
                    overrides: await getTransactionOverrides(network),
                  }).unwrap();
                }}
              >
                Cancel Stream
              </TransactionButton>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
});
