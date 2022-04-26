import {FC} from "react";
import {rpcApi} from "../redux/store";
import {Typography} from "@mui/material";
import EtherFormatted from "../token/EtherFormatted";
import {ethers} from "ethers";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { COIN_ADDRESS } from "../redux/endpoints/adHocSubgraphEndpoints";

export const BalanceUnderlyingToken: FC<{
    chainId: number;
    accountAddress: string;
    tokenAddress: string;
}> = ({chainId, accountAddress, tokenAddress}) => {
    const balanceQuery = rpcApi.useBalanceQuery({
        chainId,
        accountAddress,
        tokenAddress,
    });

    return (
        <Typography variant="body2">
            Balance:{" "}
            {balanceQuery.error ? (
                "error"
            ) : balanceQuery.isUninitialized || balanceQuery.isLoading ? (
                ""
            ) : (
                <EtherFormatted
                    wei={ethers.BigNumber.from(balanceQuery?.data ?? 0).toString()}
                />
            )}
        </Typography>
    );
};