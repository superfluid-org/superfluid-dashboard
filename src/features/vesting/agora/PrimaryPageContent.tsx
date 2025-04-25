import {
    Typography
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { Actions, ProjectsOverview } from "../../../pages/api/agora";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { ActionsList } from "./ActionsList";
import {
    ExecuteTranchUpdateTransactionButton,
    DownloadGnosisSafeTransactionButton,
} from "./buttons";
import { ProjectsTable } from "./ProjectsTable";
import { TokenMinimal } from "../../redux/endpoints/tokenTypes";
import { useMemo } from "react";
import { useStore, useSelector } from '@xstate/store/react';
import { produce } from "immer";
import { isAgoraSender } from "./constants";
import { Address } from "viem";

export type SelectableActions = Actions & {
    selected: boolean
}

export function PrimaryPageContent(props: {
    projectsOverview: ProjectsOverview;
    token: TokenMinimal | null | undefined;
}) {
    const { projectsOverview, token } = props;

    const projects = useMemo(() => {
        return [...projectsOverview.projects].sort((a, b) => {
            // Sort KYC completed first, non-KYC last
            if (a.agoraEntry.KYCStatusCompleted && !b.agoraEntry.KYCStatusCompleted)
                return -1;
            if (!a.agoraEntry.KYCStatusCompleted && b.agoraEntry.KYCStatusCompleted)
                return 1;
            return 0;
        });
    }, [projectsOverview]);

    const initialAllSelectableActions: SelectableActions[] = useMemo(() => {
        return [
            ...projectsOverview.allowanceActions.map(action => ({
                ...action,
                selected: false,
            })),
            ...projectsOverview.projects.flatMap((project) => project.projectActions.map(action => ({
                ...action,
                selected: false
            })))
        ]
    }, [projectsOverview]);

    const store = useStore({
        context: {
            allSelectableActions: initialAllSelectableActions,
        },
        on: {
            selectAction: (context, action: { id: string }) => {
                console.log({
                    action
                })
                return produce(context, draft => {
                    const selectedAction = draft.allSelectableActions.find((x) => x.id === action.id);
                    if (!selectedAction) {
                        throw new Error(`Action with id ${action.id} not found`);
                    }
                    selectedAction.selected = true;
                });
            },
            deselectAction: (context, action: { id: string }) => {
                return produce(context, draft => {
                    const deselectedAction = draft.allSelectableActions.find((x) => x.id === action.id);
                    if (!deselectedAction) {
                        throw new Error(`Action with id ${action.id} not found`);
                    }
                    deselectedAction.selected = false;
                });
            },
        },
    });

    const allSelectableActions = useSelector(store, (store) => store.context.allSelectableActions);
    const actionsToExecute = useMemo(() => allSelectableActions.filter(x => x.selected), [allSelectableActions]);

    const isAgoraWhitelistedWallet = useMemo(() =>
        isAgoraSender(projectsOverview.chainId, projectsOverview.senderAddress as Address),
        [projectsOverview]
    );
    const areButtonsDisabled = initialAllSelectableActions.length === 0 || !isAgoraWhitelistedWallet;

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Projects Overview
            </Typography>

            <ProjectsTable
                projectsOverview={projectsOverview}
                rows={projects}
                allSelectableActions={allSelectableActions}
                selectAction={store.trigger.selectAction}
                deselectAction={store.trigger.deselectAction}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Pending Actions ({allSelectableActions.length})
            </Typography>

            <ActionsList
                actions={allSelectableActions}
                tokenSymbol={token?.symbol}
                selectAction={store.trigger.selectAction}
                deselectAction={store.trigger.deselectAction}
            />

            <ConnectionBoundary>
                {projectsOverview && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                        <Stack direction="column" spacing={1.25} sx={{ width: "auto" }}>
                            <ExecuteTranchUpdateTransactionButton
                                isDisabled={areButtonsDisabled}
                                projectsOverview={projectsOverview}
                                actionsToExecute={actionsToExecute}
                            />
                            <DownloadGnosisSafeTransactionButton
                                isDisabled={areButtonsDisabled}
                                projectsOverview={projectsOverview}
                                actionsToExecute={actionsToExecute}
                            />
                        </Stack>
                    </Box>
                )}
            </ConnectionBoundary>
        </>
    );
}
