import {
  Checkbox,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import { AllEvents } from "../../utils/activityUtils";

export enum ActivityType {
  Streams = "Streams",
  Distributions = "Distributions",
  Transfers = "Transfers",
  WrapUnwrap = "Wrap / Unwrap",
  Vesting = "Vesting"
}

export const AllActivityTypes = [
  ActivityType.Streams,
  ActivityType.Distributions,
  ActivityType.Transfers,
  ActivityType.WrapUnwrap,
  ActivityType.Vesting
];

interface ActivityFilter {
  key: ActivityType;
  filter: (keyEvent: AllEvents, address: Address) => boolean;
}

export const ActivityTypeFilters: ActivityFilter[] = [
  {
    key: ActivityType.Streams,
    filter: (keyEvent: AllEvents) => {
      return [
        "FlowUpdated",
        "AgreementLiquidatedBy",
        "AgreementLiquidatedV2",
      ].includes(keyEvent.name);
    },
  },
  {
    key: ActivityType.Distributions,
    filter: (keyEvent: AllEvents) =>
      [
        "IndexCreated",
        "IndexUpdated",
        "IndexSubscribed",
        "IndexUnsubscribed",
        "IndexDistributionClaimed",
        "IndexUnitsUpdated",
      ].includes(keyEvent.name),
  },

  {
    key: ActivityType.Transfers,
    filter: (keyEvent: AllEvents) => keyEvent.name === "Transfer",
  },
  {
    key: ActivityType.WrapUnwrap,
    filter: (keyEvent: AllEvents) =>
      ["Minted", "Burned"].includes(keyEvent.name),
  },
  {
    key: ActivityType.Vesting,
    filter: (keyEvent: AllEvents) =>
      ["VestingCliffAndFlowExecuted", "VestingEndExecuted", "VestingEndFailed", "VestingScheduleCreated", "VestingScheduleDeleted", "VestingScheduleUpdated", "VestingClaimed"].includes(keyEvent.name),
  },
];

interface ActivityTypeFilterProps {
  enabledActivities: Array<ActivityType>;
  anchorEl: HTMLElement | null;
  onChange: (enabledActivities: Array<ActivityType>) => void;
  onClose: () => void;
}

const ActivityTypeFilter: FC<ActivityTypeFilterProps> = ({
  enabledActivities,
  anchorEl,
  onChange,
  onClose,
}) => {
  const theme = useTheme();

  const toggleActivity = (type: ActivityType) => () => {
    if (enabledActivities.includes(type)) {
      onChange(enabledActivities.filter((t) => t !== type));
    } else {
      onChange([...enabledActivities, type]);
    }
  };

  return (
    <Menu
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      PaperProps={{
        sx: { mt: theme.spacing(1.5), minWidth: "280px" },
        square: true,
      }}
      transformOrigin={{ horizontal: "left", vertical: "top" }}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
    >
      {ActivityTypeFilters.map(({ key }) => (
        <MenuItem
          data-cy={`${key}-row`}
          key={key}
          onClick={toggleActivity(key)}
        >
          <ListItemText
            primaryTypographyProps={{ variant: "menuItem" }}
            translate="yes"
          >
            {key}
          </ListItemText>
          <Checkbox
            data-cy={`${key}-toggle`}
            checked={enabledActivities.includes(key)}
          />
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ActivityTypeFilter;
