import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Chip,
  DialogContent,
  DialogTitle,
  FormGroup,
  FormLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useCallback, useMemo } from "react";
import { useAccount, useSwitchNetwork } from "wagmi";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { Flag } from "../flags/accountFlags.slice";
import { useAccountHasChainFlag } from "../flags/accountFlagsHooks";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { networkDefinition } from "../network/networks";
import { useAppDispatch } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import ConnectionBoundaryButton from "../transactionBoundary/ConnectionBoundaryButton";
import faucetApi from "./faucetApi.slice";

interface TokenChipProps {
  name: string;
  symbol: string;
}

const TokenChip: FC<TokenChipProps> = ({ name, symbol }) => (
  <Chip
    variant="outlined"
    label={name}
    avatar={
      <Box
        sx={{
          ml: 1.5, // Adding ml manually because TokenIcon is not wrapped by <Icon> or <Avatar> which is usually required by MUI theme.
        }}
      >
        <TokenIcon tokenSymbol={symbol} size={24} />
      </Box>
    }
  />
);

interface FaucetDialogProps {
  open: boolean;
  onClose: () => void;
}

const GOERLI_ID = networkDefinition.goerli.id;

const FaucetDialog: FC<FaucetDialogProps> = ({ open, onClose }) => {
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
      open={open}
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
            <TokenChip name="ETH" symbol="eth" />
            <TokenChip name="DAI" symbol="dai" />
            <TokenChip name="USDC" symbol="usdc" />
            <TokenChip name="USDT" symbol="usdt" />
          </Stack>

          {accountAddress && (
            <FormGroup>
              <FormLabel>Connected Wallet Address</FormLabel>
              <TextField value={accountAddress} disabled />
            </FormGroup>
          )}

          <Typography>Claimed: {hasClaimedTokens.toString()}</Typography>

          <ConnectionBoundary expectedNetwork={expectedTestNetwork}>
            {({}) => (
              <ConnectionBoundaryButton
                ButtonProps={{
                  size: "xl",
                  fullWidth: true,
                  variant: "contained",
                }}
              >
                <LoadingButton
                  size="xl"
                  fullWidth
                  loading={claimTestTokensResponse.isLoading}
                  variant="contained"
                  disabled={hasClaimedTokens}
                  onClick={claimTokens}
                >
                  {hasClaimedTokens ? "Tokens claimed" : "Claim"}
                </LoadingButton>
              </ConnectionBoundaryButton>
            )}
          </ConnectionBoundary>
        </Stack>
      </DialogContent>
    </ResponsiveDialog>
  );
};

export default FaucetDialog;
