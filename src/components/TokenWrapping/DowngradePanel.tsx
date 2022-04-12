import { FC, useEffect, useRef, useState } from "react";
import { SuperTokenDowngradeRecovery } from "../../redux/transactionRecoveries";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useWalletContext } from "../../contexts/WalletContext";
import { TokenUpgradeDowngradePair } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { BigNumber, ethers } from "ethers";
import { rpcApi } from "../../redux/store";
import { Chip, Stack, TextField } from "@mui/material";
import { TokenDialogChip } from "./TokenDialogChip";
import TokenIcon from "../TokenIcon";
import { TransactionButton } from "./TransactionButton";
import { Balance, SuperTokenBalance } from "./UpgradePanel";
import { useTransactionContext } from "../TransactionDrawer/TransactionContext";

export const DowngradePanel: FC<{
  transactionRecovery: SuperTokenDowngradeRecovery | undefined;
}> = ({ transactionRecovery }) => {
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
  const { setTransactionDrawerOpen } = useTransactionContext();

  const [selectedToken, setSelectedToken] = useState<
    TokenUpgradeDowngradePair | undefined
  >();

  const [amount, setAmount] = useState<string>("");
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(0)
  );

  useEffect(() => {
    const amountNumber = Number(amount) || 0;
    setAmountWei(ethers.BigNumber.from(amountNumber));
  }, [amount]);

  useEffect(() => {
    if (transactionRecovery) {
      setSelectedToken(transactionRecovery.tokenUpgrade);
      setAmount(
        ethers.utils.formatUnits(transactionRecovery.amountWei, "ether")
      );
    }
  }, [transactionRecovery]);

  const onTokenChange = (token: TokenUpgradeDowngradePair | undefined) => {
    setSelectedToken(token);
  };

  const [downgradeTrigger, downgradeResult] =
    rpcApi.useSuperTokenDowngradeMutation();
  const isDowngradeDisabled = !selectedToken || amountWei.isZero();

  const amountInputRef = useRef<HTMLInputElement>(undefined!);
  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, selectedToken]);

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <TokenDialogChip
            prioritizeSuperTokens={true}
            _selectedToken={selectedToken}
            onChange={onTokenChange}
          />
          <TextField
            inputRef={amountInputRef}
            disabled={!selectedToken}
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            sx={{ border: 0, width: "50%" }}
          />
        </Stack>
        {selectedToken && walletAddress && (
          <Stack direction="row-reverse">
            <SuperTokenBalance
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.superToken.address}
            ></SuperTokenBalance>
          </Stack>
        )}
      </Stack>
      <Stack sx={{ display: selectedToken ? "" : "none" }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Chip
            icon={
              selectedToken ? (
                <TokenIcon tokenSymbol={selectedToken.underlyingToken.symbol} />
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
          <TextField disabled value={amount} sx={{ width: "50%" }} />
        </Stack>
        {selectedToken && walletAddress && (
          <Stack direction="row-reverse">
            <Balance
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.underlyingToken.address}
            ></Balance>
          </Stack>
        )}
      </Stack>
      <TransactionButton
        text="Downgrade"
        disabled={isDowngradeDisabled}
        mutationResult={downgradeResult}
        onClick={async () => {
          if (isDowngradeDisabled) {
            throw Error(
              "This should never happen because the token and amount must be selected for the btton to be active."
            );
          }

          const transactionRecovery: SuperTokenDowngradeRecovery = {
            chainId: network.chainId,
            tokenUpgrade: selectedToken,
            amountWei: amountWei.toString(),
          };

          await downgradeTrigger({
            chainId: network.chainId,
            amountWei: amountWei.toString(),
            superTokenAddress: selectedToken.superToken.address,
            waitForConfirmation: true,
            transactionExtraData: {
              recovery: transactionRecovery,
            },
          });

          setTransactionDrawerOpen(true);

          setSelectedToken(undefined);
          setAmount("");
        }}
      />
    </Stack>
  );
};
