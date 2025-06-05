import { Button, Typography } from "@mui/material";
import JSZip from "jszip";
import { FC, useState } from "react";
import { mapProjectStateIntoGnosisSafeBatch } from "../../redux/endpoints/vestingAgoraEndpoints";
import { rpcApi } from "../../redux/store";
import { TransactionButton, transactionButtonDefaultProps } from "../../transactionBoundary/TransactionButton";
import { TransactionDialogActions, TransactionDialogButton } from "../../transactionBoundary/TransactionDialog";
import { TxBuilder } from "../../../libs/gnosis-tx-builder";
import { ProjectsOverview, Actions } from "../../../pages/api/agora";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";

type Props = {
    isDisabled: boolean;
    projectsOverview: ProjectsOverview;
    actionsToExecute: Actions[]
}

export const DownloadGnosisSafeTransactionButton: FC<Props> = ({
    isDisabled,
    projectsOverview,
    actionsToExecute
}) => {
    const [previousUrl, setPreviousUrl] = useState<string | null>(null);

    return (
        <Button 
        {...transactionButtonDefaultProps} 
        disabled={isDisabled} 
        variant="outlined" 
        {...previousUrl ? {
            href: previousUrl,
            title: "If download does not start, try right click and save link as..."
        } : {}}
        onClick={async () => {
            if (previousUrl) {
                URL.revokeObjectURL(previousUrl);
                setPreviousUrl(null);
            }

            const zip = new JSZip();
            const zipName = `execute-tranch-${projectsOverview.tranchPlan.currentTranchCount}_for_safe_tx-builder`;
            const batchFolder = zip.folder(zipName);

            const transactions = mapProjectStateIntoGnosisSafeBatch(projectsOverview, actionsToExecute);

            const safeTxBuilderJSON = TxBuilder.batch(undefined, transactions, {
                chainId: projectsOverview.chainId
            });

            const blob = new Blob([JSON.stringify(safeTxBuilderJSON)], {
                type: "application/json",
            });

            batchFolder?.file(`batch.json`, blob);

            const objectURL = URL.createObjectURL(
                (await batchFolder?.generateAsync({ type: "blob" })) as Blob
            );

            setPreviousUrl(objectURL);

            const a = document.createElement('a');
            a.href = objectURL;
            a.download = zipName + ".zip";
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
        }}>
            Download Safe Transaction Builder JSON
        </Button>
    )
}

export const ExecuteTranchUpdateTransactionButton: FC<Props> = ({
    isDisabled,
    projectsOverview,
    actionsToExecute
}) => {
    const [executeTranchUpdate, executeTranchUpdateResult] =
        rpcApi.useExecuteTranchUpdateMutation();

    const isVisible = !executeTranchUpdateResult.isSuccess;

    return (
        <TransactionBoundary mutationResult={executeTranchUpdateResult}>
            {({
                network,
                getOverrides,
                setDialogLoadingInfo,
                setDialogSuccessActions,
                txAnalytics,
                closeDialog
            }) =>
                isVisible && (
                    <TransactionButton
                        dataCy={"create-schedule-tx-button"}
                        disabled={isDisabled}
                        onClick={async (signer) => {
                            setDialogLoadingInfo(
                                <Typography
                                    variant="h5"
                                    color="text.secondary"
                                    translate="yes"
                                >
                                    You are executing a tranch update with {actionsToExecute.length} actions.
                                </Typography>
                            );

                            executeTranchUpdate({
                                signer,
                                superTokenAddress: projectsOverview.superTokenAddress,
                                chainId: projectsOverview.chainId,
                                projectsOverview,
                                actionsToExecute
                            }).unwrap();

                            setDialogSuccessActions(
                                <TransactionDialogActions>
                                    <TransactionDialogButton
                                        data-cy="ok-button"
                                        color="primary"
                                        onClick={closeDialog}
                                    >
                                        OK
                                    </TransactionDialogButton>
                                </TransactionDialogActions>
                            );
                        }}>
                        Execute Tranch Update
                    </TransactionButton>
                )
            }
        </TransactionBoundary>
    );
};
