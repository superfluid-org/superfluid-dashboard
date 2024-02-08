import { ErrorMessage } from "@hookform/error-message";
import {
  Alert,
  Box,
  FormLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { memo, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { useAnalytics } from "../analytics/useAnalytics";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../transactionBoundary/ConnectionBoundaryButton";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AddressSearch from "./AddressSearch";
import { PartialTransferForm } from "./TransferFormProvider";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { useSuperTokens } from "../../hooks/useSuperTokens";
import { useSuperToken } from "../../hooks/useSuperToken";

export default memo(function SendTransfer() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();
  const getTransactionOverrides = useGetTransactionOverrides();
  const { txAnalytics } = useAnalytics();

  const {
    watch,
    control,
    formState,
    getValues,
    setValue,
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

  const { token } = useSuperToken({ network, tokenAddress });
  const { listedSuperTokensQuery, customSuperTokensQuery, superTokens } = useSuperTokens({ network });

  const TokenController = (
    <Controller
      control={control}
      name="data.tokenAddress"
      render={({ field: { onChange, onBlur } }) => (
        <TokenDialogButton
          token={token}
          network={network}
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
  )

  const AmountController = (
    <Controller
      control={control}
      name="data.amountEther"
      render={({ field: { value, onChange, onBlur } }) => (
        <TextField
          data-cy={"amount-input"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          InputProps={{
            endAdornment: (
              <Typography component="span" color={"text.secondary"}>
                {token?.symbol ?? ""}
              </Typography>
            ),
          }}
        />
      )}
    />
  );

  const [transfer, transferResult] =
    rpcApi.useTransferMutation();

  const SendTransactionBoundary = (
    <TransactionBoundary mutationResult={transferResult}>
      {({ setDialogLoadingInfo }) =>
      (<TransactionButton
        dataCy={"transfer-button"}
        onClick={async (signer) => {
          const superTokenAddress = tokenAddress;
          const senderAddress = visibleAddress;
          if (!receiverAddress || !superTokenAddress || !senderAddress) {
            throw Error("This should never happen.");
          }

          setDialogLoadingInfo(
            <Typography variant="h5" color="text.secondary" translate="yes">
              You are sending tokens.
            </Typography>
          );

          // TODO

          const primaryArgs = {
            chainId: network.id,
            tokenAddress,
            senderAddress,
            receiverAddress,
            amountWei: parseEtherOrZero(amountEther).toString()
          };

          transfer({
            ...primaryArgs,
            signer,
            overrides: await getTransactionOverrides(network),
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
        <Stack justifyContent="stretch">
          <FormLabel>Amount</FormLabel>
          {AmountController}
        </Stack>
      </Box>

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
