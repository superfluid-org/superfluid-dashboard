import { FC } from "react";
import { TableCell, TableRow, Typography } from "@mui/material";

interface EmptyRowProps {
  span: number;
  height?: number;
}

export const EmptyRow: FC<EmptyRowProps> = ({ span, height = 58 }) => (
  <TableRow>
    <TableCell colSpan={span} align="center" sx={{ height }}>
      <Typography variant="h6">No data</Typography>
    </TableCell>
  </TableRow>
);
