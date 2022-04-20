import {FC} from "react";
import {subgraphApi} from "../redux/store";
import {Typography} from "@mui/material";
import {ethers} from "ethers";
import FlowingBalance from "../token/FlowingBalance";

export const BalanceSuperToken: FC<{
    chainId: number;
    accountAddress: string;
    tokenAddress: string;
}> = ({chainId, accountAddress, tokenAddress}) => {
    const accountTokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
        chainId,
        id: `${accountAddress}-${tokenAddress}`.toLowerCase(),
    });

    return (
        <Typography variant="body2">
            Balance:{" "}
            {accountTokenSnapshotQuery.error ? (
                "error"
            ) : accountTokenSnapshotQuery.isUninitialized ||
            accountTokenSnapshotQuery.isLoading ? (
                ""
            ) : !accountTokenSnapshotQuery.data ? (
                ethers.utils.formatEther(0)
            ) : (
                <FlowingBalance
                    balance={accountTokenSnapshotQuery.data.balanceUntilUpdatedAt}
                    balanceTimestamp={accountTokenSnapshotQuery.data.updatedAtTimestamp}
                    flowRate={accountTokenSnapshotQuery.data.totalNetFlowRate}
                />
            )}
        </Typography>
    );
};