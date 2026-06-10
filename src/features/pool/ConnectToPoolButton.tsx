import { Button, Tooltip, Typography } from "@mui/material";
import { FC } from "react";
import { PendingProgress } from "../pendingUpdates/PendingProgress";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { Network } from "../network/networks";
import { PoolMember } from "@superfluid-finance/sdk-core";
import { useAnalytics } from "../analytics/useAnalytics";
import { usePendingConnectToPool } from "../pendingUpdates/PendingConnectToPool";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";
import { useConnectToPool } from "./usePoolConnectionWrites";

type Props = {
    network: Network;
    poolMember: PoolMember;
}

export const ConnectToPoolButton: FC<Props> = ({ network, poolMember }) => {
    const { txAnalytics } = useAnalytics();

    const [connectToPool, connectToPoolResult] = useConnectToPool();

    const pendingUpdate = usePendingConnectToPool({
        chainId: network.id,
        poolAddress: poolMember.pool,
        superTokenAddress: poolMember.token,
    });

    const { isConnected, isCorrectNetwork } = useConnectionBoundary();

    return (
        <TransactionBoundary mutationResult={connectToPoolResult}>
            {({ mutationResult, setDialogLoadingInfo }) =>
                !poolMember.isConnected && (
                    <>
                        {mutationResult.isLoading || pendingUpdate ? (
                            <PendingProgress
                                transactingText={"Connecting..."}
                                pendingUpdate={pendingUpdate}
                            />
                        ) : (
                            <Tooltip
                                arrow
                                disableInteractive
                                title={
                                    !isConnected ? (
                                        <span>
                                            Connect wallet to connect to the pool
                                        </span>
                                    ) : !isCorrectNetwork ? (
                                        <span>
                                            Switch network to{" "}
                                            <span translate="no">{network.name}</span> to
                                            connect to the pool
                                        </span>
                                    ) : (
                                        <span>Connect to the pool</span>
                                    )
                                }
                            >
                                <span>
                                    <Button
                                        data-cy={"connect-pool-button"}
                                        color="primary"
                                        disabled={
                                            !isConnected || !isCorrectNetwork
                                        }
                                        onClick={async () => {
                                            setDialogLoadingInfo(
                                                <Typography
                                                    data-cy={"connect-pool-message"}
                                                    variant="h5"
                                                    color="text.secondary"
                                                    translate="yes"
                                                >
                                                    You are connecting to the pool.
                                                </Typography>
                                            );

                                            const primaryArgs = {
                                                chainId: network.id,
                                                superTokenAddress: poolMember.token,
                                                poolAddress: poolMember.pool,
                                            };

                                            connectToPool({
                                                ...primaryArgs,
                                                simulate: true,
                                            })
                                                .then(
                                                    ...txAnalytics(
                                                        "Connect to GDA Pool",
                                                        primaryArgs
                                                    )
                                                )
                                                .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
                                        }}
                                    >
                                        Connect
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