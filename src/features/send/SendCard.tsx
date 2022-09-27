import { ErrorMessage } from "@hookform/error-message";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Token } from "@superfluid-finance/sdk-core";
import { formatEther, parseEther } from "ethers/lib/utils";
import Link from "next/link";
import { memo, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import {
  calculateBufferAmount,
  parseEtherOrZero,
} from "../../utils/tokenUtils";
import TooltipIcon from "../common/TooltipIcon";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NetworkBadge from "../network/NetworkBadge";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { isWrappable, SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import { BalanceSuperToken } from "../tokenWrapping/BalanceSuperToken";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import {
  TransactionButton,
  transactionButtonDefaultProps,
} from "../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactionBoundary/TransactionDialog";
import {
  ModifyStreamRestoration,
  RestorationType,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AddressSearch from "./AddressSearch";
import { calculateTotalAmountWei, FlowRateInput } from "./FlowRateInput";
import { StreamingPreview } from "./SendStreamPreview";
import {
  PartialStreamingForm,
  ValidStreamingForm,
} from "./StreamingFormProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { StreamSchedulerButton } from "./StreamSchedulerButton";
import { platformApi } from "../redux/platformApi/platformApi";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { isActiveStreamSchedulingOrder } from "../../hooks/useScheduledStream";

export default memo(function SendCard() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();
  const getTransactionOverrides = useGetTransactionOverrides();

  const [showBufferAlert, setShowBufferAlert] = useState(false);

  const {
    watch,
    control,
    formState,
    getValues,
    setValue,
    reset: resetForm,
  } = useFormContext<PartialStreamingForm>();

  const [
    receiverAddress,
    tokenAddress,
    flowRateEther,
    understandLiquidationRisk,
    endDate,
  ] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.flowRate",
    "data.understandLiquidationRisk",
    "data.endDate",
  ]);

  useEffect(() => {
    if (!!receiverAddress && !!tokenAddress && !!flowRateEther.amountEther) {
      setShowBufferAlert(true);
    }
  }, [setShowBufferAlert, receiverAddress, tokenAddress, flowRateEther.amountEther]);

  const shouldSearchForActiveFlow =
    !!visibleAddress && !!receiverAddress && !!tokenAddress;

  const { currentData: activeFlow, data: _discard } =
    rpcApi.useGetActiveFlowQuery(
      shouldSearchForActiveFlow
        ? {
            chainId: network.id,
            tokenAddress: tokenAddress,
            senderAddress: visibleAddress,
            receiverAddress: receiverAddress,
          }
        : skipToken
    );

  const { data: existingScheduledEndTimestamp } =
    rpcApi.useStreamScheduledEndDateQuery(
      shouldSearchForActiveFlow && activeFlow
        ? {
            chainId: network.id,
            superTokenAddress: tokenAddress,
            senderAddress: visibleAddress,
            receiverAddress: receiverAddress,
          }
        : skipToken
    );

  const { token } = subgraphApi.useTokenQuery(
    tokenAddress
      ? {
          chainId: network.id,
          id: tokenAddress,
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        token: result.currentData
          ? ({
              ...result.currentData,
              address: result.currentData.id,
              type: getSuperTokenType({
                network,
                address: result.currentData.id,
                underlyingAddress: result.currentData.underlyingAddress,
              }),
            } as Token & SuperTokenMinimal)
          : undefined,
      }),
    }
  );

  const isWrappableSuperToken = token ? isWrappable(token) : false;

  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();
  const [flowUpdateTrigger, flowUpdateResult] = rpcApi.useFlowUpdateMutation();
  const [flowDeleteTrigger, flowDeleteResult] = rpcApi.useFlowDeleteMutation();

  const networkCustomTokens = useNetworkCustomTokens(network.id);

  const listedSuperTokensQuery = subgraphApi.useTokensQuery({
    chainId: network.id,
    filter: {
      isSuperToken: true,
      isListed: true,
    },
  });

  const customSuperTokensQuery = subgraphApi.useTokensQuery(
    networkCustomTokens.length > 0
      ? {
          chainId: network.id,
          filter: {
            isSuperToken: true,
            isListed: false,
            id_in: networkCustomTokens,
          },
        }
      : skipToken
  );

  const superTokens = useMemo(
    () =>
      (listedSuperTokensQuery.data?.items || [])
        .concat(customSuperTokensQuery.data?.items || [])
        .map((x) => ({
          type: getSuperTokenType({ ...x, network, address: x.id }),
          address: x.id,
          name: x.name,
          symbol: x.symbol,
          decimals: 18,
          isListed: x.isListed,
        })),
    [listedSuperTokensQuery.data, customSuperTokensQuery.data, network]
  );

  const bufferAmount = useMemo(() => {
    if (!flowRateEther.amountEther || !flowRateEther.unitOfTime) {
      return undefined;
    }

    return calculateBufferAmount(network, {
      amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
      unitOfTime: flowRateEther.unitOfTime,
    });
  }, [network, flowRateEther]);

  const isSendDisabled = formState.isValidating || !formState.isValid;

  const doesNetworkSupportStreamScheduler =
    !!network.streamSchedulerContractAddress;

  // const { existingScheduling } = platformApi.useListSubscriptionsQuery(
  //   visibleAddress && network.platformUrl
  //     ? {
  //         account: getAddress(visibleAddress),
  //         chainId: network.id,
  //         baseUrl: network.platformUrl,
  //       }
  //     : skipToken,
  //   {
  //     selectFromResult: (queryResult) => ({
  //       existingScheduling: queryResult.data?.data?.find((scheduling) =>
  //         isActiveStreamSchedulingOrder(
  //           {
  //             receiver: receiverAddress ?? "skip",
  //             sender: visibleAddress ?? "skip",
  //             token: tokenAddress ?? "skip",
  //           },
  //           scheduling
  //         )
  //       ),
  //     }),
  //   }
  // );

  // TODO(KK): Not a great solution...
  // useEffect(() => {
  //   if (existingScheduling?.meta_data?.end_date) {
  //     setEndDate(new Date(existingScheduling.meta_data.end_date));
  //   } else {
  //     setEndDate(null);
  //   }
  // }, [existingScheduling]);

  const [streamScheduling, setStreamScheduling] = useState(false);

  // TODO(KK): Don't really like the useEffect solution here.
  useEffect(() => {
    if (existingScheduledEndTimestamp) {
      const existingScheduledEndDate = new Date(
        existingScheduledEndTimestamp * 1000
      );

      // Ignore old schedule orders.
      if (existingScheduledEndDate.getTime() > Date.now()) {
        setStreamScheduling(true);
        setValue("data.endDate", existingScheduledEndDate);
      }
    } else {
      setStreamScheduling(false);
      setValue("data.endDate", null);
    }
  }, [existingScheduledEndTimestamp]);

  // const [fixedAmountEther, setFixedAmountEther] = useState<string>("");

  // useEffect(() => {
  //   if (!streamScheduling) {
  //     setFixedAmountEther("");
  //   } else {

  //   }
  // }, [streamScheduling, endDate, setFixedAmountEther, flowRateEther])

  const [doEverythingTogether, doEverythingTogetherResult] =
    rpcApi.useDoEverythingTogetherMutation();

  return (
    <>
      <Card
        data-cy={"send-card"}
        elevation={1}
        sx={{
          maxWidth: "600px",
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
          data-cy={"send-or-modify-stream"}
          color="primary"
          variant="textContained"
          size="large"
          sx={{ alignSelf: "flex-start", pointerEvents: "none", mb: 4 }}
        >
          {activeFlow ? "Modify Stream" : "Send Stream"}
        </Button>

        <NetworkBadge
          network={network}
          sx={{ position: "absolute", top: 0, right: theme.spacing(3.5) }}
          NetworkIconProps={{
            size: 32,
            fontSize: 18,
            sx: { [theme.breakpoints.down("md")]: { borderRadius: 1 } },
          }}
        />

        <Stack spacing={2.5}>
          <ErrorMessage
            name="data"
            // ErrorMessage has a bug and current solution is to pass in errors via props.
            // TODO: keep eye on this issue: https://github.com/react-hook-form/error-message/issues/91
            errors={formState.errors}
            render={({ message }) =>
              !!message && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {message}
                </Alert>
              )
            }
          />

          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mr: 0.75 }}
            >
              <FormLabel>Receiver Wallet Address</FormLabel>
              <TooltipIcon title="Must not be an exchange address" />
            </Stack>

            <Controller
              control={control}
              name="data.receiverAddress"
              render={({ field: { onChange, onBlur } }) => (
                <AddressSearch
                  address={receiverAddress}
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
                name="data.tokenAddress"
                render={({ field: { onChange, onBlur } }) => (
                  <TokenDialogButton
                    token={token}
                    tokenSelection={{
                      showUpgrade: true,
                      tokenPairsQuery: {
                        data: superTokens,
                        isFetching:
                          listedSuperTokensQuery.isFetching ||
                          customSuperTokensQuery.isFetching,
                      },
                    }}
                    onTokenSelect={(x) => onChange(x.address)}
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

          {/* <Box
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
              <TextField data-cy={"ends-on"} value="∞" fullWidth />
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
          </Box> */}

          {doesNetworkSupportStreamScheduler && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={streamScheduling}
                    onChange={(_event, value) => setStreamScheduling(value)}
                  />
                }
                label="Stream Scheduling"
              />
              <Stack component={Collapse} in={streamScheduling} spacing={1}>
                <FormGroup>
                  <FormLabel>End Date</FormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                      control={control}
                      name="data.endDate"
                      render={({ field: { onChange, onBlur } }) => (
                        <DateTimePicker
                          renderInput={(props) => (
                            <TextField fullWidth {...props} onBlur={onBlur} />
                          )}
                          value={endDate}
                          onChange={onChange}
                          disablePast={true}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </FormGroup>
              </Stack>
            </>
          )}

          {tokenAddress && visibleAddress && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <BalanceSuperToken
                    data-cy={"balance"}
                    chainId={network.id}
                    accountAddress={visibleAddress}
                    tokenAddress={tokenAddress}
                    TypographyProps={{ variant: "h7mono" }}
                  />
                  <Typography variant="h7">{token?.symbol}</Typography>
                </Stack>
                {isWrappableSuperToken && (
                  <Link
                    href={`/wrap?upgrade&token=${tokenAddress}&network=${network.slugName}`}
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
              <Divider />
            </>
          )}

          {!!(receiverAddress && token) && (
            <StreamingPreview
              receiver={receiverAddress}
              token={token}
              flowRateEther={flowRateEther}
              existingStream={activeFlow ?? null}
            />
          )}

          {showBufferAlert && (
            <Alert severity="error">
              If you do not cancel this stream before your balance reaches zero,{" "}
              <b>
                you will lose your{" "}
                {bufferAmount && token ? (
                  <span translate="no">
                    <Amount wei={bufferAmount.toString()}>
                      {" "}
                      {token.symbol}
                    </Amount>
                  </span>
                ) : (
                  <span>your</span>
                )}{" "}
                buffer.
              </b>
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
                          sx={{ color: "inherit" }}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Yes, I understand the risk.
                        </Typography>
                      }
                    />
                  )}
                />
              </FormGroup>
            </Alert>
          )}

          <TransactionBoundary mutationResult={flowCreateResult}>
            {({ closeDialog, setDialogSuccessActions }) =>
              !activeFlow && (
                <TransactionButton
                  dataCy={"send-transaction-button"}
                  disabled={isSendDisabled}
                  onClick={async (signer) => {
                    if (!formState.isValid) {
                      throw Error(
                        `This should never happen. Form state: ${JSON.stringify(
                          formState,
                          null,
                          2
                        )}`
                      );
                    }

                    const { data: formData } =
                      getValues() as ValidStreamingForm;

                    const restoration: SendStreamRestoration = {
                      version: 2,
                      type: RestorationType.SendStream,
                      chainId: network.id,
                      tokenAddress: formData.tokenAddress,
                      receiverAddress: formData.receiverAddress,
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
                      receiverAddress: formData.receiverAddress,
                      superTokenAddress: formData.tokenAddress,
                      userDataBytes: undefined,
                      waitForConfirmation: false,
                      transactionExtraData: {
                        restoration: restoration,
                      },
                      overrides: await getTransactionOverrides(network),
                    })
                      .unwrap()
                      .then(() => resetForm());

                    setDialogSuccessActions(
                      <TransactionDialogActions>
                        <Stack gap={1} sx={{ width: "100%" }}>
                          <TransactionDialogButton
                            data-cy={"send-more-streams-button"}
                            color="secondary"
                            onClick={closeDialog}
                          >
                            Send more streams
                          </TransactionDialogButton>
                          <Link
                            href={getTokenPagePath({
                              network: network.slugName,
                              token: formData.tokenAddress,
                            })}
                            passHref
                          >
                            <TransactionDialogButton
                              data-cy="go-to-token-page-button"
                              color="primary"
                            >
                              Go to token page ➜
                            </TransactionDialogButton>
                          </Link>
                        </Stack>
                      </TransactionDialogActions>
                    );
                  }}
                >
                  Send
                </TransactionButton>
              )
            }
          </TransactionBoundary>

          {streamScheduling && (
            <Collapse in={streamScheduling}>
              {visibleAddress && receiverAddress && endDate && token ? (
                <StreamSchedulerButton
                  network={network}
                  senderAddress={visibleAddress}
                  receiverAddress={receiverAddress}
                  endDate={endDate}
                  superTokenAddress={token.address}
                />
              ) : (
                <Button {...transactionButtonDefaultProps} disabled={true}>
                  Schedule
                </Button>
              )}
            </Collapse>
          )}

          <Stack
            direction="column"
            gap={1}
            sx={{ ...(!activeFlow ? { display: "none" } : {}) }}
          >
            <TransactionBoundary mutationResult={flowUpdateResult}>
              {({ setDialogSuccessActions }) =>
                activeFlow && (
                  <TransactionButton
                    dataCy={"modify-stream-button"}
                    disabled={isSendDisabled}
                    onClick={async (signer) => {
                      if (!formState.isValid) {
                        throw Error("This should never happen.");
                      }

                      const { data: formData } =
                        getValues() as ValidStreamingForm;

                      const restoration: ModifyStreamRestoration = {
                        version: 2,
                        type: RestorationType.ModifyStream,
                        chainId: network.id,
                        tokenAddress: formData.tokenAddress,
                        receiverAddress: formData.receiverAddress,
                        flowRate: {
                          amountWei: parseEther(
                            formData.flowRate.amountEther
                          ).toString(),
                          unitOfTime: formData.flowRate.unitOfTime,
                        },
                      };
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
                        receiverAddress: formData.receiverAddress,
                        superTokenAddress: formData.tokenAddress,
                        userDataBytes: undefined,
                        waitForConfirmation: false,
                        transactionExtraData: {
                          restoration: restoration,
                        },
                        overrides: await getTransactionOverrides(network),
                      })
                        .unwrap()
                        .then(() => resetForm());

                      setDialogSuccessActions(
                        <TransactionDialogActions>
                          <Link
                            href={getTokenPagePath({
                              network: network.slugName,
                              token: formData.tokenAddress,
                            })}
                            passHref
                          >
                            <TransactionDialogButton
                              data-cy={"go-to-token-page-button"}
                              color="primary"
                            >
                              Go to token page ➜
                            </TransactionDialogButton>
                          </Link>
                        </TransactionDialogActions>
                      );
                    }}
                  >
                    Modify Stream
                  </TransactionButton>
                )
              }
            </TransactionBoundary>
            <TransactionBoundary mutationResult={flowDeleteResult}>
              {() =>
                activeFlow && (
                  <TransactionButton
                    dataCy={"cancel-stream-button"}
                    ButtonProps={{
                      variant: "outlined",
                    }}
                    onClick={async (signer) => {
                      const superTokenAddress = tokenAddress;
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
                      })
                        .unwrap()
                        .then(() => resetForm());
                    }}
                  >
                    Cancel Stream
                  </TransactionButton>
                )
              }
            </TransactionBoundary>
          </Stack>
        </Stack>
      </Card>
    </>
  );
});
