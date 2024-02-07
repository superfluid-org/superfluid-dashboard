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
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Token } from "@superfluid-finance/sdk-core";
import { memo, useCallback, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { useAnalytics } from "../analytics/useAnalytics";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { isWrappable, SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import { TokenDialogButton } from "../tokenWrapping/TokenDialogButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../transactionBoundary/ConnectionBoundaryButton";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AddressSearch from "./AddressSearch";
import { PartialTransferForm } from "./TransferFormProvider";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";

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

  const shouldSearchForActiveFlow =
    !!visibleAddress && !!receiverAddress && !!tokenAddress;

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

  const [upsertFlow, upsertFlowResult] =
    rpcApi.useUpsertFlowWithSchedulingMutation();

  const SendTransactionBoundary = (
    <TransactionBoundary mutationResult={upsertFlowResult}>
      {({ setDialogLoadingInfo }) =>
      (<TransactionButton
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

          // upsertFlow({
          //   ...primaryArgs,
          //   signer,
          //   overrides: await getTransactionOverrides(network),
          // })
          //   .unwrap()
          //   .then(...txAnalytics("Send Transfer", primaryArgs))
          //   .then(() => resetForm())
          //   .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
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
          <TextField value={""} />
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
