import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AlertTitle,
  Button,
  DialogContent,
  DialogTitle,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import NextLink from "next/link";
import { FC, useCallback } from "react";
import useAddressName from "../../hooks/useAddressName";
import { getAddress } from "../../utils/memoizedEthersUtils";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { Flag } from "../flags/flags.slice";
import { useHasFlag } from "../flags/flagsHooks";
import { useLayoutContext } from "../layout/LayoutContext";
import { networkDefinition } from "../network/networks";
import TokenChip from "../token/TokenChip";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../transactionBoundary/ConnectionBoundaryButton";
import faucetApi from "./faucetApi.slice";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import Link from "../common/Link";

interface PrefilledAddressInputProps {
  address: Address;
}

const PrefilledAddressInput: FC<PrefilledAddressInputProps> = ({ address }) => {
  const addressName = useAddressName(address);

  return (
    <FormGroup>
      <FormLabel>Connected Wallet Address</FormLabel>
      <TextField
        data-cy={"connected-address"}
        value={addressName.name || addressName.addressChecksummed}
        disabled
      />
    </FormGroup>
  );
};

interface FaucetDialogProps {
  onClose: () => void;
}

const FaucetDialog: FC<FaucetDialogProps> = ({ onClose }) => {
  const { visibleAddress } = useVisibleAddress();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { setTransactionDrawerOpen } = useLayoutContext();
  const [claimTestTokensTrigger, claimTestTokensResponse] =
    faucetApi.useLazyClaimTestTokensQuery();

  const hasClaimedTokens = useHasFlag(
    visibleAddress
      ? {
          type: Flag.TestTokensReceived,
          chainId: networkDefinition.polygonMumbai.id,
          account: getAddress(visibleAddress),
        }
      : undefined
  );

  const claimTokens = useCallback(() => {
    if (visibleAddress) {
      claimTestTokensTrigger({
        chainId: networkDefinition.polygonMumbai.id,
        account: visibleAddress,
      }).then((response) => {
        if (response.isSuccess) setTransactionDrawerOpen(true);
      });
    }
  }, [visibleAddress, claimTestTokensTrigger, setTransactionDrawerOpen]);

  return (
    <ResponsiveDialog
      open
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 520 } }}
    >
      <DialogTitle sx={{ p: 4 }}>
        <Typography data-cy={"faucet-title"} variant="h4">
          Get Testnet Tokens
        </Typography>
        <Typography data-cy={"faucet-message"}>
          This faucet sends you a bunch of tokens to wrap and streams to try out
          Superfluid.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack gap={4}>
          <Stack
            alignItems="center"
            justifyContent="center"
            direction="row"
            gap={0.5}
          >
            <TokenChip
              symbol="MATIC"
              ChipProps={{ size: isBelowMd ? "small" : "medium" }}
              IconProps={{ size: isBelowMd ? 18 : 24 }}
            />
            <TokenChip
              symbol="fUSDC"
              ChipProps={{ size: isBelowMd ? "small" : "medium" }}
              IconProps={{ size: isBelowMd ? 18 : 24 }}
            />
            <TokenChip
              symbol="fDAI"
              ChipProps={{ size: isBelowMd ? "small" : "medium" }}
              IconProps={{ size: isBelowMd ? 18 : 24 }}
            />
          </Stack>

          {visibleAddress && <PrefilledAddressInput address={visibleAddress} />}

          {claimTestTokensResponse.isError && (
            <Alert data-cy="faucet-error" severity="error">
              <AlertTitle>
                {claimTestTokensResponse.error === 405
                  ? "You’ve already claimed tokens from the faucet using this address"
                  : "Something went wrong, please try again"}
              </AlertTitle>
            </Alert>
          )}

          {claimTestTokensResponse.isSuccess && (
            <Alert data-cy="faucet-success" severity="success">
              <AlertTitle>
                Streams opened and testnet tokens successfully sent
              </AlertTitle>
            </Alert>
          )}

          <ConnectionBoundary expectedNetwork={networkDefinition.polygonMumbai}>
            <ConnectionBoundaryButton
              ButtonProps={{
                size: "xl",
                fullWidth: true,
                variant: "contained",
              }}
            >
              <Stack gap={2}>
                {!(
                  (claimTestTokensResponse.isError &&
                    claimTestTokensResponse.error === 405) ||
                  claimTestTokensResponse.isSuccess
                ) && (
                  <LoadingButton
                    data-cy={"claim-button"}
                    size="xl"
                    fullWidth
                    loading={claimTestTokensResponse.isLoading}
                    variant="contained"
                    disabled={hasClaimedTokens}
                    onClick={claimTokens}
                  >
                    {hasClaimedTokens ? "Tokens Claimed" : "Claim"}
                  </LoadingButton>
                )}

                {hasClaimedTokens && claimTestTokensResponse.isSuccess && (
                  <Button
                    data-cy={"open-dashboard-button"}
                    size="xl"
                    fullWidth
                    variant="contained"
                    onClick={onClose}
                  >
                    Open Dashboard! ➜
                  </Button>
                )}

                {hasClaimedTokens && claimTestTokensResponse.isError && (
                  <Button
                    LinkComponent={Link}
                    data-cy={"wrap-button"}
                    size="xl"
                    fullWidth
                    variant="contained"
                    href="/wrap"
                  >
                    Wrap into super tokens! ➜
                  </Button>
                )}
              </Stack>
            </ConnectionBoundaryButton>
          </ConnectionBoundary>
        </Stack>
      </DialogContent>
    </ResponsiveDialog>
  );
};

export default FaucetDialog;
