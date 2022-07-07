import { alpha, styled, Button } from "@mui/material";
import { isSameDay, lastDayOfMonth } from "date-fns";
import { FC, memo, useMemo } from "react";

interface DayWrapperProps {
  beforeOrStartDate: boolean;
  afterOrEndDate: boolean;
  isHighlighted: boolean;
  isStartDate: boolean;
  isEndDate: boolean;
  firstDayOfRow: boolean;
  lastDayOfRow: boolean;
  isHovered: boolean;
}

const DayWrapper = styled("div", {
  shouldForwardProp: (prop: string) =>
    ![
      "beforeOrStartDate",
      "afterOrEndDate",
      "isHighlighted",
      "isStartDate",
      "isEndDate",
      "firstDayOfRow",
      "lastDayOfRow",
      "isHovered",
    ].includes(prop),
})<DayWrapperProps>(
  ({
    theme,
    beforeOrStartDate,
    afterOrEndDate,
    isHighlighted,
    isStartDate,
    isEndDate,
    firstDayOfRow,
    lastDayOfRow,
    isHovered,
  }) => ({
    position: "relative",

    ...(((!beforeOrStartDate && !afterOrEndDate) ||
      isStartDate ||
      isEndDate) && {
      "&::before": {
        content: `""`,
        position: "absolute",
        zIndex: 1,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: alpha(theme.palette.primary.main, 0.08),

        ...((firstDayOfRow || isStartDate) && {
          borderTopLeftRadius: "50%",
          borderBottomLeftRadius: "50%",
        }),

        ...((lastDayOfRow || isEndDate) && {
          borderTopRightRadius: "50%",
          borderBottomRightRadius: "50%",
        }),
      },
    }),

    ...(isHighlighted && {
      "&::after": {
        content: `""`,
        position: "absolute",
        zIndex: 2,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: `2px dashed transparent`,

        ...(isHighlighted && {
          borderColor: `${theme.palette.action.disabled} transparent ${theme.palette.action.disabled} transparent`,
        }),

        ...((firstDayOfRow ||
          isEndDate ||
          (isHovered && beforeOrStartDate)) && {
          borderLeftColor: theme.palette.action.disabled,
          borderTopLeftRadius: "50%",
          borderBottomLeftRadius: "50%",
        }),

        ...((lastDayOfRow || isStartDate || (isHovered && afterOrEndDate)) && {
          borderRightColor: theme.palette.action.disabled,
          borderTopRightRadius: "50%",
          borderBottomRightRadius: "50%",
        }),
      },
    }),
  })
);

interface DatePickerDayProps {
  date: Date;
  isDisabled: boolean;
  isStartDate: boolean;
  isEndDate: boolean;
  isHovered: boolean;
  isHighlighted: boolean;
  beforeOrStartDate: boolean;
  afterOrEndDate: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const DatePickerDay: FC<DatePickerDayProps> = ({
  date,
  isDisabled,
  isStartDate,
  isEndDate,
  isHovered,
  isHighlighted,
  beforeOrStartDate,
  afterOrEndDate,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const firstDayOfRow = useMemo(
    () => date.getDay() === 1 || date.getDate() === 1,
    [date]
  );
  const lastDayOfRow = useMemo(
    () => date.getDay() === 0 || isSameDay(date, lastDayOfMonth(date)),
    [date]
  );

  const isActive = useMemo(
    () => (!beforeOrStartDate && !afterOrEndDate) || isStartDate || isEndDate,
    [beforeOrStartDate, afterOrEndDate, isStartDate, isEndDate]
  );

  return (
    <DayWrapper
      beforeOrStartDate={beforeOrStartDate}
      afterOrEndDate={afterOrEndDate}
      isHighlighted={isHighlighted}
      firstDayOfRow={firstDayOfRow}
      lastDayOfRow={lastDayOfRow}
      isStartDate={isStartDate}
      isEndDate={isEndDate}
      isHovered={isHovered}
    >
      <Button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        color={isStartDate || isEndDate || isActive ? "primary" : "inherit"}
        variant={isStartDate || isEndDate ? "contained" : "text"}
        disabled={isDisabled}
        sx={{
          minWidth: "0",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          zIndex: 3,
        }}
      >
        {date.getDate()}
      </Button>
    </DayWrapper>
  );
};

export default memo<DatePickerDayProps>(DatePickerDay);
