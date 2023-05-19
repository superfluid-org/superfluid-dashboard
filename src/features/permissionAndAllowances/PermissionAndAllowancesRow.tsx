import { Stack, Switch, TableCell, TableRow, Typography, useMediaQuery } from "@mui/material";
import { FC, useState } from "react";
import { Address } from "@superfluid-finance/sdk-core";
import TokenIcon from "../token/TokenIcon";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import AddressName from "../../components/AddressName/AddressName";
import { useTheme } from "@emotion/react";
import Amount from "../token/Amount";
import EditIcon from "@mui/icons-material/Edit";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import RevokeButton from "./RevokeButton";
import SaveButton from "./SaveButton";
import { subgraphApi } from "../redux/store";
import AllowanceEditDialog from "./dialogs/AllowanceEditDialog";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { FlowRateEther } from "../send/FlowRateInput";
import { UnitOfTime } from "../send/FlowRateInput";
import { BigNumber } from "ethers";


export type PermissionAndAllowancesProps = {
  flowRateAllowance: {
    amountEther: BigNumber;
    unitOfTime: UnitOfTime;
  };
  flowOperatorPermissions: number;
  tokenAllowance: BigNumber;
};

interface PermissionAndAllowancesRowProps {
  address: Address;
  accessSettingsLoading?: boolean;
  token: {
    address: string,
  }
  tokenAllowance: string;
  flowOperatorPermissions: number;
  flowRateAllowance: string;
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


const PermissionAndAllowancesRow: FC<PermissionAndAllowancesRowProps> = ({
  address,
  accessSettingsLoading,
  token,
  tokenAllowance,
  flowOperatorPermissions,
  flowRateAllowance,
}) => {

  const [permissionsAndAllowances, setPermissionsAndAllowances] = useState<PermissionAndAllowancesProps>(
    {
      tokenAllowance: BigNumber.from(tokenAllowance),
      flowOperatorPermissions: flowOperatorPermissions,
      flowRateAllowance: {
        amountEther: BigNumber.from(flowRateAllowance),
        unitOfTime: UnitOfTime.Second
      },
    }
  );

  const [permissionCodes, setPermissionCodes] = useState(getPermissionsFromCode(permissionsAndAllowances.flowOperatorPermissions as PermissionType));

  const [isDialogOpen, setDialogOpen] = useState(false);

  const [editType, setEditType] = useState<"EDIT_ERC20" | "EDIT_STREAM">();

  const { network } = useExpectedNetwork();

  const theme = useTheme();

  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const handlePermissionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    console.log( permissionCodes, value)
    const checked = event.target.checked;
    if (checked && !permissionCodes.includes(value)) {
      setPermissionCodes([...permissionCodes, value]);
    } else if (!checked && permissionCodes.includes(value)) {
      const index = permissionCodes.indexOf(value);
      setPermissionCodes([...permissionCodes.slice(0, index), ...permissionCodes.slice(index + 1)]);
    }
  };

  const { data: tokenInfo } = subgraphApi.useTokenQuery({
    id: token.address,
    chainId: network.id,
  });

  const updatedProperty = <K extends keyof PermissionAndAllowancesProps>(
    key: K,
    value: PermissionAndAllowancesProps[K]
  ): void => {
    setPermissionsAndAllowances({
      ...permissionsAndAllowances,
      [key]: value,
    })
  };

  const isRevokeAllowed = permissionsAndAllowances.flowOperatorPermissions !== -1 || permissionsAndAllowances.tokenAllowance.gt(0) || permissionsAndAllowances.flowRateAllowance.amountEther.gt(0);
  console.log(isRevokeAllowed, permissionsAndAllowances)

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
        <Amount decimals={tokenInfo?.decimals} wei={permissionsAndAllowances.tokenAllowance} >{` ${tokenInfo?.symbol}`}</Amount>
        <EditIcon
          fontSize="inherit"
          sx={{
            cursor: "pointer",
          }}
          onClick={() => {
            setEditType("EDIT_ERC20");
            setDialogOpen(true);
          }}
        ></EditIcon>
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="column" alignItems="center" gap={"10px"}>
        <Stack direction="row" alignItems="center" gap={"14px"}>
          <Switch color="primary" checked={permissionCodes.includes(Permission.CREATE)} value={Permission.CREATE}
            onChange={handlePermissionChange} />
          <Stack direction="row" alignItems="center" gap={"8px"}>
            <Typography data-cy={"access-setting-address"} variant="h7">
              Create
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="column" alignItems="center" gap={"10px"}>
        <Stack direction="row" alignItems="center" gap={"14px"}>
          <Switch color="primary" checked={permissionCodes.includes(Permission.UPDATE)} value={Permission.UPDATE}
            onChange={handlePermissionChange} />
          <Stack direction="row" alignItems="center" gap={"8px"}>
            <Typography data-cy={"access-setting-address"} variant="h7">
              Update
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="column" alignItems="center" gap={"10px"}>
        <Stack direction="row" alignItems="center" gap={"14px"}>
          <Switch color="primary" checked={permissionCodes.includes(Permission.DELETE)} value={Permission.DELETE} onChange={handlePermissionChange} />
          <Stack direction="row" alignItems="center" gap={"8px"}>
            <Typography data-cy={"access-setting-address"} variant="h7">
              Delete
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Amount decimals={tokenInfo?.decimals} decimalPlaces={9} wei={permissionsAndAllowances.flowRateAllowance.amountEther} >{` ${tokenInfo?.symbol}/ ${UnitOfTime[permissionsAndAllowances.flowRateAllowance.unitOfTime]}`}</Amount>
        <EditIcon
          fontSize="inherit"
          sx={{
            cursor: "pointer",
          }}
          onClick={() => {
            setEditType("EDIT_STREAM");
            setDialogOpen(true);
          }}
        />
      </Stack>
    </TableCell>
    <TableCell>
      <Stack direction="column" alignItems="center" gap={0.8}>
        <SaveButton network={network} operatorAddress={address} tokenAddress={token.address} key={`save-${address}-${token.address}`} permissionsAndAllowances={permissionsAndAllowances} />
        {isRevokeAllowed && <RevokeButton network={network} operatorAddress={address} tokenAddress={token.address} key={`revoke-${address}-${token.address}`} />}
      </Stack>
    </TableCell>
    {
      editType &&
      <ResponsiveDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { borderRadius: "20px", maxHeight: "100%" } }} translate="yes">
        <AllowanceEditDialog onSaveChanges={updatedProperty} onClose={() => setDialogOpen(false)} permissionsAndAllowances={permissionsAndAllowances} editType={editType}></AllowanceEditDialog>
      </ResponsiveDialog>
    }
  </TableRow>
}

export default PermissionAndAllowancesRow;
