import { FC } from "react";
import { TableCell, TableRow, Typography } from "@mui/material";

interface EmptyRowProps {
  span: number;
  height?: number;
}

export const EmptyRow: FC<EmptyRowProps> = ({ span, height = 58 }) => (
  <TableRow data-cy={"no-data-row"}>
    <TableCell colSpan={span} align="center" sx={{ height }}>
      <Typography data-cy={"no-data-message"} variant="h6" translate="yes">
        No data
      </Typography>
    </TableCell>
  </TableRow>
);
