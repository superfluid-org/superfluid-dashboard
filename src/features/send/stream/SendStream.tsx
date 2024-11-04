import { ErrorMessage } from "@hookform/error-message";
import AddRounded from "@mui/icons-material/AddRounded";
import {
  Alert,
  Box,
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
import { add, fromUnixTime, getUnixTime, sub } from "date-fns";
import Decimal from "decimal.js";
import { BigNumber, BigNumberish } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import NextLink from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  mapCreateTaskToScheduledStream,
  mapStreamScheduling,
} from "../../../hooks/streamSchedulingHooks";
import { getTokenPagePath } from "../../../pages/token/[_network]/[_token]";
import { CreateTask } from "../../../scheduling-subgraph/.graphclient";
import { dateNowSeconds, getTimeInSeconds } from "../../../utils/dateUtils";
import { getDecimalPlacesToRoundTo } from "../../../utils/DecimalUtils";
import {
  calculateBufferAmount,
  getPrettyEtherFlowRate,
  parseEtherOrZero,
} from "../../../utils/tokenUtils";
import Link from "../../common/Link";
import TooltipWithIcon from "../../common/TooltipWithIcon";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { Network, networkDefinition } from "../../network/networks";
import NetworkSwitchLink from "../../network/NetworkSwitchLink";
import { platformApi } from "../../redux/platformApi/platformApi";
import { rpcApi } from "../../redux/store";
import Amount from "../../token/Amount";
import TokenIcon from "../../token/TokenIcon";
import { BalanceSuperToken } from "../../tokenWrapping/BalanceSuperToken";
import { TokenDialogButton } from "../../tokenWrapping/TokenDialogButton";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../../transactionBoundary/ConnectionBoundaryButton";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../../transactionBoundary/TransactionDialog";
import {
  ModifyStreamRestoration,
  RestorationType,
  SendStreamRestoration,
} from "../../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import AddressSearch from "../AddressSearch";
import {
  calculateTotalAmountWei,
  FlowRateInput,
  UnitOfTime,
} from "../FlowRateInput";
import { StreamingPreview } from "./SendStreamPreview";
import {
  PartialStreamingForm,
  ValidStreamingForm,
} from "./StreamingFormProvider";
import { useSuperTokens } from "../../../hooks/useSuperTokens";
import { SuperTokenMinimal, isWrappable } from "../../redux/endpoints/tokenTypes";
import { useTokenQuery } from "../../../hooks/useTokenQuery";
import { useWhitelist } from "../../../hooks/useWhitelist";

// Minimum start and end date difference in seconds.
export const SCHEDULE_START_END_MIN_DIFF_S = 15 * UnitOfTime.Minute;

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
  if (amountWei.isZero() || flowRateWei === "0") return null;

  return amountWei
    .div(flowRateWei)
    .add(startTimestamp || dateNowSeconds())
    .toNumber();
}

