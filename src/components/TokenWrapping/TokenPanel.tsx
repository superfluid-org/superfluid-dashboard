import { FC, useEffect, useState } from "react";
import { rpcApi, useAppSelector } from "../../redux/store";
import {
  SuperTokenDowngradeRecovery,
  SuperTokenUpgradeRecovery,
  transactionRecoverySelectors,
} from "../../redux/transactionRecoverySlice";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useWalletContext } from "../../contexts/WalletContext";
import { TokenUpgradeDowngradePair } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { BigNumber, ethers } from "ethers";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Button,
  Card,
  Chip,
  Stack,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import TokenIcon from "../TokenIcon";
import { DowngradeConfirmationDialog } from "./DowngradeConfirmationDialog";
import { UpgradeConfirmationDialog } from "./UpgradeConfirmationDialog";
import { SuperTokenChip } from "./SuperTokenChip";
import { UnderlyingTokenChip } from "./UnderlyingTokenChip";
import { useRouter } from "next/router";

export const TokenPanel: FC<{
  transactionRecovery?: SuperTokenDowngradeRecovery | SuperTokenUpgradeRecovery;
  tabValue: "upgrade" | "downgrade";
}> = ({ transactionRecovery, tabValue }) => {
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
  const router = useRouter();

  const [selectedToken, setSelectedToken] = useState<
    TokenUpgradeDowngradePair | undefined
  >();

  const [amount, setAmount] = useState<number>(0);
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(amount)
  );

  useEffect(() => setAmountWei(ethers.BigNumber.from(amount.toString())), [amount]);

  useEffect(() => {
    if (transactionRecovery) {
      setSelectedToken(transactionRecovery.data.tokenUpgrade);
      setAmount(
        Number(
          ethers.utils.formatUnits(transactionRecovery.data.amountWei, "ether")
        )
      );
    }
  }, [transactionRecovery]);

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

  const onTokenChange = (token: TokenUpgradeDowngradePair | undefined) => {
    setSelectedToken(token);
  };

  const [confirmationOpen, setConfirmationOpen] = useState(false);

  return (
    <Card
      sx={{ position: "fixed", top: "25%", width: "400px", p: 5 }}
      elevation={6}
    >
      <TabContext value={tabValue}>
        <TabList
          variant="scrollable"
          scrollButtons="auto"
          onChange={(_event, newValue: "upgrade" | "downgrade") =>
            router.replace(`/${newValue}`)
          }
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
                      <TokenIcon
                        tokenSymbol={selectedToken.underlyingToken.symbol}
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
                      <TokenIcon
                        tokenSymbol={selectedToken.underlyingToken.symbol}
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
