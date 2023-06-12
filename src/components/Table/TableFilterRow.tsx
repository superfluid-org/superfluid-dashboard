import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Key, useCallback } from "react";

interface TableFilterOption<T extends Key> {
  title: string;
  value: T;
}

interface TableFilterRowProps<T extends Key> {
  value: T;
  options: TableFilterOption<T>[];
  colSpan: number;
  onChange: (newValue: T) => void;
}

function TableFilterRow<T extends Key>({
  value,
  options,
  colSpan,
  onChange,
}: TableFilterRowProps<T>) {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const getFilterBtnColor = useCallback(
    (type: T) => (type === value ? "primary" : "secondary"),
    [value]
  );

  const onFilterClick = (newValue: T) => () => onChange(newValue);

  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{ [theme.breakpoints.down("md")]: { p: 0 } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{
            overflowX: "auto",
            [theme.breakpoints.down("md")]: {
              px: 2,
              py: 1,
            },
          }}
        >
          {options.map((option) => (
            <Button
              key={option.value}
              variant="textContained"
              size={isBelowMd ? "small" : "medium"}
              color={getFilterBtnColor(option.value)}
              onClick={onFilterClick(option.value)}
            >
              {option.title}
            </Button>
          ))}
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default TableFilterRow;
