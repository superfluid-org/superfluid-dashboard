import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import {
  Alert,
  Button,
  Chip,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import { useBalance, useDisconnect } from "wagmi";
import { useAccount } from "@/hooks/useAccount"
import AddressName from "../../components/AddressName/AddressName";
import { AddressSearchDialogContent } from "../../components/AddressSearchDialog/AddressSearchDialog";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import CopyBtn from "../common/CopyBtn";
import ResponsiveDialog from "../common/ResponsiveDialog";
import AddressSearchIndex from "../impersonation/AddressSearchIndex";
import { useImpersonation } from "../impersonation/ImpersonationContext";
import Amount from "../token/Amount";
import appConfig from "../../utils/config";
import {
  dashboardHfaAgentKeysMatch,
  getDashboardHfaState,
  isDashboardHfaReady,
  refreshDashboardHfaSetupStatus,
  startDashboardHfaSetup,
  syncDashboardHfaWithWallet,
} from "./superfluidWallet/hfa";
import { SUPERFLUID_WALLET_CONNECTOR_ID } from "./superfluidWallet/connector";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal: FC<AccountModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const isBelowSm = useMediaQuery(theme.breakpoints.down("sm"));

  const { address, connector } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { impersonate } = useImpersonation();
  const { data: balanceData } = useBalance({ address });

  const [addressSearchOpen, setAddressSearchOpen] = useState(false);
  const [hfaState, setHfaState] = useState(getDashboardHfaState);
  const [hfaBusy, setHfaBusy] = useState(false);
  const [hfaError, setHfaError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    onClose();

    const timeoutID = setTimeout(() => {
      setAddressSearchOpen(false);
    }, theme.transitions.duration.standard);

    return () => {
      if (timeoutID) clearTimeout(timeoutID);
    };
  }, [onClose, setAddressSearchOpen, theme]);

  useEffect(() => {
    if (open && !address) handleClose();
  }, [open, address, handleClose]);

  const openAddressSearch = () => setAddressSearchOpen(true);
  const closeAddressSearch = () => setAddressSearchOpen(false);

  const onDisconnect = useCallback(() => {
    handleClose();

    const timeoutID = setTimeout(() => {
      disconnectAsync();
    }, theme.transitions.duration.standard);

    return () => {
      if (timeoutID) clearTimeout(timeoutID);
    };
  }, [handleClose, disconnectAsync, theme]);

  const onImpersonate = useCallback(
    ({ address }: { address: string }) => {
      impersonate(address);
      handleClose();
    },
    [impersonate, handleClose]
  );

  const isSuperfluidWallet =
    connector?.id === SUPERFLUID_WALLET_CONNECTOR_ID;
  const showHfaCard = isSuperfluidWallet && appConfig.hfa.enabled;
  const isHfaEnabledForAddress = isDashboardHfaReady(address);
  const hfaKeysMismatch = Boolean(hfaState && !dashboardHfaAgentKeysMatch(hfaState));

  useEffect(() => {
    if (open && isSuperfluidWallet && address) {
      syncDashboardHfaWithWallet(address);
      setHfaState(getDashboardHfaState());
    }
  }, [open, isSuperfluidWallet, address]);

  const onStartHfaSetup = useCallback(async () => {
    if (!address) return;
    setHfaBusy(true);
    setHfaError(null);
    try {
      const next = await startDashboardHfaSetup({ connectedWalletAddress: address });
      setHfaState(next);
      if (next.setupUrl) {
        window.open(next.setupUrl, "Superfluid Wallet HFA", "width=420,height=720");
      }
    } catch (error) {
      setHfaError(error instanceof Error ? error.message : "Failed to start HFA setup");
    } finally {
      setHfaBusy(false);
    }
  }, [address]);

  const onResetHfaKeys = useCallback(async () => {
    if (!address) return;
    setHfaBusy(true);
    setHfaError(null);
    try {
      const next = await startDashboardHfaSetup({
        connectedWalletAddress: address,
        regenerateKeys: true,
      });
      setHfaState(next);
      if (next.setupUrl) {
        window.open(next.setupUrl, "Superfluid Wallet HFA", "width=420,height=720");
      }
    } catch (error) {
      setHfaError(error instanceof Error ? error.message : "Failed to reset HFA keys");
    } finally {
      setHfaBusy(false);
    }
  }, [address]);

  const onCheckHfaSetup = useCallback(async () => {
    if (!address) return;
    setHfaBusy(true);
    setHfaError(null);
    try {
      setHfaState(await refreshDashboardHfaSetupStatus(address));
    } catch (error) {
      setHfaError(error instanceof Error ? error.message : "Failed to check HFA setup");
    } finally {
      setHfaBusy(false);
    }
  }, [address]);

  return (
    <ResponsiveDialog
      data-cy="account-modal"
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { width: 500 } }}
    >
      {!addressSearchOpen ? (
        <>
          <DialogTitle sx={{ px: 5, pt: 3.5 }}>
            <Typography variant="h4" textAlign="center">
              Wallet Connected
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{ position: "absolute", right: 20, top: 24 }}
              color="inherit"
            >
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          {address && (
            <DialogContent
              sx={{
                px: 5,
                pt: 0,
                pb: 3.5,
                [theme.breakpoints.down("md")]: {
                  px: 3,
                },
              }}
            >
              <Stack alignItems="center">
                <AddressAvatar address={address} />
                <Typography variant="h4" component="span" sx={{ mt: 1.5 }}>
                  <AddressName address={address} />
                </Typography>
                {balanceData && (
                  <Typography variant="h5" color="text.secondary">
                    <Amount wei={balanceData.value} /> {balanceData.symbol}
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" gap={1} sx={{ my: 4 }}>
                <CopyBtn
                  label="Copy Address"
                  copyText={address}
                  ButtonProps={{
                    variant: "outlined",
                    color: "secondary",
                    size: isBelowMd ? "medium" : "large",
                    sx: { flex: 1 },
                  }}
                />

                <Button
                  variant="outlined"
                  color="secondary"
                  size={isBelowMd ? "medium" : "large"}
                  endIcon={<LogoutRoundedIcon />}
                  sx={{ flex: 1 }}
                  onClick={onDisconnect}
                  data-cy="disconnect-button"
                >
                  Disconnect
                </Button>
              </Stack>

              {isSuperfluidWallet && !appConfig.hfa.enabled && (
                <Alert severity="info" sx={{ mb: 4 }}>
                  Dashboard HFA is not configured in this environment.
                </Alert>
              )}

              {showHfaCard && (
                <Stack
                  gap={1.5}
                  sx={{
                    mb: 4,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant={isBelowMd ? "h7" : "h6"}>
                      Human approval
                    </Typography>
                    {isHfaEnabledForAddress && (
                      <Chip color="success" label="HFA enabled" size="small" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Require HFA approval before dashboard transactions execute
                    from this Superfluid Wallet.
                  </Typography>
                  {hfaState?.setupSessionId && !isHfaEnabledForAddress && (
                    <Alert severity="info">
                      Finish setup in Superfluid Wallet, then check setup status here.
                    </Alert>
                  )}
                  {hfaKeysMismatch && (
                    <Alert severity="warning">
                      HFA agent keys in this browser are inconsistent. Reset keys and
                      complete setup again before sending transactions.
                    </Alert>
                  )}
                  {hfaError && <Alert severity="error">{hfaError}</Alert>}
                  <Stack direction={isBelowSm ? "column" : "row"} gap={1}>
                    {!isHfaEnabledForAddress && (
                      <Button
                        variant="contained"
                        size={isBelowMd ? "medium" : "large"}
                        disabled={hfaBusy}
                        onClick={onStartHfaSetup}
                        sx={{ flex: 1 }}
                      >
                        Enable HFA
                      </Button>
                    )}
                    {hfaState?.setupSessionId && !isHfaEnabledForAddress && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size={isBelowMd ? "medium" : "large"}
                        disabled={hfaBusy}
                        onClick={onCheckHfaSetup}
                        sx={{ flex: 1 }}
                      >
                        Check setup status
                      </Button>
                    )}
                    {(isHfaEnabledForAddress || hfaState?.setupSessionId || hfaKeysMismatch) && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size={isBelowMd ? "medium" : "large"}
                        disabled={hfaBusy}
                        onClick={onResetHfaKeys}
                        sx={{ flex: 1 }}
                      >
                        Reset HFA keys
                      </Button>
                    )}
                  </Stack>
                </Stack>
              )}

              <Typography variant={isBelowMd ? "h7" : "h6"}>
                View as any wallet
              </Typography>

              <Stack
                data-cy="view-mode-inputs"
                direction="row"
                alignItems="center"
                gap={1.25}
                sx={{
                  mt: 2,
                  [theme.breakpoints.down("md")]: {
                    mt: 1,
                  },
                }}
              >
                <Button
                  variant="outlined"
                  color="secondary"
                  size={isBelowMd ? "medium" : "large"}
                  fullWidth
                  startIcon={<PersonSearchRoundedIcon />}
                  onClick={openAddressSearch}
                >
                  View the dashboard as any address
                </Button>
              </Stack>
            </DialogContent>
          )}
        </>
      ) : (
        <AddressSearchDialogContent
          title="Select Address To View"
          open={addressSearchOpen}
          onClose={isBelowSm ? undefined : handleClose}
          onBack={closeAddressSearch}
          onSelectAddress={onImpersonate}
        />
      )}
    </ResponsiveDialog>
  );
};

export default AccountModal;
