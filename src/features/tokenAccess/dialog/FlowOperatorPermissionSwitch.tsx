import {
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ACL_CREATE_PERMISSION_LABEL,
  ACL_DELETE_PERMISSION_LABEL,
  ACL_UPDATE_PERMISSION_LABEL,
} from "../../../utils/flowOperatorPermissionsToString";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
  ACL_UPDATE_PERMISSION,
} from "../../redux/endpoints/flowSchedulerEndpoints";
import { FC } from "react";

interface Permission {
  name: string;
  value: number;
  label: string;
}

const permissions: Permission[] = [
  {
    name: ACL_CREATE_PERMISSION_LABEL,
    value: ACL_CREATE_PERMISSION,
    label: ACL_CREATE_PERMISSION_LABEL,
  },
  {
    name: ACL_UPDATE_PERMISSION_LABEL,
    value: ACL_UPDATE_PERMISSION,
    label: ACL_UPDATE_PERMISSION_LABEL,
  },
  {
    name: ACL_DELETE_PERMISSION_LABEL,
    value: ACL_DELETE_PERMISSION,
    label: ACL_DELETE_PERMISSION_LABEL,
  },
];

export const FlowOperatorPermissionSwitch: FC<{
  currentPermissions: number;
  onChange: (permission: number) => void;
  onBlur: () => void;
}> = ({ currentPermissions, onChange, onBlur }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const isPermissionActive = (permissionValue: number) =>
    (currentPermissions & permissionValue) !== 0;

  const renderSwitch = (permission: Permission) => (
    <Stack key={permission.name} direction="row" alignItems="center">
      <Switch
        color="primary"
        checked={isPermissionActive(permission.value)}
        value={permission.value}
        onChange={() => onChange(currentPermissions ^ permission.value)}
        onBlur={onBlur}
      />
      <Typography variant="h6">{permission.label}</Typography>
    </Stack>
  );

  return (
    <Stack
      direction={isBelowMd ? "column" : "row"}
      justifyContent={"space-between"}
    >
      {permissions.map(renderSwitch)}
    </Stack>
  );
};
