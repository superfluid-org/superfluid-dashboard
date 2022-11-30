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
  Grid,
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
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
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
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
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
import { dateNowSeconds, getTimeInSeconds } from "../../utils/dateUtils";
import { BigNumber, BigNumberish } from "ethers";
import TokenIcon from "../token/TokenIcon";
import Decimal from "decimal.js";
import { getDecimalPlacesToRoundTo } from "../../utils/DecimalUtils";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactionBoundary/TransactionDialog";
import { getTokenPagePath } from "../../pages/token/[_network]/[_token]";
import {
  ModifyStreamRestoration,
  RestorationType,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { add } from "date-fns";
import AddRounded from "@mui/icons-material/AddRounded";

const MIN_VISIBLE_END_DATE = add(new Date(), {
  minutes: 5,
});
const MAX_VISIBLE_END_DATE = new Date(2022, 11, 31, 23, 59);

const getStreamedTotal = ({
  endTimestamp,
  flowRateWei,
}: {
  endTimestamp: number | null;
  flowRateWei: BigNumberish;
}): BigNumber | undefined => {
  const now = dateNowSeconds();
  if (endTimestamp && endTimestamp > now) {
    return BigNumber.from(flowRateWei).mul(endTimestamp - now);
  } else {
    return undefined;
  }
};

const getStreamedTotalEtherRoundedString = (arg: {
  endTimestamp: number | null;
  flowRateWei: BigNumberish;
}): string => {
  const bigNumber = getStreamedTotal(arg);
  if (!bigNumber || bigNumber?.isZero()) {
    return "";
  } else {
    const decimal = new Decimal(formatEther(bigNumber));
    const decimalPlacesToRoundTo = getDecimalPlacesToRoundTo(decimal);
    return decimal.toDP(decimalPlacesToRoundTo).toFixed();
  }
};

const getEndTimestamp = ({
  amountEthers,
  flowRateWei,
}: {
  amountEthers: string; 
  flowRateWei: BigNumberish;
}): number | null => {
  const amountWei = parseEtherOrZero(amountEthers);
  if (amountWei.isZero()) return null;
  return amountWei.div(flowRateWei).add(dateNowSeconds()).toNumber();
};

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
    endTimestamp,
  ] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.flowRate",
    "data.understandLiquidationRisk",
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

  const doesNetworkSupportStreamScheduler =
    !!network.streamSchedulerContractAddress;

  const [streamScheduling, setStreamScheduling] = useState<boolean>(
    !!endTimestamp
  );

  const StreamSchedulingController = (
    <Switch
      checked={streamScheduling}
      onChange={(_event, value) => {
        if (!value) {
          setValue("data.endTimestamp", null);
        }
        setStreamScheduling(value);
      }}
    />
  );

  const { data: existingEndTimestamp } = rpcApi.useScheduledEndDateQuery(
    shouldSearchForActiveFlow && activeFlow
      ? {
          chainId: network.id,
          superTokenAddress: tokenAddress,
          senderAddress: visibleAddress,
          receiverAddress: receiverAddress,
        }
      : skipToken
  );

  const existingEndDate = existingEndTimestamp
    ? new Date(existingEndTimestamp * 1000)
    : null;

  const endDate = useMemo<Date | null>(
    () => (endTimestamp ? new Date(endTimestamp * 1000) : null),
    [endTimestamp]
  );

  const [totalStreamedEther, setTotalStreamedEther] = useState<string>("");

  useEffect(() => {
    if (!endTimestamp) {
      if (existingEndTimestamp) {
        // Hide old schedule orders. It will be automatically deleted.
        if (existingEndTimestamp > dateNowSeconds()) {
          setStreamScheduling(true);
          setValue("data.endTimestamp", existingEndTimestamp);
          if (flowRateEther) {
            setTotalStreamedEther(
              getStreamedTotalEtherRoundedString({
                endTimestamp: existingEndTimestamp,
                flowRateWei: flowRateWei,
              })
            );
          }
        }
      } else {
        setStreamScheduling(false);
        setValue("data.endTimestamp", null);
        setTotalStreamedEther("");
      }
    }
  }, [existingEndTimestamp]);

  useEffect(() => {
    if (endTimestamp && flowRateWei) {
      setTotalStreamedEther(
        getStreamedTotalEtherRoundedString({
          endTimestamp,
          flowRateWei,
        })
      );
    }
  }, [endTimestamp, flowRateWei]);

  const EndDateController = (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        control={control}
        name="data.endTimestamp"
        render={({ field: { onChange, onBlur } }) => (
          <DateTimePicker
            renderInput={(props) => (
              <TextField fullWidth {...props} onBlur={onBlur} />
            )}
            value={endDate}
            minDateTime={MIN_VISIBLE_END_DATE}
            maxDateTime={MAX_VISIBLE_END_DATE}
            ampm={false}
            onChange={(date: Date | null) => {
              const endTimestamp = date ? getTimeInSeconds(date) : null;
              onChange(endTimestamp);
              setTotalStreamedEther(
                getStreamedTotalEtherRoundedString({
                  endTimestamp,
                  flowRateWei,
                })
              );
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
      onChange={(event) => {
        setTotalStreamedEther(event.target.value);
        setValue(
          "data.endTimestamp",
          getEndTimestamp({
            flowRateWei,
            amountEthers: event.target.value,
          })
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

  const bufferAmount = useMemo(() => {
    if (!flowRateEther.amountEther || !flowRateEther.unitOfTime) {
      return undefined;
    }

    return calculateBufferAmount(network, {
      amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
      unitOfTime: flowRateEther.unitOfTime,
    });
  }, [network, flowRateEther]);

  const BufferAlert = (
    <Alert severity="error">
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
              ...(formData.endTimestamp
                ? { endTimestamp: formData.endTimestamp }
                : {}),
            };

            upsertFlow({
              signer,
              flowRateWei,
              chainId: network.id,
              senderAddress: await signer.getAddress(),
              receiverAddress: formData.receiverAddress,
              superTokenAddress: formData.tokenAddress,
              userDataBytes: undefined,
              endTimestamp: endDate
                ? Math.round(endDate.getTime() / 1000)
                : null,
              waitForConfirmation: false,
              overrides: await getTransactionOverrides(network),
              transactionExtraData: {
                restoration: transactionRestoration,
              },
            })
              .unwrap()
              .then(() => resetForm())
              .catch((error) => void error) // Error is already logged and handled in the middleware & UI.

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

  const [flowDeleteTrigger, flowDeleteResult] = rpcApi.useFlowDeleteMutation();
  const DeleteFlowBoundary = (
    <TransactionBoundary mutationResult={flowDeleteResult}>
      {({ setDialogLoadingInfo }) =>
        activeFlow && (
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
                .then(() => resetForm())
                .catch((error) => void error) // Error is already logged and handled in the middleware & UI.
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
        {doesNetworkSupportStreamScheduler && (
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
              <Grid container spacing={1}>
                <Grid item component={FormGroup} xs={6}>
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
                </Grid>
                <Grid item component={FormGroup} xs={6}>
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
                </Grid>
              </Grid>
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
