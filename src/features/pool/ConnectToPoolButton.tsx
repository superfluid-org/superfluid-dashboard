import { Button, Tooltip, Typography } from "@mui/material";
import { FC } from "react";
import { PendingProgress } from "../pendingUpdates/PendingProgress";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { Network } from "../network/networks";
import { PoolMember } from "@superfluid-finance/sdk-core";
import { useAnalytics } from "../analytics/useAnalytics";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { rpcApi } from "../redux/store";
import { usePendingConnectToPool } from "../pendingUpdates/PendingConnectToPool";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";

type Props = {
    network: Network;
    poolMember: PoolMember;
}

export const ConnectToPoolButton: FC<Props> = ({ network, poolMember }) => {
    const { txAnalytics } = useAnalytics();

    const getTransactionOverrides = useGetTransactionOverrides();

    const [connectToPool, connectToPoolResult] =
        rpcApi.useConnectToPoolMutation();

    const pendingUpdate = usePendingConnectToPool({
        chainId: network.id,
        poolAddress: poolMember.pool,
        superTokenAddress: poolMember.token,
    });

    const { isConnected, isCorrectNetwork } = useConnectionBoundary();

    return (
        <TransactionBoundary mutationResult={connectToPoolResult}>
            {({ mutationResult, signer, setDialogLoadingInfo }) =>
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
                                            !signer || !isConnected || !isCorrectNetwork
                                        }
                                        onClick={async () => {
                                            if (!signer)
                                                throw new Error(
                                                    "Signer should always be available here."
                                                );

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

                                            // TODO(KK): Make the operation take subscriber as input. Don't just rely on the wallet's signer -- better to have explicit data flowing
                                            const primaryArgs = {
                                                chainId: network.id,
                                                superTokenAddress: poolMember.token,
                                                poolAddress: poolMember.pool,
                                            };

                                            connectToPool({
                                                ...primaryArgs,
                                                signer,
                                                overrides: await getTransactionOverrides(
                                                    network
                                                )
                                            })
                                                .unwrap()
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