import {FC} from "react";
import {rpcApi} from "../redux/store";
import {Typography} from "@mui/material";
import EtherFormatted from "../token/EtherFormatted";
import {ethers} from "ethers";

export const BalanceUnderlyingToken: FC<{
    chainId: number;
    accountAddress: string;
    tokenAddress: string;
}> = ({chainId, accountAddress, tokenAddress}) => {
    const balanceOfQuery = rpcApi.useBalanceOfQuery({
        chainId,
        accountAddress,
        tokenAddress,
    });

    return (
        <Typography variant="body2">
            Balance:{" "}
            {balanceOfQuery.error ? (
                "error"
            ) : balanceOfQuery.isUninitialized || balanceOfQuery.isLoading ? (
                ""
            ) : (
                <EtherFormatted
                    wei={ethers.BigNumber.from(balanceOfQuery?.data ?? 0).toString()}
                />
            )}
        </Typography>
    );
};