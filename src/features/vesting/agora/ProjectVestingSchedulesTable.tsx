import { Paper, Table, TableBody, TableContainer } from "@mui/material";
import { useRouter } from "next/router";
import { FC } from "react";
import { ProjectState } from "../../../pages/api/agora";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import VestingRow from "../VestingRow";

export const ProjectVestingSchedulesTables: FC<{
    project: ProjectState
}> = ({ project }) => {
    const { network } = useExpectedNetwork();

    const router = useRouter();
    const openDetails = (id: string) => () =>
        router.push(`/vesting/${network.slugName}/${id}`);

    if (project.allRelevantSchedules.length === 0) {
        return null;
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableBody>
                    {
                        project.allRelevantSchedules
                            .map((vestingSchedule) => (
                                <VestingRow
                                    key={vestingSchedule.id}
                                    network={network}
                                    vestingSchedule={vestingSchedule}
                                    onClick={openDetails(vestingSchedule.id)}
                                />
                            ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
};
