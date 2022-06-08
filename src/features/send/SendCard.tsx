import { ErrorMessage } from "@hookform/error-message";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {
  Alert,
  AlertTitle,
  Box,
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
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber, ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, memo, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import TooltipIcon from "../common/TooltipIcon";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { isWrappable } from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import { BalanceSuperToken } from "../tokenWrapping/BalanceSuperToken";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import { RestorationType } from "../transactionRestoration/transactionRestorations";
import { TransactionButton } from "../transactions/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactions/TransactionDialog";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AddressSearch from "./AddressSearch";
import { calculateTotalAmountWei, FlowRateInput } from "./FlowRateInput";
import { StreamingPreview } from "./SendStreamPreview";
import { StreamingForm } from "./StreamingFormProvider";

interface FormLabelProps {
  children?: React.ReactNode;
}

const FormLabel: FC<FormLabelProps> = ({ children }) => (
  <Typography variant="h6" sx={{ ml: 1.25, mb: 0.75 }}>
    {children}
  </Typography>
);

export default memo(function SendCard() {
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();
  const { setTransactionDrawerOpen } = useTransactionDrawerContext();
  const router = useRouter();

  const {
    watch,
    control,
    setValue,
    formState,
    reset: resetForm,
  } = useFormContext<StreamingForm>();
  const doesFormHaveErrors = !!Object.keys(formState.errors).length;

  const [receiver, selectedToken, flowRate, understandLiquidationRisk] = watch([
    "root.receiver",
    "root.token",
    "root.flowRate",
    "root.understandLiquidationRisk",
  ]);

  const isWrappableSuperToken = selectedToken
    ? isWrappable(selectedToken)
    : false;

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

  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();
  const [flowUpdateTrigger, flowUpdateResult] = rpcApi.useFlowUpdateMutation();

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
    [superTokensQuery.data]
  );

  const shouldSearchForExistingStreams =
    !!visibleAddress && !!receiver && !!selectedToken;

  const { data: existingFlow } = rpcApi.useGetActiveFlowQuery(
    shouldSearchForExistingStreams
      ? {
          chainId: network.id,
          tokenAddress: selectedToken.address,
          senderAddress: visibleAddress,
          receiverAddress: receiver.hash,
        }
      : skipToken
  );

  const hasAllDataForStream =
    receiver &&
    selectedToken &&
    flowRate &&
    !BigNumber.from(flowRate.amountWei).isZero();

  const isSendDisabled = !hasAllDataForStream || !formState.isValid || doesFormHaveErrors;

  return (
    <Card
      sx={{
        maxWidth: "600px",
        p: 4,
      }}
      elevation={1}
    >
      <Stack spacing={4}>
        <Typography variant="h4" component="h1">
          {existingFlow ? "Modify Stream" : "Send Stream"}
        </Typography>

        {doesFormHaveErrors && (
          <ErrorMessage
            as={<Alert severity="error"></Alert>}
            name="root.flowRate"
            render={({ messages }) => {
              return (
                messages &&
                Object.entries(messages).map(([type, message]) => (
                  <p key={type}>{message}</p>
                ))
              );
            }}
          />
        )}

        <Stack spacing={2.5}>
          <Box>
            <FormLabel>Receiver Wallet Address</FormLabel>
            <Controller
              control={control}
              name="root.receiver"
              render={({ field: { onChange, onBlur } }) => (
                <AddressSearch
                  address={receiver}
                  onChange={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </Box>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2.5 }}
          >
            <Stack justifyContent="stretch">
              <FormLabel>Super Token</FormLabel>

              <Controller
                control={control}
                name="root.token"
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
                name="root.flowRate"
                render={({ field: { onChange, onBlur } }) => (
                  <FlowRateInput
                    flowRateWithTime={flowRate}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </Box>
          </Box>

          {/* <Box
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
                <TooltipIcon title="If the end date is not specified, stream will run indefinitely or until you run out of tokens." />
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
          </Box> */}

          <Alert severity="warning">
            <AlertTitle>Protect your buffer!</AlertTitle>
            <Typography variant="body2">
              If you do not cancel the stream before your balance reaches zero,
              you will lose your buffer.
            </Typography>
            <FormGroup>
              <Controller
                control={control}
                name="root.understandLiquidationRisk"
                render={({ field: { onChange, onBlur } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={understandLiquidationRisk}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I understand the risk.
                      </Typography>
                    }
                  />
                )}
              />
            </FormGroup>
          </Alert>

          {selectedToken && visibleAddress && (
            <Stack direction="row" alignItems="center" justifyContent="center">
              <BalanceSuperToken
                chainId={network.id}
                accountAddress={visibleAddress}
                tokenAddress={selectedToken.address}
              />

              {isWrappableSuperToken && (
                <Link
                  href={`/wrap?upgrade&token=${selectedToken.address}&network=${network.slugName}`}
                  passHref
                >
                  <Tooltip title="Wrap">
                    <IconButton color="inherit">
                      <AddCircleOutline />
                    </IconButton>
                  </Tooltip>
                </Link>
              )}
            </Stack>
          )}
        </Stack>

        <Stack gap={2.5}>
          {hasAllDataForStream && (
            <>
              <Divider />
              <StreamingPreview
                receiver={receiver}
                token={selectedToken}
                flowRateWithTime={flowRate}
                existingStream={existingFlow ?? null}
              />
            </>
          )}

          {!existingFlow ? (
            <TransactionButton
              hidden={false}
              disabled={isSendDisabled}
              mutationResult={flowCreateResult}
              onClick={(setTransactionDialogContent) => {
                if (isSendDisabled) {
                  throw Error("This should never happen.");
                }

                flowCreateTrigger({
                  chainId: network.id,
                  flowRateWei: calculateTotalAmountWei(flowRate).toString(),
                  receiverAddress: receiver.hash,
                  superTokenAddress: selectedToken.address,
                  userDataBytes: undefined,
                  waitForConfirmation: false,
                  transactionExtraData: {
                    restoration: {
                      type: RestorationType.SendStream,
                      chainId: network.id,
                      token: selectedToken,
                      receiver: receiver,
                      flowRate: flowRate,
                    },
                  },
                })
                  .unwrap()
                  .then(() => resetForm());

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
          ) : (
            <TransactionButton
              hidden={false}
              disabled={isSendDisabled}
              mutationResult={flowUpdateResult}
              onClick={(setTransactionDialogContent) => {
                if (isSendDisabled) {
                  throw Error("This should never happen.");
                }

                flowUpdateTrigger({
                  chainId: network.id,
                  flowRateWei: calculateTotalAmountWei(flowRate).toString(),
                  receiverAddress: receiver.hash,
                  superTokenAddress: selectedToken.address,
                  userDataBytes: undefined,
                  waitForConfirmation: false,
                  transactionExtraData: {
                    restoration: {
                      type: RestorationType.ModifyStream,
                      chainId: network.id,
                      token: selectedToken,
                      receiver: receiver,
                      flowRate: flowRate,
                    },
                  },
                })
                  .unwrap()
                  .then(() => resetForm());

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
              Modify
            </TransactionButton>
          )}
        </Stack>
      </Stack>
    </Card>
  );
});
