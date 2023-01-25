import {
  Button,
  Stack,
  TableCell,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useCallback } from "react";

interface TableFilterOption {
  title: string;
  value: any;
}

interface TableFilterRowProps {
  value: any;
  options: TableFilterOption[];
  onChange: (newValue: any) => void;
}

const TableFilterRow: FC<TableFilterRowProps> = ({
  value,
  options,
  onChange,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const getFilterBtnColor = useCallback(
    (type: any) => (type === value ? "primary" : "secondary"),
    [value]
  );

  const onFilterClick = (newValue: any) => () => onChange(newValue);

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
};

export default TableFilterRow;
