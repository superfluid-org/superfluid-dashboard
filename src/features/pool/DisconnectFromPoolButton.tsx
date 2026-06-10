import { Button, Tooltip, Typography } from "@mui/material";
import { FC } from "react";
import { PendingProgress } from "../pendingUpdates/PendingProgress";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { Network } from "../network/networks";
import { PoolMember } from "@superfluid-finance/sdk-core";
import { useAnalytics } from "../analytics/useAnalytics";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";
import { usePendingDisconnectFromPool } from "../pendingUpdates/PendingDisconnectFromPool";
import { useDisconnectFromPool } from "./usePoolConnectionWrites";

type Props = {
    network: Network;
    poolMember: PoolMember;
}

export const DisconnectFromPoolButton: FC<Props> = ({ network, poolMember }) => {
    const { txAnalytics } = useAnalytics();

    const [disconnectFromPool, disconnectFromPoolResult] =
        useDisconnectFromPool();

    const pendingUpdate = usePendingDisconnectFromPool({
        chainId: network.id,
        poolAddress: poolMember.pool,
        superTokenAddress: poolMember.token,
    });

    const { isConnected, isCorrectNetwork } = useConnectionBoundary();

    return (
        <TransactionBoundary mutationResult={disconnectFromPoolResult}>
            {({ mutationResult, setDialogLoadingInfo }) =>
                poolMember.isConnected && (
                    <>
                        {mutationResult.isLoading || pendingUpdate ? (
                            <PendingProgress
                                transactingText={"Disconnecting..."}
                                pendingUpdate={pendingUpdate}
                            />
                        ) : (
                            <Tooltip
                                arrow
                                disableInteractive
                                title={
                                    !isConnected ? (
                                        <span>
                                            Connect wallet to disconnect from the pool
                                        </span>
                                    ) : !isCorrectNetwork ? (
                                        <span>
                                            Switch network to{" "}
                                            <span translate="no">{network.name}</span> to
                                            disconnect from the pool
                                        </span>
                                    ) : (
                                        <span>Disconnect from the pool</span>
                                    )
                                }
                            >
                                <span>
                                    <Button
                                        data-cy={"disconnect-from-pool-button"}
                                        color="error"
                                        disabled={
                                            !isConnected || !isCorrectNetwork
                                        }
                                        onClick={async () => {
                                            setDialogLoadingInfo(
                                                <Typography
                                                    data-cy={"disconnect-from-pool-message"}
                                                    variant="h5"
                                                    color="text.secondary"
                                                    translate="yes"
                                                >
                                                    You are disconnecting from the pool.
                                                </Typography>
                                            );

                                            const primaryArgs = {
                                                chainId: network.id,
                                                superTokenAddress: poolMember.token,
                                                poolAddress: poolMember.pool,
                                            };

                                            disconnectFromPool({
                                                ...primaryArgs,
                                                simulate: true,
                                            })
                                                .then(
                                                    ...txAnalytics(
                                                        "Disconnect from GDA Pool",
                                                        primaryArgs
                                                    )
                                                )
                                                .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
                                        }}
                                    >
                                        Disconnect
                                    </Button>
                                </span>
                            </Tooltip>
                        )}
                    </>
                )
            }
        </TransactionBoundary>
    )
};