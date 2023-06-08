import { Button, Stack, useMediaQuery, useTheme } from "@mui/material";
import { FC, useCallback } from "react";

export enum TimeUnitFilterType {
  Day = "1D",
  Week = "7D",
  Month = "1M",
  Quarter = "3M",
  Year = "1Y",
  YTD = "YTD",
  All = "All",
}

const DEFAULT_FILTER = [
  TimeUnitFilterType.Day,
  TimeUnitFilterType.Week,
  TimeUnitFilterType.Month,
  TimeUnitFilterType.Quarter,
  TimeUnitFilterType.Year,
  TimeUnitFilterType.YTD,
  TimeUnitFilterType.All,
];

interface TimeUnitFilterProps {
  activeFilter: TimeUnitFilterType;
  onChange: (newFilter: TimeUnitFilterType) => void;
  options?: Array<TimeUnitFilterType>;
}

const TimeUnitFilter: FC<TimeUnitFilterProps> = ({
  activeFilter,
  onChange,
  options = DEFAULT_FILTER,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const onFilterTypeChange = (newFilter: TimeUnitFilterType) => () =>
    onChange(newFilter);

  const getFilterColor = useCallback(
    (filter: TimeUnitFilterType) =>
      activeFilter === filter ? "primary" : "secondary",
    [activeFilter]
  );

  return (
    <Stack direction="row" gap={isBelowMd ? 0.25 : 0.5}>
      {options.map((option) => (
        <Button
          key={option}
          variant="textContained"
          color={getFilterColor(option)}
          onClick={onFilterTypeChange(option)}
          size="xs"
        >
          {option}
        </Button>
      ))}
    </Stack>
  );
};

export default TimeUnitFilter;
