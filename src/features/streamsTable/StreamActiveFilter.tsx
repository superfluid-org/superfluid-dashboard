import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ListRoundedIcon from "@mui/icons-material/ListRounded";
import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, MouseEvent, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";

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
  activeType: StreamActiveType;
  onChange: (filter: StreamActiveType) => void;
}

const StreamActiveFilter: FC<StreamActiveFilterProps> = ({
  activeType,
  onChange,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const onSelectFilter = (filter: StreamActiveType) => () => {
    onChange(filter);
    closeFilterMenu();
  };

  const openFilterMenu = (e: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);

  const closeFilterMenu = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size={isBelowMd ? "small" : "medium"}
        onClick={openFilterMenu}
        endIcon={<OpenIcon open={!!anchorEl} />}
      >
        <span>{activeType}</span>
      </Button>
      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={closeFilterMenu}
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
            <ListItemText
              primaryTypographyProps={{ variant: "menuItem" }}
              translate="yes"
            >
              {key}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default StreamActiveFilter;
