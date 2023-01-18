import { TableContainer, Table, TableBody, useTheme } from "@mui/material";
import { FC } from "react";
import { Activities } from "../../utils/activityUtils";
import ActivityRow from "./ActivityRow";

interface ActivitiesTableProps {
  activities: Activities[];
}

const ActivityTable: FC<ActivitiesTableProps> = ({ activities }) => {
  const theme = useTheme();

  return (
    <TableContainer
      sx={{
        [theme.breakpoints.down("md")]: {
          borderLeft: 0,
          borderRight: 0,
          borderRadius: 0,
          boxShadow: "none",
          mx: -2,
          width: "auto",
        },
      }}
    >
      <Table
        sx={{
          // TODO: Make all table layouts fixed
          [theme.breakpoints.up("md")]: {
            tableLayout: "fixed",
            td: {
              "&:nth-of-type(1)": {
                width: "30%",
              },
              "&:nth-of-type(2)": {
                width: "30%",
              },
              "&:nth-of-type(3)": {
                width: "30%",
              },
              "&:nth-of-type(4)": {
                width: "140px",
              },
            },
          },
        }}
      >
        <TableBody>
          {activities.map((activity) => (
            <ActivityRow key={activity.keyEvent.id} activity={activity} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ActivityTable;
