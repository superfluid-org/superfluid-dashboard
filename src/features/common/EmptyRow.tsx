import { FC } from "react";
import {
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

interface EmptyRowProps {
  span: number;
  height?: number;
}

export const EmptyRow: FC<EmptyRowProps> = ({ span, height = 58 }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow data-cy={"no-data-row"}>
      <TableCell colSpan={span} align="center" sx={{ height }}>
        <Typography
          data-cy={"no-data-message"}
          variant={isBelowMd ? "body2" : "body1"}
          translate="yes"
        >
          No data
        </Typography>
      </TableCell>
    </TableRow>
  );
};
