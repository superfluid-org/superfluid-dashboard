import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  alpha,
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import {
  addMonths,
  format,
  getDaysInMonth,
  isSameDay,
  isSameMonth,
  lastDayOfMonth,
  startOfDay,
  startOfMonth,
} from "date-fns";
import times from "lodash/times";
import { FC, memo, useCallback, useMemo, useState } from "react";
import DatePickerDay from "./DatePickerDay";

const WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface DatePickerProps {
  anchorEl: HTMLElement | null;
  startDate: Date;
  endDate: Date;
  maxDate?: Date;
  onChange: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
}

const DatePicker: FC<DatePickerProps> = ({
  anchorEl,
  startDate,
  endDate,
  maxDate,
  onChange,
  onClose,
}) => {
  const currentDate = useMemo(() => new Date(), []);
  const theme = useTheme();

  const [date, setDate] = useState(startOfMonth(currentDate));

  const [settingStart, setSettingStart] = useState(true);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const daysInMonth = useMemo(
    () =>
      times(getDaysInMonth(date), (day) =>
        startOfDay(new Date(date.getFullYear(), date.getMonth(), day + 1))
      ),
    [date]
  );

  const buffer = useMemo(() => (date.getDay() + 6) % 7, [date]);
  const showingCurrentMonth = useMemo(
    () => isSameMonth(date, currentDate),
    [date, currentDate]
  );

  const monthBack = () => setDate(addMonths(date, -1));
  const monthForward = () => setDate(addMonths(date, 1));

  const onDateClick = useCallback(
    (date: Date) => () => {
      if (date > endDate) {
        onChange(startDate, date);
        setSettingStart(true);
      } else if (date < startDate) {
        onChange(date, endDate);
        setSettingStart(false);
      } else if (settingStart) {
        onChange(date, endDate);
        setSettingStart(false);
      } else {
        onChange(startDate, date);
        setSettingStart(true);
      }
    },
    [startDate, endDate, settingStart, onChange]
  );

  const onDateMouseEnter = (date: Date) => () => {
    setHoveredDate(date);
  };

  const onDateMouseLeave = (date: Date) => () => {
    if (hoveredDate === date) {
      setHoveredDate(null);
    }
  };

  const isStartDate = useCallback(
    (date: Date) => isSameDay(date, startDate),
    [startDate]
  );

  const isEndDate = useCallback(
    (date: Date) => isSameDay(date, endDate),
    [endDate]
  );

  const isHighlighted = useCallback(
    (date: Date) =>
      hoveredDate
        ? (date >= hoveredDate && date <= startDate) ||
          (date >= endDate && date <= hoveredDate)
        : false,
    [startDate, endDate, hoveredDate]
  );

  const beforeOrStartDate = useCallback(
    (date: Date) => date <= startDate,
    [startDate]
  );

  const afterOrEndDate = useCallback(
    (date: Date) => date >= endDate,
    [endDate]
  );

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      PaperProps={{
        square: true,
        sx: { py: 2, px: 3, mt: theme.spacing(1.5) },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6">{format(date, "MMMM yyyy")}</Typography>

        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton onClick={monthBack}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={monthForward} disabled={showingCurrentMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 36px)",
          textAlign: "center",
          rowGap: 0.25,
        }}
      >
        {WEEK_LABELS.map((value, index) => (
          <Typography
            key={`heading-${index}`}
            variant="caption"
            sx={{ mb: 1.25, lineHeight: "40px", color: "text.secondary" }}
          >
            {value}
          </Typography>
        ))}

        {times(buffer, (index) => (
          <Box key={`buffer-${index}`} />
        ))}

        {daysInMonth.map((date) => (
          <DatePickerDay
            key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
            date={date}
            isDisabled={!!maxDate && date > maxDate}
            isStartDate={isStartDate(date)}
            isEndDate={isEndDate(date)}
            isHovered={hoveredDate === date}
            isHighlighted={isHighlighted(date)}
            beforeOrStartDate={beforeOrStartDate(date)}
            afterOrEndDate={afterOrEndDate(date)}
            onClick={onDateClick(date)}
            onMouseEnter={onDateMouseEnter(date)}
            onMouseLeave={onDateMouseLeave(date)}
          />
        ))}
      </Stack>
    </Popover>
  );
};

export default memo<DatePickerProps>(DatePicker);
