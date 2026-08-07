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
import { memo, useCallback, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import TooltipWithIcon from "../../common/TooltipWithIcon";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { TokenDialogButton } from "../../tokenWrapping/TokenDialogButton";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../../transactionBoundary/ConnectionBoundaryButton";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import AddressSearch from "../AddressSearch";
import { PartialTransferForm, ValidTransferForm } from "./TransferFormProvider";
import { useTransfer } from "./useTransfer";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { parseUnits } from "ethers/lib/utils";
import { useTokenQuery } from "../../../hooks/useTokenQuery";
import { SendBalance } from "../stream/SendStream";
import { inputPropsForEtherAmount } from "../../../utils/inputPropsForEtherAmount";
import { Address } from "@superfluid-finance/sdk-core";
import {
  RestorationType,
  SendTransferRestoration,
} from "../../transactionRestoration/transactionRestorations";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { Network } from "../../network/networks";
import { isSuper, TokenMinimal } from "../../redux/endpoints/tokenTypes";
import { BalanceUnderlyingToken } from "../../tokenWrapping/BalanceUnderlyingToken";
import { useTransferTokens } from "./useTransferTokens";
import { ClearMacroRelayOption } from "../../clearMacro/ClearMacroRelayOption";

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

  const [receiverAddress, tokenAddress, amountEther] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.amountEther",
  ]);

  const {
    tokens,
    balances,
    isFetching: areTokensFetching,
  } = useTransferTokens({
    network,
    address: visibleAddress,
  });
  const selectedTransferToken = useMemo(
    () =>
      tokens.find(
        ({ address }) => address.toLowerCase() === tokenAddress?.toLowerCase()
      ),
    [tokenAddress, tokens]
  );
  const { data: fallbackToken } = useTokenQuery(
    tokenAddress && !selectedTransferToken
      ? { chainId: network.id, id: tokenAddress }
      : skipToken
  );
  const token = selectedTransferToken ?? fallbackToken;

  const [transfer, transferResult] = useTransfer();

  const isSendDisabled = isValidating || !isValid || !token;

  const SendTransactionBoundary = (
    <TransactionBoundary mutationResult={transferResult}>
      {({ setDialogLoadingInfo, txAnalytics, accountAddress }) => (
        <TransactionButton
          disabled={isSendDisabled}
          dataCy={"transfer-button"}
          onClick={async () => {
            if (isSendDisabled || !token) {
              throw Error(`This should never happen.`);
            }

            setDialogLoadingInfo(
              <Typography
                variant="h5"
                translate="yes"
                sx={{
                  color: "text.secondary",
                }}
              >
                You are sending {amountEther} {token.symbol} to{" "}
                {receiverAddress}.
              </Typography>
            );

            const { data: formData } = getValues() as ValidTransferForm;

            if (!accountAddress) {
              throw Error("Account not connected.");
            }
            const senderAddress = accountAddress as Address;

            const transactionRestoration: SendTransferRestoration = {
              type: RestorationType.SendTransfer,
              chainId: network.id,
              tokenAddress: formData.tokenAddress,
              receiverAddress: formData.receiverAddress,
              amountEther: formData.amountEther,
            };

            const primaryArgs = {
              chainId: network.id,
              tokenAddress: formData.tokenAddress,
              senderAddress,
              receiverAddress: formData.receiverAddress,
              amountWei: parseUnits(
                formData.amountEther,
                token.decimals
              ).toString(),
              isSuperToken: isSuper(token),
            };

            transfer({
              ...primaryArgs,
              transactionExtraData: {
                restoration: transactionRestoration,
              },
            })
              .then(...txAnalytics("Send Transfer", primaryArgs))
              .then(() => resetForm())
              .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
          }}
        >
          Send Transfer
        </TransactionButton>
      )}
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
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mr: 0.75,
          }}
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
        <Stack
          sx={{
            justifyContent: "stretch",
          }}
        >
          <FormLabel>Token</FormLabel>
          <TokenController
            network={network}
            token={token}
            tokens={tokens}
            tokenBalances={balances}
            isFetching={areTokensFetching}
          />
        </Stack>
        <Stack
          sx={{
            justifyContent: "stretch",
          }}
        >
          <FormLabel>Amount</FormLabel>
          <AmountController token={token} />
        </Stack>
      </Box>
      <TransferBalance
        network={network}
        visibleAddress={visibleAddress}
        token={token}
      />

      {token && visibleAddress && <Divider />}
      <ConnectionBoundary>
        <ConnectionBoundaryButton
          ButtonProps={{
            fullWidth: true,
            variant: "contained",
            size: "xl",
          }}
        >
          {/* 2.5 matches the form's block rhythm so the relay strip reads as its own block. */}
          <Stack
            sx={{
              gap: 2.5,
            }}
          >
            {SendTransactionBoundary}
            <ClearMacroRelayOption
              actionKind={token && isSuper(token) ? "transfer" : undefined}
              network={network}
            />
          </Stack>
        </ConnectionBoundaryButton>
      </ConnectionBoundary>
    </Stack>
  );
});

// # Controllers
const ReceiverAddressController = memo(
  function ReceiverAddressController(props: { isBelowMd: boolean }) {
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
  }
);

const TokenController = memo(function TokenController(props: {
  network: Network;
  token: TokenMinimal | null | undefined;
  tokens: TokenMinimal[];
  tokenBalances: Record<string, string>;
  isFetching: boolean;
}) {
  const { control } = useFormContext<PartialTransferForm>();

  return (
    <Controller
      control={control}
      name="data.tokenAddress"
      render={({ field: { onChange, onBlur } }) => (
        <TokenDialogButton
          token={props.token}
          network={props.network}
          tokens={props.tokens}
          tokenBalances={props.tokenBalances}
          isTokensFetching={props.isFetching}
          showUpgrade={true}
          onTokenSelect={(x) => onChange(x.address)}
          onBlur={onBlur}
          ButtonProps={{ variant: "input" }}
        />
      )}
    />
  );
});

const AmountController = memo(function AmountController(props: {
  token: TokenMinimal | null | undefined;
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
          slotProps={{
            input: {
              endAdornment: (
                <Typography
                  component="span"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {props.token?.symbol ?? ""}
                </Typography>
              ),
            },

            htmlInput: {
              ...inputPropsForEtherAmount,
            },
          }}
        />
      )}
    />
  );
});
const TransferBalance = memo(function TransferBalance(props: {
  network: Network;
  visibleAddress: string | undefined;
  token: TokenMinimal | null | undefined;
}) {
  if (!props.visibleAddress || !props.token) return null;

  if (isSuper(props.token)) {
    return <SendBalance {...props} token={props.token} />;
  }

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
      }}
    >
      <BalanceUnderlyingToken
        chainId={props.network.id}
        accountAddress={props.visibleAddress}
        tokenAddress={props.token.address}
        decimals={props.token.decimals}
      />
      <Typography variant="h7">{props.token.symbol}</Typography>
    </Stack>
  );
});
