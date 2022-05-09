import {
  Card,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber, ethers } from "ethers";
import Link from "next/link";
import { FC, memo, useEffect, useMemo, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import {
  getSuperTokenType,
  isSuper,
  isWrappable,
  SuperTokenMinimal,
} from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi, subgraphApi } from "../redux/store";
import { BalanceSuperToken } from "../tokenWrapping/BalanceSuperToken";
import { TokenDialogChip } from "../tokenWrapping/TokenDialogChip";
import {
  RestorationType,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { TransactionButton } from "../transactions/TransactionButton";
import { useWalletContext } from "../wallet/WalletContext";
import AddressSearch, { Address } from "./AddressSearch";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";

// TODO(KK): What's a better name?
enum TimeMultiplier {
  Second = 1,
  Minute = 60,
  Hour = 3600,
  Day = 86400,
}

const timeMultiplierAbbreviationMap = {
  [TimeMultiplier.Second]: "/second",
  [TimeMultiplier.Minute]: "/minute",
  [TimeMultiplier.Hour]: "/hour",
  [TimeMultiplier.Day]: "/day",
};

export type FlowRate = {
  amountWei: BigNumber;
  timeMultiplier: TimeMultiplier;
};

// TODO(KK): memoize
const calculateTotalAmountWei = (flowRate: FlowRate) =>
  flowRate.amountWei.div(flowRate.timeMultiplier);

const FlowRateInput: FC<{
  flowRate: FlowRate | undefined;
  onChange: (flowRate: FlowRate) => void;
}> = ({ flowRate, onChange }) => {
  const [amount, setAmount] = useState<string>(
    flowRate ? ethers.utils.formatEther(flowRate.amountWei) : ""
  );

  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(flowRate?.amountWei ?? 0)
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
        amountWei: amountWei,
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
        <MenuItem value={1}>{timeMultiplierAbbreviationMap[1]}</MenuItem>
        <MenuItem value={60}>{timeMultiplierAbbreviationMap[60]}</MenuItem>
        <MenuItem value={3600}>{timeMultiplierAbbreviationMap[3600]}</MenuItem>
        <MenuItem value={86400}>
          {timeMultiplierAbbreviationMap[86400]}
        </MenuItem>
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
  const isWrappableSuperToken = selectedToken
    ? isWrappable(selectedToken)
    : false;

  const [flowRate, setFlowRate] = useState<FlowRate | undefined>();

  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();

  const isSendDisabled =
    !receiver || !selectedToken || !flowRate || flowRate.amountWei.isZero();

  const listedTokensQuery = subgraphApi.useTokensQuery({
    chainId: network.chainId,
    filter: {
      isListed: true,
    },
  });

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

  const restoration2: SendStreamRestoration | undefined = isSendDisabled
    ? undefined
    : {
        type: RestorationType.SendStream,
        chainId: network.chainId,
        token: selectedToken,
        receiver: receiver,
        flowRate: flowRate,
      };

  return (
    <Card
      sx={{ position: "fixed", top: "25%", width: "480px", p: 5 }}
      elevation={6}
    >
      <Stack spacing={3}>
        <Typography variant="h5" component="h1">
          Send Stream
        </Typography>
        <AddressSearch
          address={receiver}
          onChange={(address) => setReceiver(address)}
        />
        <Stack direction="row">
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
          <FlowRateInput
            flowRate={flowRate}
            onChange={(flowRate) => setFlowRate(flowRate)}
          />
          <TextField label="Until" value={"∞"} disabled></TextField>
        </Stack>
        {selectedToken && walletAddress && (
          <Stack direction="row">
            <BalanceSuperToken
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.address}
            />
            {isWrappableSuperToken && (
              <Link
                href={`/wrap?upgrade&token=${selectedToken.address}&network=${network.slugName}`}
                passHref
              >
                <Tooltip title="Wrap">
                  <IconButton>
                    <AddCircleOutline></AddCircleOutline>
                  </IconButton>
                </Tooltip>
              </Link>
            )}
          </Stack>
        )}
        {restoration2 && (
          <>
            <Divider />
            <Typography variant="h6" component="h2">
              Preview
            </Typography>

            <SendStreamPreview restoration={restoration2}></SendStreamPreview>
            <Divider />
          </>
        )}
        <TransactionButton
          hidden={false}
          disabled={isSendDisabled}
          mutationResult={flowCreateResult}
          onClick={(setTransactionDialogContent) => {
            if (isSendDisabled) {
              throw Error("This should never happen.");
            }

            const restoration: SendStreamRestoration = {
              type: RestorationType.SendStream,
              chainId: network.chainId,
              token: selectedToken,
              receiver: receiver,
              flowRate: flowRate,
            };

            flowCreateTrigger({
              chainId: network.chainId,
              flowRateWei: calculateTotalAmountWei(flowRate).toString(),
              receiverAddress: receiver.hash,
              superTokenAddress: selectedToken.address,
              userDataBytes: undefined,
              waitForConfirmation: false,
              // transactionExtraData: {
              //   restoration,
              // },
            })
              .unwrap()
              .then(() => {
                setReceiver(undefined);
                setFlowRate(undefined);
              });

            setTransactionDialogContent(
              <SendStreamPreview restoration={restoration} />
            );
          }}
        >
          Send
        </TransactionButton>
      </Stack>
    </Card>
  );
});

const SendStreamPreview: FC<{ restoration: SendStreamRestoration }> = ({
  restoration,
}) => {
  return (
    <Card>
      <List>
        <ListItem>
          <ListItemText
            primary="Receiver"
            secondary={restoration.receiver.hash}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Flow rate"
            secondary={
              <>
                <Typography component="span">{`${ethers.utils.formatEther(
                  restoration.flowRate.amountWei
                )}${
                  timeMultiplierAbbreviationMap[
                    restoration.flowRate.timeMultiplier
                  ]
                }`}</Typography>
                <br />
                <Typography component="span">{`${ethers.utils.formatEther(
                  calculateTotalAmountWei(restoration.flowRate)
                )}${timeMultiplierAbbreviationMap[1]}`}</Typography>
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="Ends on" secondary={"Never"} />
        </ListItem>
      </List>
    </Card>
  );
};
