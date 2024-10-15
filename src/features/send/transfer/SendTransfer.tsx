import { ErrorMessage } from "@hookform/error-message";
import {
  Alert,
  Box,
  Divider,
  FormLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { memo, useCallback, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import TooltipWithIcon from "../../common/TooltipWithIcon";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { rpcApi } from "../../redux/store";
import { TokenDialogButton } from "../../tokenWrapping/TokenDialogButton";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../../transactionBoundary/ConnectionBoundaryButton";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import AddressSearch from "../AddressSearch";
import { PartialTransferForm, ValidTransferForm } from "./TransferFormProvider";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { useSuperTokens } from "../../../hooks/useSuperTokens";
import { useTokenQuery } from "../../../hooks/useTokenQuery";
import { SendBalance } from "../stream/SendStream";
import { inputPropsForEtherAmount } from "../../../utils/inputPropsForEtherAmount";
import { Address } from "@superfluid-finance/sdk-core";
import { RestorationType, SendTransferRestoration } from "../../transactionRestoration/transactionRestorations";
import { skipToken } from "@reduxjs/toolkit/dist/query/react";
import { Network } from "../../network/networks";
import { TokenMinimal } from "../../redux/endpoints/tokenTypes";

export default memo(function SendTransfer() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const {
    watch,
    formState: { isValid, isValidating, errors },
    getValues,
    reset: resetFormData,
  } = useFormContext<PartialTransferForm>();

  const resetForm = useCallback(() => {
    resetFormData();
  }, [resetFormData]);

  const [
    receiverAddress,
    tokenAddress,
    amountEther
  ] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.amountEther",
  ]);

  const { data: superToken } = useTokenQuery(tokenAddress ? { chainId: network.id, id: tokenAddress, onlySuperToken: true } : skipToken);

  const [transfer, transferResult] =
    rpcApi.useTransferMutation();

  const [isSendDisabled, setIsSendDisabled] = useState(true);
  useEffect(() => {
    setIsSendDisabled(
      isValidating ||
      !isValid
    );
  }, [isValid, isValidating]);

  const SendTransactionBoundary = (
    <TransactionBoundary mutationResult={transferResult}>
      {({ setDialogLoadingInfo, getOverrides, txAnalytics }) =>
      (<TransactionButton
        disabled={isSendDisabled}
        dataCy={"transfer-button"}
        onClick={async (signer) => {
          if (isSendDisabled) {
            throw Error(
              `This should never happen.`);
          }

          setDialogLoadingInfo(
            <Typography variant="h5" color="text.secondary" translate="yes">
              You are sending {amountEther} {superToken?.symbol} to {receiverAddress}.
            </Typography>
          );

          const { data: formData } = getValues() as ValidTransferForm;

          const senderAddress = await signer.getAddress() as Address

          const transactionRestoration: SendTransferRestoration = {
            type: RestorationType.SendTransfer,
            chainId: network.id,
            tokenAddress: formData.tokenAddress,
            receiverAddress: formData.receiverAddress,
            amountEther: formData.amountEther
          };

          const primaryArgs = {
            chainId: network.id,
            tokenAddress: formData.tokenAddress,
            senderAddress,
            receiverAddress: formData.receiverAddress,
            amountWei: parseEtherOrZero(formData.amountEther).toString()
          };

          transfer({
            ...primaryArgs,
            signer,
            overrides: await getOverrides(),
            transactionExtraData: {
              restoration: transactionRestoration,
            }
          })
            .unwrap()
            .then(...txAnalytics("Send Transfer", primaryArgs))
            .then(() => resetForm())
            .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
        }}
      >
        Send Transfer
      </TransactionButton>)
      }
    </TransactionBoundary>
  );

  return (
    <Stack spacing={2.5}>
      <ErrorMessage
        name="data"
        // ErrorMessage has a bug and current solution is to pass in errors via props.
        // TODO: keep eye on this issue: https://github.com/react-hook-form/error-message/issues/91
        errors={errors}
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
        <Stack justifyContent="stretch">
          <FormLabel>Amount</FormLabel>
          <AmountController superToken={superToken} />
        </Stack>
      </Box>

      <SendBalance network={network} visibleAddress={visibleAddress} token={superToken} />

      {(superToken && visibleAddress) && <Divider />}

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
          </Stack>
        </ConnectionBoundaryButton>
      </ConnectionBoundary>

    </Stack>
  );
});

// # Controllers
const ReceiverAddressController = memo(function ReceiverAddressController(props: {
  isBelowMd: boolean;
}) {
  const { control, watch } = useFormContext<PartialTransferForm>();
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

const TokenController = memo(function TokenController(
  props: { network: Network, superToken: TokenMinimal | null | undefined }
) {
  const { control } = useFormContext<PartialTransferForm>();
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
  )
});

const AmountController = memo(function AmountController(props: {
  superToken: TokenMinimal | null | undefined
}) {
  const { control } = useFormContext<PartialTransferForm>();

  return (
    <Controller
      control={control}
      name="data.amountEther"
      render={({ field: { value, onChange, onBlur } }) => (
        <TextField
          data-cy={"amount-input"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete="off"
          autoCorrect="off"
          placeholder="0.0"
          InputProps={{
            endAdornment: (
              <Typography component="span" color={"text.secondary"}>
                {props.superToken?.symbol ?? ""}
              </Typography>
            ),
          }}
          inputProps={{
            ...inputPropsForEtherAmount,
          }}
        />
      )}
    />
  );
});