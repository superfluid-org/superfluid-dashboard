import {
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Tab,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  rpcApi,
  subgraphApi,
  useAppDispatch,
  useAppSelector,
} from "../redux/store";
import { BigNumber, ethers } from "ethers";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  addTransactionRecovery,
  transactionRecoverySelectors,
} from "../redux/transactionRecoverySlice";
import { TokenUpgradeDowngradePair } from "../redux/endpoints/adHocSubgraphEndpoints";
import { useWalletContext } from "../contexts/WalletContext";
import { useNetworkContext } from "../contexts/NetworkContext";

const TokenItem: FC<{
  chainId?: number;
  accountAddress?: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balanceWei?: string;
}> = ({
  chainId,
  accountAddress,
  tokenAddress,
  tokenSymbol,
  tokenName,
  balanceWei,
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ pl: 1, width: "100%" }}
      spacing={2}
    >
      {/* TODO: src will not play for super token. */}
      <img
        width="24px"
        height="24px"
        src={`https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/goerli/assets/${tokenAddress}/logo.png`}
      />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="column">
          <Typography variant="body1">{tokenSymbol}</Typography>
          <Typography variant="body2">{tokenName}</Typography>
        </Stack>
        {!!accountAddress && (
          <Typography variant="body1">
            {balanceWei ? (
              ethers.utils.formatEther(balanceWei)
            ) : (
              <CircularProgress />
            )}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

const UnderlyingTokenDialog: FC<{
  open: boolean;
  handleClose: () => void;
  handleSelected: (token: TokenUpgradeDowngradePair) => void;
}> = ({ open, handleClose, handleSelected }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.chainId,
  });
  const tokenPairs = tokenPairsQuery.data ?? [];

  const balancesQuery = rpcApi.useMulticallQuery(
    tokenPairsQuery.data && walletAddress
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
          tokenAddresses: tokenPairsQuery.data.map(
            (x) => x.underlyingToken.address
          ),
        }
      : skipToken
  );

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
      fullScreen={fullScreen}
      onClose={handleClose}
    >
      <DialogTitle>
        <Typography>Select a token</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (t) => t.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          autoFocus={true}
          placeholder="Search name or paste address"
          fullWidth={true}
          variant="outlined"
          sx={{
            pt: 2.5,
            pb: 1,
          }}
        />
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List>
          {tokenPairs.map((x) => (
            <ListItem key={x.superToken.address} disablePadding>
              <ListItemButton onClick={() => handleSelected(x)}>
                <TokenItem
                  chainId={network.chainId}
                  accountAddress={walletAddress}
                  tokenAddress={x.underlyingToken.address}
                  tokenSymbol={x.underlyingToken.symbol}
                  tokenName={x.underlyingToken.name}
                  balanceWei={
                    balancesQuery.data
                      ? balancesQuery.data.balances[x.underlyingToken.address]
                      : undefined
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};

const SuperTokenDialog: FC<{
  open: boolean;
  handleClose: () => void;
  handleSelected: (token: TokenUpgradeDowngradePair) => void;
}> = ({ open, handleClose, handleSelected }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.chainId,
  });
  const tokenPairs = tokenPairsQuery.data ?? [];

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
      fullScreen={fullScreen}
      onClose={handleClose}
    >
      <DialogTitle>
        <Typography variant="subtitle1">Select a token</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (t) => t.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          autoFocus={true}
          placeholder="Search name or paste address"
          fullWidth={true}
          variant="outlined"
          sx={{
            pt: 2.5,
            pb: 1,
          }}
        />
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List>
          {tokenPairs.map((x) => (
            <ListItem key={x.superToken.address} disablePadding>
              <ListItemButton onClick={() => handleSelected(x)}>
                <TokenItem
                  chainId={network.chainId}
                  accountAddress={walletAddress}
                  tokenAddress={x.underlyingToken.address}
                  tokenSymbol={x.underlyingToken.symbol}
                  tokenName={x.underlyingToken.name}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};

export const UnderlyingTokenChip: FC<{
  _selectedToken: TokenUpgradeDowngradePair | null;
  onChange: (tokenPair: TokenUpgradeDowngradePair | null) => void;
}> = ({ onChange, _selectedToken }) => {
  const [open, setOpen] = useState(false);

  const [selectedToken, setSelectedToken] =
    useState<TokenUpgradeDowngradePair | null>(_selectedToken);

  const handleTokenChipClick = () => {
    setOpen(true);
  };

  const handleTokenDialogClose = () => {
    setOpen(false);
  };

  const handleTokenSelected = (token: TokenUpgradeDowngradePair) => {
    setSelectedToken(token);
    onChange(token);
    setOpen(false);
  };

  return (
    <>
      <Chip
        icon={
          selectedToken ? (
            <img
              width="24px"
              height="24px"
              src={`https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/goerli/assets/${selectedToken.underlyingToken.address}/logo.png`}
            />
          ) : (
            <></>
          )
        }
        label={
          <>
            <Stack direction="row" alignItems="center">
              {selectedToken?.underlyingToken.symbol ?? "Select a token"}{" "}
              <ExpandMoreIcon />
            </Stack>
          </>
        }
        onClick={handleTokenChipClick}
      ></Chip>
      <UnderlyingTokenDialog
        open={open}
        handleClose={handleTokenDialogClose}
        handleSelected={handleTokenSelected}
      />
    </>
  );
};

export const SuperTokenChip: FC<{
  _selectedToken: TokenUpgradeDowngradePair | null;
  onChange: (tokenUpgrade: TokenUpgradeDowngradePair | null) => void;
}> = ({ onChange, _selectedToken }) => {
  const [open, setOpen] = useState(false);

  const [selectedToken, setSelectedToken] =
    useState<TokenUpgradeDowngradePair | null>(_selectedToken);

  const handleTokenChipClick = () => {
    setOpen(true);
  };

  const handleTokenDialogClose = () => {
    setOpen(false);
  };

  const handleTokenSelected = (token: TokenUpgradeDowngradePair) => {
    setSelectedToken(token);
    onChange(token);
    setOpen(false);
  };

  return (
    <>
      <Chip
        icon={
          selectedToken ? (
            <img
              width="24px"
              height="24px"
              src={`https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/goerli/assets/${selectedToken.underlyingToken.address}/logo.png`}
            />
          ) : (
            <></>
          )
        }
        label={
          <>
            <Stack direction="row" alignItems="center">
              {selectedToken?.superToken.symbol ?? "Select a token"}{" "}
              <ExpandMoreIcon />
            </Stack>
          </>
        }
        onClick={handleTokenChipClick}
      ></Chip>
      <SuperTokenDialog
        open={open}
        handleClose={handleTokenDialogClose}
        handleSelected={handleTokenSelected}
      />
    </>
  );
};

const UpgradeConfirmationDialog: FC<{
  open: boolean;
  chainId: number;
  signerAddress: string;
  tokenUpgrade: TokenUpgradeDowngradePair;
  amount: BigNumber;
  onClose: () => void;
}> = ({ open, chainId, signerAddress, tokenUpgrade, amount, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  const allowanceQuery = rpcApi.useSuperTokenUpgradeAllowanceQuery({
    chainId: chainId,
    accountAddress: signerAddress,
    superTokenAddress: tokenUpgrade.superToken.address,
  });

  const currentAllowance = allowanceQuery.data
    ? ethers.BigNumber.from(allowanceQuery.data)
    : null;

  const missingAllowance = currentAllowance
    ? currentAllowance.gt(amount)
      ? ethers.BigNumber.from(0)
      : amount.sub(currentAllowance)
    : null;

  const [approveTrigger, approveResult] = rpcApi.useApproveMutation();
  const [upgradeTrigger, upgradeResult] = rpcApi.useSuperTokenUpgradeMutation();

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
      fullScreen={fullScreen}
      onClose={onClose}
    >
      <DialogTitle>
        <Typography variant="subtitle1">Confirm token upgrade</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (t) => t.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1}>
          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Underlying Token: </Typography>
            <Typography variant="body1">
              {tokenUpgrade.underlyingToken.symbol}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Super Token: </Typography>
            <Typography variant="body1">
              {tokenUpgrade.superToken.symbol}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Amount to Upgrade: </Typography>
            <Typography variant="body1">
              {ethers.utils.formatEther(amount)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Available Allowance: </Typography>
            <Typography variant="body1">
              {!!currentAllowance && ethers.utils.formatEther(currentAllowance)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Missing allowance: </Typography>
            <Typography variant="body1">
              {!!missingAllowance && ethers.utils.formatEther(missingAllowance)}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          key="allowance"
          disabled={!!missingAllowance?.isZero()}
          color="primary"
          variant="contained"
          fullWidth={true}
          onClick={async () => {
            if (currentAllowance && missingAllowance) {
              await approveTrigger({
                chainId: chainId,
                amountWei: currentAllowance.add(missingAllowance).toString(),
                superTokenAddress: tokenUpgrade.superToken.address,
              });
            } else {
              console.log("This return should never happen.");
            }
          }}
        >
          {approveResult.isLoading ? <CircularProgress /> : "Approve allowance"}
        </Button>

        <Button
          key="upgrade"
          disabled={!missingAllowance?.isZero()}
          color="primary"
          variant="contained"
          fullWidth={true}
          onClick={async () => {
            const transactionInfo = await upgradeTrigger({
              chainId: chainId,
              amountWei: amount.toString(),
              superTokenAddress: tokenUpgrade.superToken.address,
              waitForConfirmation: true,
            }).unwrap();

            dispatch(
              addTransactionRecovery({
                key: "SUPER_TOKEN_UPGRADE",
                transactionInfo: transactionInfo,
                data: {
                  tokenUpgrade: tokenUpgrade,
                  amountWei: amount.toString(),
                },
              })
            );
          }}
        >
          {upgradeResult.isLoading ? (
            <CircularProgress />
          ) : (
            "Upgrade to super token"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DowngradeConfirmationDialog: FC<{
  open: boolean;
  chainId: number;
  tokenUpgrade: TokenUpgradeDowngradePair;
  amount: BigNumber;
  onClose: () => void;
}> = ({ open, chainId, tokenUpgrade, amount, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  const [downgradeTrigger, downgradeResult] =
    rpcApi.useSuperTokenDowngradeMutation();

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
      fullScreen={fullScreen}
      onClose={onClose}
    >
      <DialogTitle>
        <Typography variant="subtitle1">Confirm token downgrade</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (t) => t.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1}>
          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Super Token: </Typography>
            <Typography variant="body1">
              {tokenUpgrade.superToken.symbol}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Underlying Token: </Typography>
            <Typography variant="body1">
              {tokenUpgrade.underlyingToken.symbol}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Typography variant="subtitle1">Amount to Downgrade: </Typography>
            <Typography variant="body1">
              {ethers.utils.formatEther(amount)}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          key="downgrade"
          color="primary"
          variant="contained"
          fullWidth={true}
          onClick={async () => {
            const transactionInfo = await downgradeTrigger({
              chainId: chainId,
              amountWei: amount.toString(),
              superTokenAddress: tokenUpgrade.superToken.address,
              waitForConfirmation: true,
            }).unwrap();

            dispatch(
              addTransactionRecovery({
                key: "SUPER_TOKEN_DOWNGRADE",
                transactionInfo: transactionInfo,
                data: {
                  tokenUpgrade: tokenUpgrade,
                  amountWei: amount.toString(),
                },
              })
            );
          }}
        >
          {downgradeResult.isLoading ? (
            <CircularProgress />
          ) : (
            "Downgrade to underlying token"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const TokenPanel: FC<{ transactionRecoveryId?: string }> = ({
  transactionRecoveryId,
}) => {
  let transactionRecovery = useAppSelector((state) =>
    transactionRecoveryId
      ? transactionRecoverySelectors
          .selectById(state.transactionRecovery, transactionRecoveryId)
      : undefined
  );

  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();

  // TODO(KK): Change network?
  transactionRecovery = transactionRecovery
    ? transactionRecovery.transactionInfo.chainId === network.chainId
      ? transactionRecovery
      : undefined
    : undefined;

  const [selectedToken, setSelectedToken] =
    useState<TokenUpgradeDowngradePair | null>(
      transactionRecovery?.data.tokenUpgrade ?? null
    );

  const [amount, setAmount] = useState<number>(
    transactionRecovery
      ? Number(
          ethers.utils.formatUnits(transactionRecovery.data.amountWei, "ether")
        )
      : 0
  );
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(amount)
  );

  useEffect(() => {
    setAmountWei(ethers.utils.parseEther(amount.toString()));
  }, [amount]);

  const underlyingTokenBalanceOfQuery = rpcApi.useBalanceOfQuery(
    walletAddress && selectedToken
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
          tokenAddress: selectedToken.underlyingToken.address,
        }
      : skipToken
  );

  const superTokenBalanceQuery = rpcApi.useBalanceOfQuery(
    walletAddress && selectedToken
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
          tokenAddress: selectedToken.superToken.address,
        }
      : skipToken
  );

  const onTokenChange = (token: TokenUpgradeDowngradePair | null) => {
    setSelectedToken(token);
  };

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [tabValue, setTabValue] = useState<string>("upgrade");

  return (
    <Card sx={{ position: "fixed", top: "25%", width: "400px", p: 5 }} elevation={6}>
      <TabContext value={tabValue}>
        <TabList
          variant="scrollable"
          scrollButtons="auto"
          onChange={(_event, newValue: string) => setTabValue(newValue)}
          aria-label="tabs"
        >
          <Tab data-cy={"streams-tab"} label="Upgrade" value="upgrade" />
          <Tab data-cy={"indexes-tab"} label="Downgrade" value="downgrade" />
        </TabList>
        <TabPanel value="upgrade">
          <Stack direction="column" spacing={2}>
            <Stack direction="column" spacing={1}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <TextField
                  disabled={!selectedToken}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.currentTarget.value))}
                  sx={{ border: 0, width: "50%" }}
                />
                <UnderlyingTokenChip
                  _selectedToken={selectedToken}
                  onChange={onTokenChange}
                />
              </Stack>
              <Stack direction="row-reverse">
                <Typography variant="body2">
                  Balance:{" "}
                  {underlyingTokenBalanceOfQuery.data
                    ? ethers.utils
                        .formatEther(underlyingTokenBalanceOfQuery.data)
                        .toString()
                    : "0.00"}
                </Typography>
              </Stack>
            </Stack>
            <Stack sx={{ display: selectedToken ? "" : "none" }}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <TextField disabled value={amount} sx={{ width: "50%" }} />
                <Chip
                  icon={
                    selectedToken ? (
                      <img
                        width="24px"
                        height="24px"
                        src={`https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/ethereum/assets/${selectedToken.underlyingToken.address}/logo.png`}
                      />
                    ) : (
                      <></>
                    )
                  }
                  label={
                    <>
                      <Stack direction="row" alignItems="center">
                        {selectedToken?.superToken.symbol ?? ""}
                      </Stack>
                    </>
                  }
                ></Chip>
              </Stack>
              <Stack direction="row-reverse">
                <Typography variant="body2">
                  Balance:{" "}
                  {superTokenBalanceQuery.data
                    ? ethers.utils
                        .formatEther(superTokenBalanceQuery.data)
                        .toString()
                    : ""}
                </Typography>
              </Stack>
            </Stack>
            <Button
              color="primary"
              variant="contained"
              fullWidth={true}
              onClick={() => setConfirmationOpen(true)}
            >
              Upgrade
            </Button>
            {!!(walletAddress && selectedToken && amount) && (
              <UpgradeConfirmationDialog
                key="upgrade"
                open={confirmationOpen}
                chainId={network.chainId}
                signerAddress={walletAddress}
                tokenUpgrade={selectedToken}
                amount={amountWei}
                onClose={() => {
                  setConfirmationOpen(false);
                }}
              />
            )}
          </Stack>
        </TabPanel>

        <TabPanel value="downgrade">
          <Stack direction="column" spacing={2}>
            <Stack direction="column" spacing={1}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <TextField
                  disabled={!selectedToken}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.currentTarget.value))}
                  sx={{ border: 0, width: "50%" }}
                />
                <SuperTokenChip
                  _selectedToken={selectedToken}
                  onChange={onTokenChange}
                />
              </Stack>
              <Stack direction="row-reverse">
                <Typography variant="body2">
                  Balance:{" "}
                  {superTokenBalanceQuery.data
                    ? ethers.utils
                        .formatEther(superTokenBalanceQuery.data)
                        .toString()
                    : "0.00"}
                </Typography>
              </Stack>
            </Stack>
            <Stack sx={{ display: selectedToken ? "" : "none" }}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <TextField disabled value={amount} sx={{ width: "50%" }} />
                <Chip
                  icon={
                    selectedToken ? (
                      <img
                        width="24px"
                        height="24px"
                        src={`https://raw.githubusercontent.com/sushiswap/assets/master/blockchains/goerli/assets/${selectedToken.underlyingToken.address}/logo.png`}
                      />
                    ) : (
                      <></>
                    )
                  }
                  label={
                    <>
                      <Stack direction="row" alignItems="center">
                        {selectedToken?.underlyingToken.symbol ?? ""}
                      </Stack>
                    </>
                  }
                ></Chip>
              </Stack>
              <Stack direction="row-reverse">
                <Typography variant="body2">
                  Balance:{" "}
                  {underlyingTokenBalanceOfQuery.data
                    ? ethers.utils
                        .formatEther(underlyingTokenBalanceOfQuery.data)
                        .toString()
                    : ""}
                </Typography>
              </Stack>
            </Stack>
            <Button
              color="primary"
              variant="contained"
              fullWidth={true}
              onClick={() => setConfirmationOpen(true)}
            >
              Downgrade
            </Button>
            {!!(selectedToken && amount) && (
              <DowngradeConfirmationDialog
                key="downgrade"
                open={confirmationOpen}
                chainId={network.chainId}
                tokenUpgrade={selectedToken}
                amount={amountWei}
                onClose={() => {
                  setConfirmationOpen(false);
                }}
              />
            )}
          </Stack>
        </TabPanel>
      </TabContext>
    </Card>
  );
};

export default UnderlyingTokenDialog;