export default memo(function SendStream() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const [MIN_DATE, MAX_DATE] = useMemo(
    () => [
      add(new Date(), {
        seconds: SCHEDULE_START_END_MIN_DIFF_S,
      }),
      add(new Date(), {
        years: 2,
      }),
    ],
    []
  );

  const {
    watch,
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
    startTimestamp,
    endTimestamp,
  ] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.flowRate",
    "data.startTimestamp",
    "data.endTimestamp",
  ]);

  const shouldSearchForActiveFlow =
    !!visibleAddress && !!receiverAddress && !!tokenAddress;

  const {
    currentData: activeFlow,
    isFetching: isActiveFlowFetching,
    data: _discard,
  } = rpcApi.useGetActiveFlowQuery(
    shouldSearchForActiveFlow
      ? {
        chainId: network.id,
        tokenAddress: tokenAddress,
        senderAddress: visibleAddress,
        receiverAddress: receiverAddress,
      }
      : skipToken
  );

  const { data: superToken } = useTokenQuery(tokenAddress ? { chainId: network.id, id: tokenAddress, onlySuperToken: true } : skipToken);

  const flowRateWei = useMemo<BigNumber>(
    () =>
      calculateTotalAmountWei({
        amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
        unitOfTime: flowRateEther.unitOfTime,
      }),
    [flowRateEther.amountEther, flowRateEther.unitOfTime]
  );

  const [streamScheduling, setStreamScheduling] = useState<boolean>(
    !!endTimestamp || !!startTimestamp
  );

  const {
    isFlowScheduleFetching,
    existingStartTimestamp,
    existingEndTimestamp,
    existingFlowRate,
    scheduledStream,
  } = rpcApi.useGetFlowScheduleQuery(
    shouldSearchForActiveFlow && network.flowSchedulerContractAddress
      ? {
        chainId: network.id,
        receiverAddress: receiverAddress,
        senderAddress: visibleAddress,
        superTokenAddress: tokenAddress,
      }
      : skipToken,
    {
      selectFromResult: (result) => {
        const { startDate, endDate, flowRate } = result.data || {};
        return {
          isFlowScheduleFetching: result.isFetching,
          existingStartTimestamp: startDate || null,
          existingEndTimestamp: endDate || null,
          existingFlowRate: flowRate,
          scheduledStream: startDate
            ? mapStreamScheduling(
              mapCreateTaskToScheduledStream({
                id: `${visibleAddress}-${receiverAddress}-${tokenAddress}-scheduled-stream`,
                executionAt: startDate.toString(),
                flowRate: flowRate,
                receiver: receiverAddress,
                sender: visibleAddress,
                superToken: tokenAddress,
              } as CreateTask),
              startDate,
              endDate
            )
            : undefined,
        };
      },
    }
  );

  const existingEndDate = existingEndTimestamp
    ? fromUnixTime(existingEndTimestamp)
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
    if (existingStartTimestamp || existingEndTimestamp) {
      setStreamScheduling(true);

      if (existingStartTimestamp && existingStartTimestamp > dateNowSeconds()) {
        setValue("data.startTimestamp", existingStartTimestamp);
      }

      if (existingEndTimestamp && existingEndTimestamp > dateNowSeconds()) {
        setValue("data.endTimestamp", existingEndTimestamp);
      }
    }

    const hasScheduledFlowRate = existingFlowRate && existingFlowRate !== "0";
    const hasActiveFlowRate =
      activeFlow?.flowRateWei && activeFlow?.flowRateWei !== "0";

    if (hasScheduledFlowRate || hasActiveFlowRate) {
      // We will only set the flow rate to existing one if user has not touched it yet
      const newFlowRate =
        flowRateEther.amountEther === ""
          ? hasScheduledFlowRate
            ? existingFlowRate
            : activeFlow?.flowRateWei
          : undefined;

      if (newFlowRate) {
        setValue("data.flowRate", getPrettyEtherFlowRate(newFlowRate));
      }

      if (existingEndTimestamp && newFlowRate && newFlowRate) {
        setTotalStreamedEther(
          getStreamedTotalEtherRoundedString(
            existingStartTimestamp || startTimestamp,
            existingEndTimestamp || endTimestamp,
            newFlowRate
          )
        );
      }
    }
    // Only updating stuff when schedule data loads in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingStartTimestamp, existingEndTimestamp, existingFlowRate, activeFlow]);

  useEffect(() => {
    if (endTimestamp && flowRateWei) {
      setTotalStreamedEther(
        getStreamedTotalEtherRoundedString(
          startTimestamp,
          endTimestamp,
          flowRateWei
        )
      );
    } else if (!endTimestamp) {
      setTotalStreamedEther("");
    }
  }, [startTimestamp, endTimestamp, flowRateWei]);

  const { startDateMax, endDateMin } = useMemo(() => {
    return {
      startDateMax: endDate
        ? sub(endDate, { seconds: SCHEDULE_START_END_MIN_DIFF_S })
        : MAX_DATE,
      endDateMin: startDate
        ? add(startDate, { seconds: SCHEDULE_START_END_MIN_DIFF_S })
        : MIN_DATE,
    };
  }, [startDate, endDate, MIN_DATE, MAX_DATE]);

  const TotalStreamedController = (
    <TextField
      data-cy={"total-stream"}
      value={totalStreamedEther}
      autoComplete="off"
      onChange={(event) => {
        const newValue = event.target.value;

        if (flowRateWei.gt(BigNumber.from(0))) {
          if (newValue && isFinite(Number(newValue))) {
            const newMaxEndTimestamp = getEndTimestamp(
              startTimestamp,
              newValue,
              flowRateWei
            );
            if (newMaxEndTimestamp) {
              const maxDateUnix = getUnixTime(MAX_DATE);

              if (newMaxEndTimestamp >= maxDateUnix) {
                // Setting total streamed and end date to maximum allowed.
                setTotalStreamedEther(
                  getStreamedTotalEtherRoundedString(
                    startTimestamp || getUnixTime(new Date()),
                    maxDateUnix,
                    flowRateWei
                  )
                );
                setValue("data.endTimestamp", maxDateUnix);
                return;
              }

              setValue("data.endTimestamp", newMaxEndTimestamp);
            }
          } else {
            setValue("data.endTimestamp", null);
          }
        }

        setTotalStreamedEther(newValue);
      }}
      InputProps={{
        startAdornment: <>≈&nbsp;</>,
        endAdornment: (
          <Stack direction="row" gap={0.75} sx={{ ml: 0.5 }}>
            <TokenIcon isSuper size={24} chainId={network.id} tokenAddress={superToken?.address} />
            <Typography variant="h6" component="span">
              {superToken?.symbol ?? ""}
            </Typography>
          </Stack>
        ),
      }}
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
      calculateTotalAmountWei(flowRateEther).toString(),
      tokenBufferQuery.data
    );
  }, [network, flowRateEther, tokenBufferQuery.data]);

  const hasAnythingChanged =
    existingEndTimestamp !== endTimestamp ||
    existingStartTimestamp !== startTimestamp ||
    (activeFlow && activeFlow.flowRateWei !== flowRateWei.toString()) ||
    (scheduledStream &&
      scheduledStream.currentFlowRate !== flowRateWei.toString()) ||
    (!activeFlow && !scheduledStream && flowRateEther.amountEther !== "");

  // These shenanigans are because of react-hook-form's issue ()
  const [isSendDisabled, setIsSendDisabled] = useState(true);
  useEffect(() => {
    setIsSendDisabled(
      formState.isValidating ||
      !formState.isValid ||
      !hasAnythingChanged ||
      isFlowScheduleFetching ||
      isActiveFlowFetching
    );
  }, [formState.isValid, formState.isValidating, hasAnythingChanged, isFlowScheduleFetching, isActiveFlowFetching]);

  const [upsertFlow, upsertFlowResult] =
    rpcApi.useUpsertFlowWithSchedulingMutation();

  const SendTransactionBoundary = (
    <TransactionBoundary mutationResult={upsertFlowResult}>
      {({ closeDialog, setDialogSuccessActions, setDialogLoadingInfo, getOverrides, txAnalytics }) => (
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
              type:
                activeFlow || scheduledStream
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
              overrides: await getOverrides(),
            })
              .unwrap()
              .then(
                ...txAnalytics(
                  activeFlow || scheduledStream
                    ? "Send Stream"
                    : "Modify Stream",
                  primaryArgs
                )
              )
              .then(() => void resetForm())
              .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.

            setDialogLoadingInfo(
              <Typography variant="h5" color="text.secondary" translate="yes">
                You are{" "}
                {activeFlow || scheduledStream ? "modifying" : "sending"} a{" "}
                {startTimestamp || endTimestamp ? "scheduled" : ""} stream.
              </Typography>
            );

            if (activeFlow || scheduledStream) {
              setDialogSuccessActions(
                <TransactionDialogActions>
                  <NextLink
                    href={getTokenPagePath({
                      network: network.slugName,
                      token: formData.tokenAddress,
                    })}
                    passHref
                    legacyBehavior
                  >
                    <TransactionDialogButton
                      data-cy={"go-to-token-page-button"}
                      color="primary"
                    >
                      Go to token page ➜
                    </TransactionDialogButton>
                  </NextLink>
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
                    <NextLink
                      href={getTokenPagePath({
                        network: network.slugName,
                        token: formData.tokenAddress,
                      })}
                      passHref
                      legacyBehavior
                    >
                      <TransactionDialogButton
                        data-cy="go-to-token-page-button"
                        color="primary"
                      >
                        Go to token page ➜
                      </TransactionDialogButton>
                    </NextLink>
                  </Stack>
                </TransactionDialogActions>
              );
            }
          }}
        >
          {activeFlow || scheduledStream ? "Modify Stream" : "Send Stream"}
        </TransactionButton>
      )}
    </TransactionBoundary>
  );

  const [flowDeleteTrigger, flowDeleteResult] =
    rpcApi.useDeleteFlowWithSchedulingMutation();

  const DeleteFlowBoundary = (
    <TransactionBoundary mutationResult={flowDeleteResult}>
      {({ setDialogLoadingInfo, txAnalytics, getOverrides }) =>
        (activeFlow || scheduledStream) && (
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
                overrides: await getOverrides(),
              })
                .unwrap()
                .then(...txAnalytics("Cancel Stream", primaryArgs))
                .then(() => resetForm())
                .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
            }}
          >
            Cancel Stream
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );

  const existingScheduledFlowRate = useMemo(() => {
    if (activeFlow) {
      return {
        flowRate: activeFlow.flowRateWei,
      };
    }

    if (scheduledStream) {
      return {
        flowRate: scheduledStream.currentFlowRate,
        startTimestamp: scheduledStream.startDateScheduled
          ? getUnixTime(scheduledStream.startDateScheduled)
          : undefined,
      };
    }

    return null;
  }, [activeFlow, scheduledStream]);

  const { isPlatformWhitelisted, isWhitelistLoading } = useWhitelist({ accountAddress: visibleAddress, network });

  // TODO: Remove when The Platform is deployed to Base.
  const doesNetworkSupportScheduling = !!network.flowSchedulerContractAddress || network.id === networkDefinition.base.id;

  return (
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
          <TooltipWithIcon title="Must not be an exchange address" />
        </Stack>
        <ReceiverAddressController isBelowMd={isBelowMd} />
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
          <TokenController network={network} superToken={superToken} />
        </Stack>
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mr: 0.75 }}
          >
            <FormLabel>Flow Rate</FormLabel>
            <TooltipWithIcon title="Flow rate is the velocity of tokens being streamed." />
          </Stack>
          <FlowRateController />
        </Box>
      </Box>
      {doesNetworkSupportScheduling && (
        <>
          <FormControlLabel
            data-cy={"scheduling-tooltip"}
            control={<StreamSchedulingController streamScheduling={streamScheduling} setStreamScheduling={setStreamScheduling} />}
            label={
              <Stack direction="row" alignItems="center" gap={0.75}>
                Stream Scheduling
                <TooltipWithIcon title="Schedule start and end dates for future or fixed-duration streams" />
              </Stack>
            }
          />
          <Collapse
            data-cy={"scheduling-collapse"}
            in={streamScheduling}
            mountOnEnter
            unmountOnExit
            sx={{ mx: -0.5, marginTop: "0 !important", overflow: "hidden" }}
          >
            <Stack gap={2.5} sx={{ position: "relative", p: 0.5, pt: 3 }}>
              <Stack
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  ...(!isPlatformWhitelisted ? { opacity: 0.5 } : {}),
                }}
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
                    <TooltipWithIcon title="The date when stream scheduler tries to start the stream." />
                  </Stack>
                  <StartDateController disabled={!!activeFlow} MIN_DATE={MIN_DATE} startDate={startDate} startDateMax={startDateMax} />
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
                    <TooltipWithIcon title="The date when stream scheduler tries to cancel the stream." />
                  </Stack>
                  <EndDateController MAX_DATE={MAX_DATE} endDateMin={endDateMin} endDate={endDate} />
                </Stack>
              </Stack>

              <Stack
                sx={{
                  ...(!isPlatformWhitelisted ? { opacity: 0.5 } : {}),
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mr: 0.75 }}
                  flex={1}
                >
                  <FormLabel>Total Stream</FormLabel>
                  <TooltipWithIcon title="The approximate amount that will be streamed until the scheduler cancels the stream." />
                </Stack>
                {TotalStreamedController}
              </Stack>

              {!isPlatformWhitelisted && <WhitelistTransparentBox />}
            </Stack>
          </Collapse>
        </>
      )}

      <SendBalance network={network} visibleAddress={visibleAddress} token={superToken} />

      {(superToken && visibleAddress) && <Divider />}

      {!!(receiverAddress && superToken) && (
        <StreamingPreview
          receiver={receiverAddress}
          token={superToken}
          existingFlowRate={existingScheduledFlowRate}
          flowRateEther={{
            ...flowRateEther,
            startTimestamp: startTimestamp ?? undefined,
          }}
          newEndDate={endDate}
          oldEndDate={existingEndDate}
        />
      )}

      {showBufferAlert && <BufferAlert bufferAmount={bufferAmount} superToken={superToken} />}

      <ConnectionBoundary>
        <ConnectionBoundaryButton
          ButtonProps={{
            fullWidth: true,
            variant: "contained",
            size: "xl",
          }}
        >
          <Stack gap={1}>
            {SendTransactionBoundary}
            {DeleteFlowBoundary}
          </Stack>
        </ConnectionBoundaryButton>
      </ConnectionBoundary>
    </Stack>
  );
});

