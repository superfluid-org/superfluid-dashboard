import { Card, MenuItem, Select, Stack, TextField } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber, ethers } from "ethers";
import { FC, memo, useEffect, useMemo, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import {
  getSuperTokenType,
  isSuper,
  SuperTokenMinimal,
} from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi, subgraphApi } from "../redux/store";
import { BalanceSuperToken } from "../tokenWrapping/BalanceSuperToken";
import { TokenDialogChip } from "../tokenWrapping/TokenDialogChip";
import { TransactionButton } from "../transactions/TransactionButton";
import { useWalletContext } from "../wallet/WalletContext";
import AddressSearch, { Address } from "./AddressSearch";

// TODO(KK): What's a better name?
enum TimeMultiplier {
  Second = 1,
  Minute = 60,
  Hour = 3600,
  Day = 86400,
}

type FlowRate = {
  amountWeiPerSecond: BigNumber;
  timeMultiplier: TimeMultiplier;
};

const calculateTotalAmountWei = (flowRate: FlowRate) =>
  flowRate.amountWeiPerSecond.mul(flowRate.timeMultiplier);

const FlowRateInput: FC<{
  flowRate: FlowRate | undefined;
  onChange: (flowRate: FlowRate) => void;
}> = ({ flowRate, onChange }) => {
  const [amount, setAmount] = useState<string>(
    flowRate ? ethers.utils.formatEther(flowRate.amountWeiPerSecond) : ""
  );
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(flowRate?.amountWeiPerSecond ?? 0)
  );
  const [timeMultiplier, setTimeMultiplier] = useState<TimeMultiplier>(
    flowRate?.timeMultiplier ?? TimeMultiplier.Hour
  );

  useEffect(
    () => setAmountWei(ethers.utils.parseEther(Number(amount) ? amount : "0")),
    [amount]
  );

  useEffect(
    () =>
      onChange({
        amountWeiPerSecond: amountWei,
        timeMultiplier: timeMultiplier,
      }),
    [amountWei, timeMultiplier]
  );

  return (
    <>
      <TextField
        placeholder="0.0"
        value={amount}
        onChange={(e) => setAmount(e.currentTarget.value)}
        sx={{ border: 0, width: "50%" }}
      />
      <Select
        value={timeMultiplier}
        label="Time multiplier"
        onChange={(e) => setTimeMultiplier(Number(e.target.value))}
      >
        <MenuItem value={1}>Second</MenuItem>
        <MenuItem value={60}>Minute</MenuItem>
        <MenuItem value={3600}>Hour</MenuItem>
        <MenuItem value={86400}>Day</MenuItem>
      </Select>
    </>
  );
};

export default memo(function SendCard() {
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
  const [receiver, setReceiver] = useState<Address | undefined>();
  const [selectedToken, setSelectedToken] = useState<
    SuperTokenMinimal | undefined
  >();
  const [flowRate, setFlowRate] = useState<FlowRate | undefined>();

  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();

  const isSendDisabled =
    !receiver ||
    !selectedToken ||
    !flowRate ||
    flowRate.amountWeiPerSecond.isZero();

  const listedTokensQuery = subgraphApi.useTokensQuery(
    !walletAddress
      ? {
          chainId: network.chainId,
          filter: {
            isListed: true,
          },
        }
      : skipToken
  );

  const tokens = useMemo(
    () =>
      listedTokensQuery.data?.items?.map((x) => ({
        type: getSuperTokenType({ ...x, network, address: x.id }),
        address: x.id,
        name: x.name,
        symbol: x.symbol,
      })),
    [listedTokensQuery.data]
  );

  return (
    <Card
      sx={{ position: "fixed", top: "25%", width: "400px", p: 5 }}
      elevation={6}
    >
      <Stack>
        <AddressSearch
          address={receiver}
          onChange={(address) => setReceiver(address)}
        />
        <TokenDialogChip
          token={selectedToken}
          tokenSelection={{
            showUpgrade: true,
            tokenPairsQuery: {
              data: tokens,
              isLoading: listedTokensQuery.isLoading,
              isUninitialized: listedTokensQuery.isUninitialized,
            },
          }}
          onTokenSelect={(token) => {
            if (isSuper(token)) {
              setSelectedToken(token);
            } else {
              throw new Error("Only super token seleciton is supported");
            }
          }}
        />
        {selectedToken && walletAddress && (
          <BalanceSuperToken
            chainId={network.chainId}
            accountAddress={walletAddress}
            tokenAddress={selectedToken.address}
          />
        )}
        <FlowRateInput
          flowRate={flowRate}
          onChange={(flowRate) => setFlowRate(flowRate)}
        />
        <TransactionButton
          hidden={false}
          disabled={isSendDisabled}
          mutationResult={flowCreateResult}
          onClick={(setTransactionDialogContent) => {
            if (isSendDisabled) {
              throw Error("This should never happen.");
            }

            flowCreateTrigger({
              chainId: network.chainId,
              flowRateWei: calculateTotalAmountWei(flowRate).toString(),
              receiverAddress: receiver.hash,
              superTokenAddress: selectedToken.address,
              userDataBytes: undefined,
              waitForConfirmation: false,
            }).then(() => {
              setReceiver(undefined);
              setFlowRate(undefined);
            });
          }}
        >
          Send
        </TransactionButton>
      </Stack>
    </Card>
  );
});
