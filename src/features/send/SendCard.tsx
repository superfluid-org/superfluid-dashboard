import { Card, MenuItem, Select, TextField } from "@mui/material";
import { BigNumber, ethers } from "ethers";
import { FC, memo, useEffect, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import { rpcApi } from "../redux/store";
import { useSelectedTokenContext } from "../tokenWrapping/SelectedTokenPairContext";
import { TokenDialogChip } from "../tokenWrapping/TokenDialogChip";
import TransactionBell from "../transactions/TransactionBell";
import { TransactionButton } from "../transactions/TransactionButton";
import AddressSearch, { Address } from "./AddressSearch";

const FlowRate: FC<{ onChange: (amountWei: BigNumber) => void }> = ({
  onChange,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(0)
  );

  useEffect(
    () => setAmountWei(ethers.utils.parseEther(Number(amount) ? amount : "0")),
    [amount]
  );

  useEffect(() => onChange(amountWei.div(timeMultiplier)), [amountWei]);

  const [timeMultiplier, setTimeMultiplier] = useState<number>(3600);

  return (
    <>
      <TextField
        placeholder="0.0"
        value={amount}
        onChange={(e) => setAmount(e.currentTarget.value)}
        sx={{ border: 0, width: "50%" }}
      />
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={timeMultiplier}
        label="Age"
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
  const [receiver, setReceiver] = useState<Address | undefined>();
  const { selectedTokenPair } = useSelectedTokenContext();
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(0)
  );
  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();

  const isSendDisabled = !receiver || !selectedTokenPair || amountWei.isZero();

  console.log({
    receiver,
    selectedTokenPair,
    amount: amountWei.toString()
  })

  return (
    <Card
      sx={{ position: "fixed", top: "25%", width: "400px", p: 5 }}
      elevation={6}
    >
      <AddressSearch onChange={(address) => setReceiver(address)} />
      <TokenDialogChip prioritizeSuperTokens={true} />
      <FlowRate onChange={(amountWei) => setAmountWei(amountWei)} />
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
            flowRateWei: amountWei.toString(),
            receiverAddress: receiver.hash,
            superTokenAddress: selectedTokenPair.superToken.address,
            userDataBytes: undefined,
            waitForConfirmation: false,
          });


        }}
      >
        Send
      </TransactionButton>
    </Card>
  );
});
