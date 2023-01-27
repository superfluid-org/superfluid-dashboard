import {
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
  onChange: (newValue: T) => void;
}

function TableFilterRow<T extends Key>({
  value,
  options,
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
      <TableCell colSpan={6}>
        <Stack direction="row" alignItems="center" gap={1}>
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
