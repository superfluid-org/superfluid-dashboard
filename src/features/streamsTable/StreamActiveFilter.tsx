import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import { FC } from "react";

export enum StreamActiveType {
  All = "All Streams",
  Active = "Has Active Streams",
  NoActive = "Has No Active Streams",
}

const FILTER_OPTIONS = [
  { key: StreamActiveType.All, icon: ListRoundedIcon },
  { key: StreamActiveType.Active, icon: CheckRoundedIcon },
  { key: StreamActiveType.NoActive, icon: CloseRoundedIcon },
];

interface StreamActiveFilterProps {
  anchorEl: HTMLElement | null;
  onChange: (filter: StreamActiveType) => void;
  onClose: () => void;
}

const StreamActiveFilter: FC<StreamActiveFilterProps> = ({
  anchorEl,
  onChange,
  onClose,
}) => {
  const theme = useTheme();

  const onSelectFilter = (filter: StreamActiveType) => () => onChange(filter);

  return (
    <Menu
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      PaperProps={{
        square: true,
        elevation: 2,
        sx: { mt: theme.spacing(1.5), minWidth: "260px" },
      }}
      transformOrigin={{ horizontal: "left", vertical: "top" }}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
    >
      {FILTER_OPTIONS.map(({ key, icon: Icon }) => (
        <MenuItem key={key} onClick={onSelectFilter(key)}>
          <ListItemIcon
            sx={{
              color: "text.primary",
            }}
          >
            <Icon sx={{ fontSize: "20px" }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: "menuItem" }}>
            {key}
          </ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
};

export default StreamActiveFilter;
