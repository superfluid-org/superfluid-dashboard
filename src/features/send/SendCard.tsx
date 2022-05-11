import {Card, Divider, IconButton, Stack, TextField, Tooltip, Typography,} from "@mui/material";
import {BigNumber} from "ethers";
import Link from "next/link";
import {memo, useCallback, useMemo, useState} from "react";
import {useNetworkContext} from "../network/NetworkContext";
import {getSuperTokenType, isSuper, isWrappable, SuperTokenMinimal, TokenMinimal,} from "../redux/endpoints/adHocSubgraphEndpoints";
import {rpcApi, subgraphApi} from "../redux/store";
import {BalanceSuperToken} from "../tokenWrapping/BalanceSuperToken";
import {TokenDialogChip} from "../tokenWrapping/TokenDialogChip";
import {RestorationType, SendStreamRestoration,} from "../transactionRestoration/transactionRestorations";
import {TransactionButton} from "../transactions/TransactionButton";
import {useWalletContext} from "../wallet/WalletContext";
import AddressSearch from "./AddressSearch";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {DisplayAddress} from "./DisplayAddressChip";
import {calculateTotalAmountWei, FlowRateWithTime, FlowRateInput} from "./FlowRateInput";
import {SendStreamPreview} from "./SendStreamPreview";

export default memo(function SendCard() {
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
  const [receiver, setReceiver] = useState<DisplayAddress | undefined>();
  const [selectedToken, setSelectedToken] = useState<
    SuperTokenMinimal | undefined
  >();
  const isWrappableSuperToken = selectedToken
    ? isWrappable(selectedToken)
    : false;

  const [flowRate, setFlowRate] = useState<FlowRateWithTime | undefined>();

  const [flowCreateTrigger, flowCreateResult] = rpcApi.useFlowCreateMutation();

  const isSendDisabled =
    !receiver ||
    !selectedToken ||
    !flowRate ||
    BigNumber.from(flowRate.amountWei).isZero();

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

  const restoration: SendStreamRestoration | undefined = isSendDisabled
    ? undefined
    : {
        type: RestorationType.SendStream,
        chainId: network.chainId,
        token: selectedToken,
        receiver: receiver,
        flowRate: flowRate,
      };

      const onTokenSelect = useCallback((token: TokenMinimal) => {
        if (isSuper(token)) {
          setSelectedToken(token);
        } else {
          throw new Error("Only super token selection is supported");
        }
      }, [setSelectedToken]);

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
          onChange={(address) => {
            console.log("foo")
setReceiver(address)
          }}
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
            onTokenSelect={onTokenSelect}
          />
          <FlowRateInput
            flowRateWithTime={flowRate}
            onChange={setFlowRate}
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
        {restoration && (
          <>
            <Divider />
            <Typography variant="h6" component="h2">
              Preview
            </Typography>
            <SendStreamPreview receiver={restoration.receiver} token={restoration.token} flowRateWithTime={restoration.flowRate}></SendStreamPreview>
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

            // setTransactionDialogContent(
            //   <SendStreamPreview restoration={restoration} />
            // );
          }}
        >
          Send
        </TransactionButton>
      </Stack>
    </Card>
  );
});

