import {
    Typography,
    Paper,
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
import { useMemo, useState } from "react";

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

    const allActions = useMemo(() => {
        return [
            ...projectsOverview.allowanceActions,
            ...projects.flatMap((row) => row.projectActions),
        ];
    }, [projects, projectsOverview]);

    const [actionsToExecute, setActionsToExecute] = useState<Actions[]>([]);

    const areButtonsDisabled = allActions.length === 0;

    return (
        <>
            <Typography variant="h6" gutterBottom>
                Projects Overview
            </Typography>

            <ProjectsTable projectsOverview={projectsOverview} rows={projects} />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Pending Actions ({allActions.length})
            </Typography>

            <Paper elevation={1} sx={{ p: 2 }}>
                <ActionsList
                    actions={allActions}
                    tokenSymbol={token?.symbol}
                    onSelectionChange={setActionsToExecute}
                />
            </Paper>

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
