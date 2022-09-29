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
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Link from "next/link";
import { FC, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import useAddressName from "../../hooks/useAddressName";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { Flag } from "../flags/accountFlags.slice";
import { useAccountHasChainFlag } from "../flags/accountFlagsHooks";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { networkDefinition } from "../network/networks";
import TokenChip from "../token/TokenChip";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../transactionBoundary/ConnectionBoundaryButton";
import faucetApi from "./faucetApi.slice";

interface PrefilledAddressInputProps {
  address: Address;
}

const PrefilledAddressInput: FC<PrefilledAddressInputProps> = ({ address }) => {
  const addressName = useAddressName(address);

  return (
    <FormGroup>
      <FormLabel>Connected Wallet Address</FormLabel>
      <TextField
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
  const { address: accountAddress } = useAccount();
  const { network } = useExpectedNetwork();

  const [claimTestTokensTrigger, claimTestTokensResponse] =
    faucetApi.useLazyClaimTestTokensQuery();

  const expectedTestNetwork = useMemo(
    () => (network.testnet ? network : networkDefinition.goerli),
    [network]
  );

  const hasClaimedTokens = useAccountHasChainFlag(
    Flag.TestTokensReceived,
    expectedTestNetwork.id,
    accountAddress
  );

  const claimTokens = useCallback(() => {
    if (accountAddress) {
      claimTestTokensTrigger({
        chainId: expectedTestNetwork.id,
        account: accountAddress,
      });
    }
  }, [expectedTestNetwork, accountAddress, claimTestTokensTrigger]);

  return (
    <ResponsiveDialog
      open
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 520 } }}
    >
      <DialogTitle sx={{ p: 4 }}>
        <Typography variant="h4">Get Testnet Tokens</Typography>
        <Typography>
          This faucet sends you a bunch of tokens to try out Superfluid.
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
            <TokenChip symbol="ETH" />
            <TokenChip symbol="fUSDC" />
            <TokenChip symbol="fTUSD" />
            <TokenChip symbol="fDAI" />
          </Stack>

          {accountAddress && <PrefilledAddressInput address={accountAddress} />}

          {claimTestTokensResponse.isError && (
            <Alert severity="error">
              <AlertTitle>
                You’ve already claimed tokens from another source using this
                address
              </AlertTitle>
            </Alert>
          )}

          {claimTestTokensResponse.isSuccess && (
            <Alert severity="success">
              <AlertTitle>Testnet tokens successfully sent</AlertTitle>
            </Alert>
          )}

          <ConnectionBoundary expectedNetwork={expectedTestNetwork}>
            <ConnectionBoundaryButton
              ButtonProps={{
                size: "xl",
                fullWidth: true,
                variant: "contained",
              }}
            >
              <Stack gap={2}>
                {!(
                  claimTestTokensResponse.isError ||
                  claimTestTokensResponse.isSuccess
                ) && (
                  <LoadingButton
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

                {hasClaimedTokens && (
                  <Link href="/wrap" passHref>
                    <Button
                      size="xl"
                      fullWidth
                      variant="contained"
                      href="/wrap"
                    >
                      Wrap into super tokens! ➜
                    </Button>
                  </Link>
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
