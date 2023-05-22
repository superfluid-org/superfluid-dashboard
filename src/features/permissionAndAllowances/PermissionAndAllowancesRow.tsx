import { Stack, Switch, TableCell, TableRow, Typography, useMediaQuery } from "@mui/material";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "@superfluid-finance/sdk-core";
import TokenIcon from "../token/TokenIcon";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import AddressName from "../../components/AddressName/AddressName";
import { useTheme } from "@emotion/react";
import Amount from "../token/Amount";
import EditIcon from "@mui/icons-material/Edit";
import RevokeButton from "./RevokeButton";
import SaveButton from "./SaveButton";
import { subgraphApi } from "../redux/store";
import AllowanceEditDialog from "./dialogs/AllowanceEditDialog";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { UnitOfTime } from "../send/FlowRateInput";
import { BigNumber } from "ethers";
import { Network } from "../network/networks";
import { SnapshotRowSkeleton } from "./PermissionAndAllowancesLoadingTable";


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
  network: Network;
  token: Address;
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
  let permission = 0;
  permissions.forEach(action => {
    switch (action) {
      case Permission.CREATE:
        permission |= Permission.CREATE;
        break;
      case Permission.UPDATE:
        permission |= Permission.UPDATE;
        break;
      case Permission.DELETE:
      default:
        permission |= Permission.DELETE;
        break;
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
  return permissions;
}


const PermissionAndAllowancesRow: FC<PermissionAndAllowancesRowProps> = ({
  address,
  network,
  token,
  tokenAllowance,
  flowOperatorPermissions,
  flowRateAllowance,
}) => {
  const initialPermissionAndAllowances = useMemo(() => {
    return  {
      tokenAllowance: BigNumber.from(tokenAllowance),
      flowOperatorPermissions: flowOperatorPermissions,
      flowRateAllowance: {
        amountEther: BigNumber.from(flowRateAllowance),
        unitOfTime: UnitOfTime.Second
      },
    }
  },[tokenAllowance, flowOperatorPermissions, flowRateAllowance ]);
  
  const [permissionsAndAllowances, setPermissionsAndAllowances] = useState<PermissionAndAllowancesProps>(initialPermissionAndAllowances);
  const [permissionCodes, setPermissionCodes] = useState(getPermissionsFromCode(initialPermissionAndAllowances.flowOperatorPermissions as PermissionType));

  useEffect(()=>{
    setPermissionsAndAllowances(initialPermissionAndAllowances);
    setPermissionCodes(getPermissionsFromCode(initialPermissionAndAllowances.flowOperatorPermissions as PermissionType));
  },[
    initialPermissionAndAllowances,
  ])

  const [isDialogOpen, setDialogOpen] = useState(false);

  const [editType, setEditType] = useState<"EDIT_ERC20" | "EDIT_STREAM">();

  const handlePermissionChange =(event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    const checked = event.target.checked;
    if (checked && !permissionCodes.includes(value)) {
      const newPermissions = [...permissionCodes, value];
      setPermissionCodes(newPermissions);
      updatedProperty("flowOperatorPermissions", getCodeFromPermissions(newPermissions))
    } else if (!checked && permissionCodes.includes(value)) {
      const index = permissionCodes.indexOf(value);
      const newPermissions = [...permissionCodes.slice(0, index), ...permissionCodes.slice(index + 1)];
      setPermissionCodes(newPermissions);
      updatedProperty("flowOperatorPermissions", getCodeFromPermissions(newPermissions))
    }
  };

  const { data: tokenInfo } = subgraphApi.useTokenQuery({
    id: token,
    chainId: network.id,
  });

  const updatedProperty = useCallback(<K extends keyof PermissionAndAllowancesProps>(
    key: K,
    value: PermissionAndAllowancesProps[K]
  ): void => {
    setPermissionsAndAllowances({
      ...permissionsAndAllowances,
      [key]: value,
    })
  }, [permissionsAndAllowances]);

  const closeDialog = () => setDialogOpen(false);

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
      {tokenInfo && <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="h7" noWrap={true}>
          <Amount decimals={tokenInfo?.decimals} wei={permissionsAndAllowances.tokenAllowance} >{` ${tokenInfo?.symbol}`}</Amount>
        </Typography>

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
      </Stack>}
    </TableCell>
    <TableCell>
      <Stack direction="column" alignItems="center" gap={"2px"}>
        <Stack direction="row" alignItems="center" gap={"10px"}>
          <Switch color="primary" checked={permissionCodes.includes(Permission.CREATE)} value={Permission.CREATE}
            onChange={handlePermissionChange} />
          <Typography data-cy={"access-setting-address"} variant="h7">
            Create
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={"2px"}>
          <Stack direction="row" alignItems="center" gap={"10px"}>
            <Switch color="primary" checked={permissionCodes.includes(Permission.UPDATE)} value={Permission.UPDATE}
              onChange={handlePermissionChange} />
            <Typography data-cy={"access-setting-address"} variant="h7">
              Update
            </Typography>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" gap={"2px"}>
          <Stack direction="row" alignItems="center" gap={"10px"}>
            <Switch color="primary" checked={permissionCodes.includes(Permission.DELETE)} value={Permission.DELETE} onChange={handlePermissionChange} />
            <Typography data-cy={"access-setting-address"} variant="h7">
              Delete
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </TableCell>
    <TableCell>
      {tokenInfo && <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="h7">
          <Amount decimals={tokenInfo?.decimals} decimalPlaces={9} wei={permissionsAndAllowances.flowRateAllowance.amountEther} >{` ${tokenInfo?.symbol}/${UnitOfTime[permissionsAndAllowances.flowRateAllowance.unitOfTime]}`}</Amount>
        </Typography>
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
      </Stack>}
    </TableCell>
    <TableCell>
      <Stack direction="column" alignItems="center" gap={0.8}>
        <SaveButton
          key={`save-${address}-${token}`}
          network={network}
          operatorAddress={address}
          tokenAddress={token}
          editedPermissionAndAllowances={permissionsAndAllowances}
          initialPermissionAndAllowances={initialPermissionAndAllowances}
        />
        <RevokeButton
          key={`revoke-${address}-${token}`}
          network={network}
          operatorAddress={address}
          tokenAddress={token}
          permissionAndAllowances={initialPermissionAndAllowances}
        />
      </Stack>
    </TableCell>
    {
      editType &&
      <ResponsiveDialog open={isDialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { borderRadius: "20px", maxHeight: "100%", width:  "auto" } }} translate="yes">
        <AllowanceEditDialog onSaveChanges={updatedProperty} onClose={closeDialog} permissionsAndAllowances={permissionsAndAllowances} editType={editType}></AllowanceEditDialog>
      </ResponsiveDialog>
    }
  </TableRow>
}

export default PermissionAndAllowancesRow;