// # Sub-components

const WhitelistTransparentBox = memo(function WhitelistTransparentBox() {
  return (
    <Stack
      sx={{
        position: "absolute",
        width: "calc(100% + 10px)",
        height: "calc(100% + 10px)",
        marginTop: "-5px",
        marginLeft: "-5px",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(5px)",
        backfaceVisibility: "hidden",
      }}
    >
      <Box sx={{ px: 4, pb: 3, textAlign: "center" }}>
        <Typography data-cy="allowlist-message" variant="h5">
          You are not on the allow list.
        </Typography>
        <Typography
          data-cy="allowlist-message"
          sx={{ maxWidth: "410px" }}
          variant="body1"
        >
          If you want to set start and end dates for your streams,{" "}
          <Link
            data-cy={"allowlist-link"}
            href="https://use.superfluid.finance/schedulestreams"
            target="_blank"
          >
            Apply for access
          </Link>{" "}
          or try it out on{" "}
          <NetworkSwitchLink
            title={networkDefinition.optimismSepolia.name}
            network={networkDefinition.optimismSepolia}
          />
          .
        </Typography>
      </Box>
    </Stack>
  );
});

export const SendBalance = memo(function SendBalance(props: {
  network: Network;
  visibleAddress: string | undefined;
  token: SuperTokenMinimal | undefined | null
}) {
  if (!props.visibleAddress || !props.token) {
    return null;
  }

  const isWrappableSuperToken = props.token ? isWrappable(props.token) : false;

  return (
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
          chainId={props.network.id}
          accountAddress={props.visibleAddress}
          tokenAddress={props.token.address}
          symbol={props.token.symbol}
          TypographyProps={{ variant: "h7mono" }}
          SymbolTypographyProps={{ variant: "h7" }}
        />
      </Stack>
      {isWrappableSuperToken && (
        <Tooltip title="Wrap more">
          <IconButton
            LinkComponent={Link}
            href={`/wrap?upgrade&token=${props.token.address}&network=${props.network.slugName}`}
            data-cy={"balance-wrap-button"}
            color="primary"
            size="small"
          >
            <AddRounded />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
});

const BufferAlert = memo(function BufferAlert(
  props: { bufferAmount: BigNumber | undefined, superToken: SuperTokenMinimal | undefined | null }
) {
  return (
    <Alert data-cy="buffer-warning" severity="error">
      If you do not cancel this stream before your balance reaches zero,{" "}
      <b>
        you will lose your{" "}
        {props.bufferAmount && props.superToken ? (
          <span translate="no">
            <Amount wei={props.bufferAmount.toString()}> {props.superToken.symbol}</Amount>
          </span>
        ) : null}{" "}
        buffer.
      </b>
      <FormGroup><UnderstandLiquidationRiskController /></FormGroup>
    </Alert>
  );
});

// ## Controllers
const ReceiverAddressController = memo(function ReceiverAddressController(
  props: { isBelowMd: boolean }
) {
  const { control, watch } = useFormContext<PartialStreamingForm>();
  const receiverAddress = watch("data.receiverAddress");
  return (
    <Controller
      control={control}
      name="data.receiverAddress"
      render={({ field: { onChange, onBlur } }) => (
        <AddressSearch
          address={receiverAddress}
          onChange={onChange}
          onBlur={onBlur}
          addressLength={props.isBelowMd ? "medium" : "long"}
          ButtonProps={{ fullWidth: true }}
        />
      )}
    />
  );
});

const UnderstandLiquidationRiskController = memo(function UnderstandLiquidationRiskController() {
  const { control } = useFormContext<PartialStreamingForm>();
  return (
    <Controller
      control={control}
      name="data.understandLiquidationRisk"
      render={({ field: { onChange, onBlur, value } }) => (
        <FormControlLabel
          control={
            <Checkbox
              data-cy={"risk-checkbox"}
              checked={value}
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
});

const TokenController = memo(function TokenController(props: { network: Network, superToken: SuperTokenMinimal | null | undefined }) {
  const { control } = useFormContext<PartialStreamingForm>();
  const { superTokens, isFetching } = useSuperTokens({ network: props.network });

  return (
    <Controller
      control={control}
      name="data.tokenAddress"
      render={({ field: { onChange, onBlur } }) => (
        <TokenDialogButton
          token={props.superToken}
          network={props.network}
          tokens={superTokens}
          isTokensFetching={isFetching}
          showUpgrade={true}
          onTokenSelect={(x) => onChange(x.address)}
          onBlur={onBlur}
          ButtonProps={{ variant: "input" }}
        />
      )}
    />
  );
});

const FlowRateController = memo(function FlowRateController() {
  const { control, watch } = useFormContext<PartialStreamingForm>();
  const [
    flowRateEther
  ] = watch([
    "data.flowRate"
  ]);

  return (
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
  )
});

const StreamSchedulingController = memo(function StreamSchedulingController(
  props: { streamScheduling: boolean, setStreamScheduling: (value: boolean) => void }
) {
  const { setValue } = useFormContext<PartialStreamingForm>();

  return (
    <Switch
      checked={props.streamScheduling}
      onChange={(_event, value) => {
        if (!value) {
          setValue("data.startTimestamp", null);
          setValue("data.endTimestamp", null);
        }
        props.setStreamScheduling(value);
      }}
    />
  );
});

const StartDateController = memo(function StartDateController(
  props: {
    disabled: boolean,
    MIN_DATE: Date,
    startDateMax: Date,
    startDate: Date | null,
  }
) {
  const { control } = useFormContext<PartialStreamingForm>();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        control={control}
        name="data.startTimestamp"
        render={({ field: { onChange, onBlur } }) => (
          <DateTimePicker
            renderInput={(props) => (
              <TextField
                data-cy={"start-date"}
                fullWidth
                autoComplete="off"
                {...props}
                onBlur={onBlur}
              />
            )}
            value={props.startDate}
            minDateTime={props.MIN_DATE}
            maxDateTime={props.startDateMax}
            ampm={false}
            onChange={(date: Date | null) =>
              onChange(date ? getUnixTime(date) : null)
            }
            disablePast
            disabled={props.disabled}
          />
        )}
      />
    </LocalizationProvider>
  );
});

const EndDateController = memo(function EndDateController(
  props: {
    MAX_DATE: Date,
    endDateMin: Date,
    endDate: Date | null,
  }
) {
  const { control } = useFormContext<PartialStreamingForm>();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Controller
      control={control}
      name="data.endTimestamp"
      render={({ field: { onChange, onBlur } }) => (
        <DateTimePicker
          renderInput={(props) => (
            <TextField
              data-cy={"end-date"}
              fullWidth
              autoComplete="off"
              {...props}
              onBlur={onBlur}
            />
          )}
          value={props.endDate}
          minDateTime={props.endDateMin}
          maxDateTime={props.MAX_DATE}
          ampm={false}
          onChange={(date: Date | null) => {
            const endTimestamp = date ? getTimeInSeconds(date) : null;
            onChange(endTimestamp);
          }}
          disablePast
        />
      )}
    />
  </LocalizationProvider>
  )
})