import { ErrorMessage } from "@hookform/error-message";
import AddRounded from "@mui/icons-material/AddRounded";
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
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Token } from "@superfluid-finance/sdk-core";
import { add, fromUnixTime, getUnixTime } from "date-fns";
import Decimal from "decimal.js";
import { BigNumber, BigNumberish } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import { dateNowSeconds, getTimeInSeconds } from "../../utils/dateUtils";
import { getDecimalPlacesToRoundTo } from "../../utils/DecimalUtils";
import {
  calculateBufferAmount,
  parseEtherOrZero,
} from "../../utils/tokenUtils";
import { useAnalytics } from "../analytics/useAnalytics";
import TooltipIcon from "../common/TooltipIcon";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NetworkBadge from "../network/NetworkBadge";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { isWrappable, SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { BalanceSuperToken } from "../tokenWrapping/BalanceSuperToken";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
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

function getStreamedTotal(
  startTimestamp = getUnixTime(new Date()),
  endTimestamp: number | null,
  flowRateWei: BigNumberish
): BigNumber | undefined {
  if (endTimestamp && endTimestamp > startTimestamp) {
    return BigNumber.from(flowRateWei).mul(endTimestamp - startTimestamp);
  }

  return undefined;
}

function getStreamedTotalEtherRoundedString(
  startTimestamp: number | null,
  endTimestamp: number | null,
  flowRateWei: BigNumberish
): string {
  const bigNumber = getStreamedTotal(
    startTimestamp || getUnixTime(new Date()),
    endTimestamp,
    flowRateWei
  );

  if (!bigNumber || bigNumber?.isZero()) return "";

  const decimal = new Decimal(formatEther(bigNumber));
  const decimalPlacesToRoundTo = getDecimalPlacesToRoundTo(decimal);
  return decimal.toDP(decimalPlacesToRoundTo).toFixed();
}

function getEndTimestamp(
  startTimestamp: number | null,
  amountEthers: string,
  flowRateWei: BigNumberish
): number | null {
  const amountWei = parseEtherOrZero(amountEthers);
  if (amountWei.isZero()) return null;

  return amountWei
    .div(flowRateWei)
    .add(startTimestamp || dateNowSeconds())
    .toNumber();
}

export default memo(function SendCard() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();
  const getTransactionOverrides = useGetTransactionOverrides();
  const { txAnalytics } = useAnalytics();

  const [MIN_VISIBLE_END_DATE, MAX_VISIBLE_END_DATE] = useMemo(
    () => [
      add(new Date(), {
        minutes: 5,
      }),
      add(new Date(), {
        years: 2,
      }),
    ],
    []
  );

  const {
    watch,
    control,
    formState,
    getValues,
    setValue,
    reset: resetFormData,
  } = useFormContext<PartialStreamingForm>();

  const resetForm = useCallback(() => {
    resetFormData();
    setStreamScheduling(false);
    setTotalStreamedEther("");
  }, [resetFormData]);

  const [
    receiverAddress,
    tokenAddress,
    flowRateEther,
    understandLiquidationRisk,
    startTimestamp,
    endTimestamp,
  ] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.flowRate",
    "data.understandLiquidationRisk",
    "data.startTimestamp",
    "data.endTimestamp",
  ]);

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

  const ReceiverAddressController = (
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
    [network, listedSuperTokensQuery.data, customSuperTokensQuery.data]
  );

  const TokenController = (
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
  );

  const flowRateWei = useMemo<BigNumber>(
    () =>
      calculateTotalAmountWei({
        amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
        unitOfTime: flowRateEther.unitOfTime,
      }),
    [flowRateEther.amountEther, flowRateEther.unitOfTime]
  );

  const FlowRateController = (
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
  );

  const doesNetworkSupportFlowScheduler =
    !!network.flowSchedulerContractAddress;
  // !!network.flowSchedulerContractAddress; // TODO(KK): Uncomment this to enable

  const [streamScheduling, setStreamScheduling] = useState<boolean>(
    !!endTimestamp || !!startTimestamp
  );

  const StreamSchedulingController = (
    <Switch
      checked={streamScheduling}
      onChange={(_event, value) => {
        if (!value) {
          setValue("data.startTimestamp", null);
          setValue("data.endTimestamp", null);
        }
        setStreamScheduling(value);
      }}
    />
  );

  const { existingStartTimestamp, existingEndTimestamp } =
    rpcApi.useScheduledDatesQuery(
      shouldSearchForActiveFlow && network?.flowSchedulerContractAddress
        ? {
            chainId: network.id,
            receiverAddress: receiverAddress,
            senderAddress: visibleAddress,
            superTokenAddress: tokenAddress,
          }
        : skipToken,
      {
        selectFromResult: (result) => {
          const { startDate, endDate } = result.data || {};

          return {
            existingStartTimestamp: startDate,
            existingEndTimestamp: endDate,
          };
        },
      }
    );

  const hasScheduledFlow = !!existingStartTimestamp;

  const existingEndDate = existingEndTimestamp
    ? fromUnixTime(existingEndTimestamp)
    : null;

  const existingStartDate = existingStartTimestamp
    ? fromUnixTime(existingStartTimestamp)
    : null;

  const endDate = useMemo<Date | null>(
    () => (endTimestamp ? fromUnixTime(endTimestamp) : null),
    [endTimestamp]
  );

  const startDate = useMemo<Date | null>(
    () => (startTimestamp ? fromUnixTime(startTimestamp) : null),
    [startTimestamp]
  );

  const [totalStreamedEther, setTotalStreamedEther] = useState<string>("");

  useEffect(() => {
    if (!endTimestamp) {
      if (existingStartTimestamp || existingEndTimestamp) {
        // Hide old schedule orders. It will be automatically deleted.
        setStreamScheduling(true);

        if (
          existingStartTimestamp &&
          existingStartTimestamp > dateNowSeconds()
        ) {
          setValue("data.startTimestamp", existingStartTimestamp);
        }

        if (existingEndTimestamp && existingEndTimestamp > dateNowSeconds()) {
          setValue("data.endTimestamp", existingEndTimestamp);
        }

        if (flowRateEther) {
          setTotalStreamedEther(
            getStreamedTotalEtherRoundedString(
              existingStartTimestamp || startTimestamp,
              existingEndTimestamp || endTimestamp,
              flowRateWei
            )
          );
        }
      } else {
        setStreamScheduling(false);
        setValue("data.endTimestamp", null);
        setTotalStreamedEther("");
      }
    }
  }, [existingStartTimestamp, existingEndTimestamp]);

  useEffect(() => {
    if (endTimestamp && flowRateWei) {
      setTotalStreamedEther(
        getStreamedTotalEtherRoundedString(
          startTimestamp,
          endTimestamp,
          flowRateWei
        )
      );
    }
  }, [startTimestamp, endTimestamp, flowRateWei]);

  const StartDateController = (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        control={control}
        name="data.startTimestamp"
        render={({ field: { onChange, onBlur } }) => (
          <DateTimePicker
            renderInput={(props) => (
              <TextField
                fullWidth
                autoComplete="off"
                {...props}
                onBlur={onBlur}
              />
            )}
            value={startDate}
            minDateTime={MIN_VISIBLE_END_DATE}
            maxDateTime={endDate || MAX_VISIBLE_END_DATE}
            ampm={false}
            onChange={(date: Date | null) =>
              onChange(date ? getUnixTime(date) : null)
            }
            disablePast
            disabled={!!activeFlow}
          />
        )}
      />
    </LocalizationProvider>
  );

  const EndDateController = (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        control={control}
        name="data.endTimestamp"
        render={({ field: { onChange, onBlur } }) => (
          <DateTimePicker
            renderInput={(props) => (
              <TextField
                fullWidth
                autoComplete="off"
                {...props}
                onBlur={onBlur}
              />
            )}
            value={endDate}
            minDateTime={startDate || MIN_VISIBLE_END_DATE}
            maxDateTime={MAX_VISIBLE_END_DATE}
            ampm={false}
            onChange={(date: Date | null) => {
              const endTimestamp = date ? getTimeInSeconds(date) : null;
              onChange(endTimestamp);
              // This is already handled in useEffect
              // setTotalStreamedEther(
              //   getStreamedTotalEtherRoundedString({
              //     endTimestamp,
              //     flowRateWei,
              //   })
              // );
            }}
            disablePast
          />
        )}
      />
    </LocalizationProvider>
  );

  const TotalStreamedController = (
    <TextField
      value={totalStreamedEther}
      autoComplete="off"
      onChange={(event) => {
        setTotalStreamedEther(event.target.value);
        setValue(
          "data.endTimestamp",
          getEndTimestamp(startTimestamp, event.target.value, flowRateWei)
        );
      }}
      InputProps={{
        startAdornment: <>≈&nbsp;</>,
        endAdornment: (
          <Stack direction="row" gap={0.75} sx={{ ml: 0.5 }}>
            <TokenIcon tokenSymbol={token?.symbol} isSuper size={24} />
            <Typography variant="h6" component="span">
              {token?.symbol ?? ""}
            </Typography>
          </Stack>
        ),
      }}
    />
  );

  const UnderstandLiquidationRiskController = (
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
            <Typography variant="body2">Yes, I understand the risk.</Typography>
          }
        />
      )}
    />
  );

  const [showBufferAlert, setShowBufferAlert] = useState(false);

  useEffect(() => {
    if (!!receiverAddress && !!tokenAddress && !!flowRateEther.amountEther) {
      setShowBufferAlert(true);
    }
  }, [setShowBufferAlert, receiverAddress, tokenAddress, flowRateEther.amountEther]);

  const tokenBufferQuery = rpcApi.useTokenBufferQuery(
    tokenAddress ? { chainId: network.id, token: tokenAddress } : skipToken
  );

  const bufferAmount = useMemo(() => {
    if (
      !flowRateEther.amountEther ||
      !flowRateEther.unitOfTime ||
      !tokenBufferQuery.data
    ) {
      return undefined;
    }

    return calculateBufferAmount(
      network,
      {
        amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
        unitOfTime: flowRateEther.unitOfTime,
      },
      tokenBufferQuery.data
    );
  }, [network, flowRateEther, tokenBufferQuery.data]);

  const BufferAlert = (
    <Alert data-cy="buffer-warning" severity="error">
      If you do not cancel this stream before your balance reaches zero,{" "}
      <b>
        you will lose your{" "}
        {bufferAmount && token ? (
          <span translate="no">
            <Amount wei={bufferAmount.toString()}> {token.symbol}</Amount>
          </span>
        ) : null}{" "}
        buffer.
      </b>
      <FormGroup>{UnderstandLiquidationRiskController}</FormGroup>
    </Alert>
  );

  const hasAnythingChanged =
    existingEndTimestamp !== endTimestamp ||
    existingStartTimestamp !== startTimestamp ||
    (activeFlow && activeFlow.flowRateWei !== flowRateWei.toString());

  const isSendDisabled =
    !hasAnythingChanged || formState.isValidating || !formState.isValid;

  const [upsertFlow, upsertFlowResult] =
    rpcApi.useUpsertFlowWithSchedulingMutation();

  const SendTransactionBoundary = (
    <TransactionBoundary mutationResult={upsertFlowResult}>
      {({ closeDialog, setDialogSuccessActions, setDialogLoadingInfo }) => (
        <TransactionButton
          dataCy={"send-transaction-button"}
          disabled={isSendDisabled}
          ButtonProps={{
            variant: "contained",
          }}
          onClick={async (signer) => {
            if (isSendDisabled) {
              throw Error(
                `This should never happen. Form state: ${JSON.stringify(
                  formState,
                  null,
                  2
                )}`
              );
            }

            const { data: formData } = getValues() as ValidStreamingForm;

            const flowRateWei = calculateTotalAmountWei({
              amountWei: parseEther(formData.flowRate.amountEther).toString(),
              unitOfTime: formData.flowRate.unitOfTime,
            }).toString();

            const transactionRestoration:
              | SendStreamRestoration
              | ModifyStreamRestoration = {
              type: activeFlow
                ? RestorationType.ModifyStream
                : RestorationType.SendStream,
              flowRate: {
                amountWei: parseEther(formData.flowRate.amountEther).toString(),
                unitOfTime: formData.flowRate.unitOfTime,
              },
              version: 2,
              chainId: network.id,
              tokenAddress: formData.tokenAddress,
              receiverAddress: formData.receiverAddress,
              ...(formData.startTimestamp
                ? { startTimestamp: formData.startTimestamp }
                : {}),
              ...(formData.endTimestamp
                ? { endTimestamp: formData.endTimestamp }
                : {}),
            };

            const primaryArgs = {
              chainId: network.id,
              senderAddress: await signer.getAddress(),
              receiverAddress: formData.receiverAddress,
              superTokenAddress: formData.tokenAddress,
              flowRateWei,
              userDataBytes: undefined,
              startTimestamp: formData.startTimestamp,
              endTimestamp: formData.endTimestamp,
            };
            upsertFlow({
              ...primaryArgs,
              transactionExtraData: {
                restoration: transactionRestoration,
              },
              signer,
              overrides: await getTransactionOverrides(network),
              waitForConfirmation: false,
            })
              .unwrap()
              .then(
                ...txAnalytics(
                  activeFlow ? "Send Stream" : "Modify Stream",
                  primaryArgs
                )
              )
              .then(() => void resetForm())
              .catch((error) => void error); // Error is already logged and handled in the middleware & UI.

            setDialogLoadingInfo(
              <Typography variant="h5" color="text.secondary" translate="yes">
                You are {activeFlow ? "modifying" : "sending"} a{" "}
                {endTimestamp ? "closed-ended" : ""} stream.
              </Typography>
            );

            if (activeFlow) {
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
            } else {
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
            }
          }}
        >
          {activeFlow ? "Modify Stream" : "Send Stream"}
        </TransactionButton>
      )}
    </TransactionBoundary>
  );

  const [flowDeleteTrigger, flowDeleteResult] =
    rpcApi.useDeleteFlowWithSchedulingMutation();

  const DeleteFlowBoundary = (
    <TransactionBoundary mutationResult={flowDeleteResult}>
      {({ setDialogLoadingInfo }) =>
        (activeFlow || hasScheduledFlow) && (
          <TransactionButton
            dataCy={"cancel-stream-button"}
            ButtonProps={{
              variant: "outlined",
              color: "error",
            }}
            onClick={async (signer) => {
              const superTokenAddress = tokenAddress;
              const senderAddress = visibleAddress;
              if (!receiverAddress || !superTokenAddress || !senderAddress) {
                throw Error("This should never happen.");
              }

              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are canceling a stream.
                </Typography>
              );

              const primaryArgs = {
                chainId: network.id,
                superTokenAddress,
                senderAddress,
                receiverAddress,
                userDataBytes: undefined,
              };
              flowDeleteTrigger({
                ...primaryArgs,
                signer,
                waitForConfirmation: false,
                overrides: await getTransactionOverrides(network),
              })
                .unwrap()
                .then(...txAnalytics("Cancel Stream", primaryArgs))
                .then(() => resetForm())
                .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
            }}
          >
            Cancel Stream
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );

  return (
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
          {ReceiverAddressController}
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
            {TokenController}
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
            {FlowRateController}
          </Box>
        </Box>
        {doesNetworkSupportFlowScheduler && (
          <>
            <FormControlLabel
              control={StreamSchedulingController}
              label={
                <Stack direction="row" alignItems="center" gap={0.75}>
                  Stream Scheduling
                  <TooltipIcon title="Experimental feature to automatically cancel the stream on specified end date. Only available on Goerli." />
                </Stack>
              }
            />
            <Collapse in={streamScheduling}>
              <Stack spacing={2.5}>
                <Stack
                  sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
                  gap={2.5}
                >
                  <Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mr: 0.75 }}
                      flex={1}
                    >
                      <FormLabel>Start Date</FormLabel>
                      <TooltipIcon title="The date when stream scheduler tries to start the stream." />
                    </Stack>
                    {StartDateController}
                  </Stack>
                  <Stack>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mr: 0.75 }}
                      flex={1}
                    >
                      <FormLabel>End Date</FormLabel>
                      <TooltipIcon title="The date when stream scheduler tries to cancel the stream." />
                    </Stack>
                    {EndDateController}
                  </Stack>
                </Stack>

                <Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mr: 0.75 }}
                    flex={1}
                  >
                    <FormLabel>Total Stream</FormLabel>
                    <TooltipIcon title="The approximate amount that will be streamed until the scheduler cancels the stream." />
                  </Stack>
                  {TotalStreamedController}
                </Stack>
              </Stack>
            </Collapse>
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
                  showFiat
                  data-cy={"balance"}
                  chainId={network.id}
                  accountAddress={visibleAddress}
                  tokenAddress={tokenAddress}
                  symbol={token?.symbol}
                  TypographyProps={{ variant: "h7mono" }}
                  SymbolTypographyProps={{ variant: "h7" }}
                />
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
                      <AddRounded />
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
            newStartDate={startDate}
            oldStartDate={existingStartDate}
            newEndDate={endDate}
            oldEndDate={existingEndDate}
          />
        )}
        {showBufferAlert && BufferAlert}
        <ConnectionBoundary>
          <Stack gap={1}>
            {SendTransactionBoundary}
            {DeleteFlowBoundary}
          </Stack>
        </ConnectionBoundary>
      </Stack>
    </Card>
  );
});
