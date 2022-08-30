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
  FormLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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

export default memo(function SendCard() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  return (
    <Card
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
        color="primary"
        variant="textContained"
        size="large"
        sx={{ alignSelf: "flex-start", pointerEvents: "none", mb: 4 }}
      >
        Bridge
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
      </Stack>
    </Card>
  );
});
