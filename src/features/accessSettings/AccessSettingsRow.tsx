import { Button, CircularProgress, IconButton, ListItem, ListItemAvatar, Stack, Switch, TableCell, TableRow, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery } from "@mui/material";
import { FC, useState } from "react";
import { Address } from "@superfluid-finance/sdk-core";
import TokenIcon from "../token/TokenIcon";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import AddressName from "../../components/AddressName/AddressName";
import { useTheme } from "@emotion/react";
import Amount from "../token/Amount";
import EditIcon from "@mui/icons-material/Edit";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { subgraphApi } from "../redux/store";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import RevokeAccessSettingsBtn from "./RevokeAccessSettingsBtn";


interface AccessSettingsRowProps {
  address: Address;
  accessSettingsLoading?: boolean;
  token: {
    address: string,
  }
  erc20Allowance: string;
  streamPermissions: number;
  streamAllowance: string;
  handleEditRecord: (record: {
    allowance: string,
    token: {
      address: string,
    }
    operator: string,
    editType: "EDIT_ERC20" | "EDIT_STREAM",
  }) => void;
}

type PermissionType = 1 | 2 | 3;

enum Permission {
  CREATE = 1,
  UPDATE = 2,
  DELETE = 4,
}

const getCodeFromPermissions = (permissions: Permission[]): number => {
  let permission = -1;
  permissions.forEach(action => {
    switch (action) {
      case Permission.CREATE:
        permission |= Permission.CREATE;
        break;
      case Permission.UPDATE:
        permission |= Permission.UPDATE;
        break;
      case Permission.DELETE:
        permission |= Permission.DELETE;
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  });
  return permission;
}

const getPermissionsFromCode = (permission: PermissionType): Permission[] => {
  const permissions: Permission[] = [];
  if (permission & Permission.CREATE) {
    permissions.push(Permission.CREATE);
  }
  if (permission & Permission.UPDATE) {
    permissions.push(Permission.UPDATE);
  }
  if (permission & Permission.DELETE) {
    permissions.push(Permission.DELETE);
  }
  if (permissions.length === 0) {
    throw new Error(`Unsupported action code: ${permission}`);
  }
  return permissions;
}

const AccessSettingsRow: FC<AccessSettingsRowProps> = ({
  address,
  accessSettingsLoading,
  token,
  erc20Allowance,
  streamPermissions,
  streamAllowance,
  handleEditRecord,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { network } = useExpectedNetwork();

  const [permissions, setPermissions] = useState(getPermissionsFromCode(streamPermissions as PermissionType));

  const handlePermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    const checked = event.target.checked;
    if (checked && !permissions.includes(value)) {
      setPermissions([...permissions, value]);
    } else if (!checked && permissions.includes(value)) {
      const index = permissions.indexOf(value);
      setPermissions([...permissions.slice(0, index), ...permissions.slice(index + 1)]);
    }
  };

  const { data: tokenInfo } = subgraphApi.useTokenQuery({
    id: token.address,
    chainId: network.id,
  });

  return <TableRow>
    <TableCell align="left">
      <Stack data-cy={"token-header"} direction="row" alignItems="center" gap={2}>
        <TokenIcon isSuper tokenSymbol={tokenInfo?.symbol} />
        <Typography data-cy={"token-symbol"}>
          {tokenInfo?.symbol}
        </Typography>
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <AddressAvatar
          address={address}
          AvatarProps={{
            sx: { width: "24px", height: "24px", borderRadius: "5px" },
          }}
          BlockiesProps={{ size: 8, scale: 3 }}
        />
        <AddressCopyTooltip address={address}>
          <Typography data-cy={"access-setting-address"} variant="h7">
            <AddressName address={address} />
          </Typography>
        </AddressCopyTooltip>
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Amount decimals={tokenInfo?.decimals} wei={erc20Allowance} >{` ${tokenInfo?.symbol}`}</Amount>
        <EditIcon fontSize={"inherit"} onClick={() => {
          handleEditRecord({
            allowance: erc20Allowance,
            token: token,
            operator: address,
            editType: "EDIT_ERC20",
          })
        }} />
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="column" alignItems="center" gap={"10px"}>
        <Stack direction="row" alignItems="center" gap={"14px"}>
          <Switch color="primary" checked={permissions.includes(Permission.CREATE)} value={Permission.CREATE}
            onChange={handlePermissionChange} />
          <Stack direction="row" alignItems="center" gap={"8px"}>
            <Typography data-cy={"access-setting-address"} variant="h7">
              Create
            </Typography>
            {/* <CircularProgress size={16} /> */}
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="column" alignItems="center" gap={"10px"}>
        <Stack direction="row" alignItems="center" gap={"14px"}>
          <Switch color="primary" checked={permissions.includes(Permission.UPDATE)} value={Permission.UPDATE}
            onChange={handlePermissionChange} />
          <Stack direction="row" alignItems="center" gap={"8px"}>
            <Typography data-cy={"access-setting-address"} variant="h7">
              Update
            </Typography>
            {/* <CircularProgress size={16} /> */}
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="column" alignItems="center" gap={"10px"}>
        <Stack direction="row" alignItems="center" gap={"14px"}>
          <Switch color="primary" checked={permissions.includes(Permission.DELETE)} value={Permission.DELETE} onChange={handlePermissionChange} />
          <Stack direction="row" alignItems="center" gap={"8px"}>
            <Typography data-cy={"access-setting-address"} variant="h7">
              Delete
            </Typography>
            {/* <CircularProgress size={16} /> */}
          </Stack>
        </Stack>
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Amount decimals={tokenInfo?.decimals} decimalPlaces={9} wei={streamAllowance} >{` ${tokenInfo?.symbol}/ sec`}</Amount>
        <EditIcon fontSize={"inherit"} onClick={() => {
          handleEditRecord({
            allowance: streamAllowance,
            token: token,
            operator: address,
            editType: "EDIT_STREAM",
          })
        }} />
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={0.8}>
        <RevokeAccessSettingsBtn network={network} operatorAddress={address} tokenAddress={token.address} key={`${address}-${token.address}`} />
      </Stack>
    </TableCell>
  </TableRow>
}

export default AccessSettingsRow;
