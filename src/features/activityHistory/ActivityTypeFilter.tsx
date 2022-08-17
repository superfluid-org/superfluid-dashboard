import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Switch,
  useTheme,
} from "@mui/material";
import {
  Address,
  AllEvents,
  FlowUpdateType,
} from "@superfluid-finance/sdk-core";
import { FC } from "react";

export enum ActivityType {
  SendStream = "Send Stream",
  ReceiveStream = "Receive Stream",
  StreamUpdated = "Stream Updated",
  StreamCancelled = "Stream Cancelled",
  SendTransfer = "Send Transfer",
  ReceiveTransfer = "Receive Transfer",
  Wrap = "Wrap",
  Unwrap = "Unwrap",
  Liquidated = "Liquidated",
}

export const AllActivityTypes = [
  ActivityType.SendStream,
  ActivityType.ReceiveStream,
  ActivityType.StreamUpdated,
  ActivityType.StreamCancelled,
  ActivityType.SendTransfer,
  ActivityType.ReceiveTransfer,
  ActivityType.Wrap,
  ActivityType.Unwrap,
  ActivityType.Liquidated,
];

interface ActivityFilter {
  key: ActivityType;
  icon: typeof SvgIcon;
  filter: (keyEvent: AllEvents, address: Address) => boolean;
}

export const ActivityTypeFilters: ActivityFilter[] = [
  {
    key: ActivityType.SendStream,
    icon: ArrowForwardIcon,
    filter: (keyEvent: AllEvents, address: Address) =>
      keyEvent.name === "FlowUpdated" &&
      keyEvent.type === FlowUpdateType.Create &&
      keyEvent.sender === address.toLowerCase(),
  },
  {
    key: ActivityType.ReceiveStream,
    icon: ArrowBackIcon,
    filter: (keyEvent: AllEvents, address: Address) =>
      keyEvent.name === "FlowUpdated" &&
      keyEvent.type === FlowUpdateType.Create &&
      keyEvent.receiver === address.toLowerCase(),
  },
  {
    key: ActivityType.StreamUpdated,
    icon: EditIcon,
    filter: (keyEvent: AllEvents) =>
      keyEvent.name === "FlowUpdated" &&
      keyEvent.type === FlowUpdateType.Update,
  },
  {
    key: ActivityType.StreamCancelled,
    icon: CloseIcon,
    filter: (keyEvent: AllEvents) =>
      keyEvent.name === "FlowUpdated" &&
      keyEvent.type === FlowUpdateType.Terminate,
  },
  {
    key: ActivityType.SendTransfer,
    icon: ArrowForwardIcon,
    filter: (keyEvent: AllEvents, address: Address) =>
      keyEvent.name === "Transfer" &&
      keyEvent.from.toLowerCase() === address.toLowerCase(),
  },
  {
    key: ActivityType.ReceiveTransfer,
    icon: ArrowBackIcon,
    filter: (keyEvent: AllEvents, address: Address) =>
      keyEvent.name === "Transfer" &&
      keyEvent.to.toLowerCase() === address.toLowerCase(),
  },
  {
    key: ActivityType.Wrap,
    icon: SwapVertIcon,
    filter: (keyEvent: AllEvents) => keyEvent.name === "Minted",
  },
  {
    key: ActivityType.Unwrap,
    icon: SwapVertIcon,
    filter: (keyEvent: AllEvents) => keyEvent.name === "Burned",
  },
  {
    key: ActivityType.Liquidated,
    icon: PriorityHighIcon,
    filter: (keyEvent: AllEvents) =>
      ["AgreementLiquidatedBy", "AgreementLiquidatedV2"].includes(
        keyEvent.name
      ),
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
      {ActivityTypeFilters.map(({ key, icon: Icon }) => (
        <MenuItem data-cy={`${key}-row`} key={key}>
          <ListItemIcon
            sx={{
              // mr: 0,
              color: "text.primary",
            }}
          >
            <Icon sx={{ fontSize: "20px" }} />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ variant: "menuItem" }}
            translate="yes"
          >
            {key}
          </ListItemText>
          <Switch
            data-cy={`${key}-toggle`}
            checked={enabledActivities.includes(key)}
            onChange={toggleActivity(key)}
          />
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ActivityTypeFilter;
