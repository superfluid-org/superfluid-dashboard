import {FC} from "react";
import {rpcApi} from "../redux/store";
import {Typography} from "@mui/material";
import {ethers} from "ethers";
import FlowingBalance from "../token/FlowingBalance";

export const BalanceSuperToken: FC<{
    chainId: number;
    accountAddress: string;
    tokenAddress: string;
}> = ({chainId, accountAddress, tokenAddress}) => {
    const superBalanceQuery = rpcApi.useRealtimeBalanceQuery({
        chainId,
        accountAddress,
        tokenAddress
    });

    return (
        <Typography variant="body2">
            Balance:{" "}
            {superBalanceQuery.error ? (
                "error"
            ) : superBalanceQuery.isUninitialized ||
            superBalanceQuery.isLoading ? (
                ""
            ) : !superBalanceQuery.data ? (
                ethers.utils.formatEther(0)
            ) : (
                <FlowingBalance
                    balance={superBalanceQuery.data.balance}
                    balanceTimestamp={superBalanceQuery.data.balanceTimestamp}
                    flowRate={superBalanceQuery.data.flowRate}
                />
            )}
        </Typography>
    );
};