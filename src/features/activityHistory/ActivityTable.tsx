import {
  TableContainer,
  Table,
  TableBody,
  useTheme,
  Paper,
} from "@mui/material";
import { FC } from "react";
import { Activities } from "../../utils/activityUtils";
import ActivityRow from "./ActivityRow";

interface ActivitiesTableProps {
  activities: Activities[];
  dateFormat?: string;
}

const ActivityTable: FC<ActivitiesTableProps> = ({
  activities,
  dateFormat = "HH:mm",
}) => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
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
                width: "170px",
              },
            },
          },
        }}
      >
        <TableBody>
          {activities.map((activity) => (
            <ActivityRow
              key={activity.keyEvent.id}
              activity={activity}
              dateFormat={dateFormat}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ActivityTable;
