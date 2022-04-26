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
    const regularBalanceQuery = rpcApi.useUnderlyingBalanceQuery({
        chainId,
        accountAddress,
        tokenAddress
    }, {

    });

    return (
        <Typography variant="body2">
            Balance:{" "}
            {regularBalanceQuery.error ? (
                "error"
            ) : regularBalanceQuery.isUninitialized || regularBalanceQuery.isLoading ? (
                ""
            ) : (
                <EtherFormatted
                    wei={ethers.BigNumber.from(regularBalanceQuery?.data?.balance ?? 0).toString()}
                />
            )}
        </Typography>
    );
};