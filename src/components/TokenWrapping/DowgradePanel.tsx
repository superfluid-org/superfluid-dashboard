import {FC, useEffect, useState} from "react";
import {SuperTokenDowngradeRecovery} from "../../redux/transactionRecoveries";
import {useNetworkContext} from "../../contexts/NetworkContext";
import {useWalletContext} from "../../contexts/WalletContext";
import {TokenUpgradeDowngradePair} from "../../redux/endpoints/adHocSubgraphEndpoints";
import {BigNumber, ethers} from "ethers";
import {rpcApi} from "../../redux/store";
import {skipToken} from "@reduxjs/toolkit/query";
import {Button, Chip, Stack, TextField, Typography} from "@mui/material";
import {TokenDialogChip} from "./TokenDialogChip";
import TokenIcon from "../TokenIcon";

export const DowgradePanel: FC<{
    transactionRecovery: SuperTokenDowngradeRecovery | undefined;
}> = ({transactionRecovery}) => {
    const {network} = useNetworkContext();
    const {walletAddress} = useWalletContext();

    const [selectedToken, setSelectedToken] = useState<TokenUpgradeDowngradePair | undefined>();

    const [amount, setAmount] = useState<number>(0);
    const [amountWei, setAmountWei] = useState<BigNumber>(
        ethers.BigNumber.from(amount)
    );

    useEffect(
        () => setAmountWei(ethers.BigNumber.from(amount.toString())),
        [amount]
    );

    useEffect(() => {
        if (transactionRecovery) {
            setSelectedToken(transactionRecovery.tokenUpgrade);
            setAmount(
                Number(ethers.utils.formatUnits(transactionRecovery.amountWei, "ether"))
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

    const [downgradeTrigger] = rpcApi.useSuperTokenDowngradeMutation();

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
                        disabled={!selectedToken}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.currentTarget.value))}
                        sx={{border: 0, width: "50%"}}
                    />
                </Stack>
                <Stack direction="row-reverse">
                    <Typography variant="body2">
                        Balance:{" "}
                        {superTokenBalanceQuery.data
                            ? ethers.utils.formatEther(superTokenBalanceQuery.data).toString()
                            : "0.00"}
                    </Typography>
                </Stack>
            </Stack>
            <Stack sx={{display: selectedToken ? "" : "none"}}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Chip
                        icon={
                            selectedToken ? (
                                <TokenIcon tokenSymbol={selectedToken.underlyingToken.symbol}/>
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
                    <TextField disabled value={amount} sx={{width: "50%"}}/>
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
                disabled={!selectedToken || !amount}
                onClick={async () => {
                    if (!selectedToken) {
                        throw Error(
                            "This should never happen because the token and amount must be selected for the btton to be active."
                        );
                    }

                    const transactionRecovery: SuperTokenDowngradeRecovery = {
                        chainId: network.chainId,
                        tokenUpgrade: selectedToken,
                        amountWei: amountWei.toString(),
                    };

                    downgradeTrigger({
                        chainId: network.chainId,
                        amountWei: amountWei.toString(),
                        superTokenAddress: selectedToken.superToken.address,
                        waitForConfirmation: true,
                        transactionExtraData: {
                            recovery: transactionRecovery,
                        },
                    });
                }}
            >
                Downgrade
            </Button>
        </Stack>
    );
};