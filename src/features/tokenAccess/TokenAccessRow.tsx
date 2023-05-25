import { Button, Stack, Switch, TableCell, TableRow, Typography } from "@mui/material";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "@superfluid-finance/sdk-core";
import TokenIcon from "../token/TokenIcon";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import AddressName from "../../components/AddressName/AddressName";
import Amount from "../token/Amount";
import EditIcon from "@mui/icons-material/Edit";
import RevokeButton from "./RevokeButton";
import SaveButton from "./SaveButton";
import { subgraphApi } from "../redux/store";
import EditDialog from "./dialogs/EditDialog";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { UnitOfTime, timeUnitShortFormMap } from "../send/FlowRateInput";
import { BigNumber } from "ethers";
import { Network } from "../network/networks";
import {
  isCloseToUnlimitedFlowRateAllowance,
  isCloseToUnlimitedTokenAllowance,
} from "../../utils/isCloseToUnlimitedAllowance";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";
import { ACL_CREATE_PERMISSION, ACL_DELETE_PERMISSION, ACL_UPDATE_PERMISSION } from "../redux/endpoints/flowSchedulerEndpoints";
import { ACL_CREATE_PERMISSION_LABEL, ACL_DELETE_PERMISSION_LABEL, ACL_UPDATE_PERMISSION_LABEL, flowOperatorPermissionsToString } from "../../utils/flowOperatorPermissionsToString";

export type TokenAccessProps = {
  flowRateAllowance: {
    amountEther: BigNumber;
    unitOfTime: UnitOfTime;
  };
  flowOperatorPermissions: number;
  tokenAllowance: BigNumber;
};

interface Props {
  address: Address;
  network: Network;
  token: Address;
  tokenAllowance: string;
  flowOperatorPermissions: number;
  flowRateAllowance: string;
}

const TokenAccessActionButtonSection: FC<
  {
    network: Network,
    operatorAddress: string,
    tokenAddress: string,
    editedAccess: TokenAccessProps,
    initialAccess: TokenAccessProps
  }
> = ({ network, operatorAddress, tokenAddress, editedAccess, initialAccess }) => {

  const {
    allowImpersonation,
    isImpersonated,
    isCorrectNetwork,
    stopImpersonation,
    switchNetwork,
  } = useConnectionBoundary();

  if (isImpersonated && !allowImpersonation) {
    return (
      <Button
        data-cy={"view-mode-button"}
        size="medium"
        fullWidth={true}
        variant="contained"
        color="warning"
        onClick={stopImpersonation}
      >
        Stop viewing
      </Button>
    );
  }

  if (!isCorrectNetwork && !allowImpersonation) {
    return (
      <Button
        data-cy={"change-network-button"}
        color="primary"
        disabled={!switchNetwork}
        size="medium"
        fullWidth={true}
        variant="contained"
        onClick={() => switchNetwork?.()}
      >
        Change Network
      </Button>
    );
  }

  return <Stack direction="column" alignItems="center" gap={0.8}>
    <SaveButton
      key={`save-${operatorAddress}-${tokenAddress}-btn`}
      network={network}
      operatorAddress={operatorAddress}
      tokenAddress={tokenAddress}
      editedAccess={editedAccess}
      initialAccess={initialAccess}
    />
    <RevokeButton
      key={`revoke-${operatorAddress}-${tokenAddress}-btn`}
      network={network}
      operatorAddress={operatorAddress}
      tokenAddress={tokenAddress}
      access={initialAccess}
    />
  </Stack>
}

interface Permission {
  name: string;
  value: number;
  label: string;
}

const permissions: Permission[] = [
  { name: ACL_CREATE_PERMISSION_LABEL, value: ACL_CREATE_PERMISSION, label: ACL_CREATE_PERMISSION_LABEL },
  { name: ACL_UPDATE_PERMISSION_LABEL, value: ACL_UPDATE_PERMISSION, label: ACL_UPDATE_PERMISSION_LABEL },
  { name: ACL_DELETE_PERMISSION_LABEL, value: ACL_DELETE_PERMISSION, label: ACL_DELETE_PERMISSION_LABEL },
];

const PermissionSwitchComponent: FC<{
  activePermissions: number,
  updatedProperty: <K extends keyof TokenAccessProps>(
    key: K,
    value: TokenAccessProps[K]
  ) => void
}> = ({ updatedProperty, activePermissions }) => {

  const handleChange = (permissionValue: number) => {
    updatedProperty(
      "flowOperatorPermissions", (activePermissions ^ permissionValue)
    );
  };

  const isPermissionActive = (permissionValue: number) => (activePermissions & permissionValue) !== 0;

  const renderSwitch = (permission: Permission) => (
    <Stack key={permission.name} direction="row" alignItems="center">
      <Switch
        color="primary"
        checked={isPermissionActive(permission.value)}
        value={permission.name}
        onChange={() => handleChange(permission.value)}
      />
      <Typography variant="h6">{permission.label}</Typography>
    </Stack>
  );

  return (
    <Stack direction="column">
      {permissions.map(renderSwitch)}
    </Stack>
  );
};

const TokenAccessRow: FC<Props> = ({
  address,
  network,
  token,
  tokenAllowance,
  flowOperatorPermissions,
  flowRateAllowance,
}) => {
  const initialAccess = useMemo(() => {
    return {
      tokenAllowance: BigNumber.from(tokenAllowance),
      flowOperatorPermissions: flowOperatorPermissions,
      flowRateAllowance: {
        amountEther: BigNumber.from(flowRateAllowance),
        unitOfTime: UnitOfTime.Second,
      },
    };
  }, [tokenAllowance, flowOperatorPermissions, flowRateAllowance]);

  const [editedAccess, setEditedAccess] =
    useState<TokenAccessProps>(initialAccess);

  useEffect(() => {
    setEditedAccess(initialAccess);
  }, [initialAccess]);

  const [isDialogOpen, setDialogOpen] = useState(false);

  const [editType, setEditType] = useState<"EDIT_ERC20" | "EDIT_STREAM">();

  const { data: tokenInfo } = subgraphApi.useTokenQuery({
    id: token,
    chainId: network.id,
  });

  const updatedProperty = useCallback(
    <K extends keyof TokenAccessProps>(
      key: K,
      value: TokenAccessProps[K]
    ): void => {
      setEditedAccess({
        ...editedAccess,
        [key]: value,
      });
    },
    [editedAccess]
  );

  const closeDialog = () => setDialogOpen(false);

  return (
    <TableRow>
      <TableCell align="left">
        <Stack
          data-cy={"token-header"}
          direction="row"
          alignItems="center"
          gap={2}
        >
          <TokenIcon isSuper tokenSymbol={tokenInfo?.symbol} />
          <Typography variant="h6" data-cy={"token-symbol"}>{tokenInfo?.symbol}</Typography>
        </Stack>
      </TableCell>
      <TableCell align="left">
        <Stack direction="row" alignItems="center" gap={1.5}>
          <AddressAvatar
            address={address}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <AddressCopyTooltip address={address}>
            <Typography data-cy={"access-setting-address"} variant="h6">
              <AddressName address={address} />
            </Typography>
          </AddressCopyTooltip>
        </Stack>
      </TableCell>
      <TableCell style={{ overflowWrap: "anywhere" }} align="left">
        {tokenInfo && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="h6">
              {isCloseToUnlimitedTokenAllowance(editedAccess.tokenAllowance) ? (
                <span>Unlimited</span>
              ) : (
                <>
                  <Amount
                    decimals={tokenInfo?.decimals}
                    wei={editedAccess.tokenAllowance}
                  >{` ${tokenInfo?.symbol}`}</Amount>
                </>
              )}
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
          </Stack>
        )}
      </TableCell>
      <TableCell align="left">
        <PermissionSwitchComponent key={"permission-switch"} updatedProperty={updatedProperty} activePermissions={editedAccess.flowOperatorPermissions} />
      </TableCell>
      <TableCell align="left" style={{ overflowWrap: "anywhere" }}>
        {tokenInfo && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="h6">
              {isCloseToUnlimitedFlowRateAllowance(
                editedAccess.flowRateAllowance.amountEther
              ) ? (
                <span>Unlimited</span>
              ) : (
                <>
                  <Amount
                    decimals={tokenInfo?.decimals}
                    wei={editedAccess.flowRateAllowance.amountEther}
                  >{` ${tokenInfo?.symbol}/ ${timeUnitShortFormMap[editedAccess.flowRateAllowance.unitOfTime]
                    }`}</Amount>
                </>
              )}
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
          </Stack>
        )}
      </TableCell>
      <TableCell align="left" sx={{
        padding: "25px"
      }}>
        <TokenAccessActionButtonSection key={`action-section-${address}-${token}`} editedAccess={editedAccess} initialAccess={initialAccess} network={network} operatorAddress={address} tokenAddress={token} />
      </TableCell>
      {editType && (
        <ResponsiveDialog
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          PaperProps={{
            sx: { borderRadius: "20px", maxHeight: "100%", maxWidth: 526 },
          }}
          translate="yes"
        >
          <EditDialog
            onSaveChanges={updatedProperty}
            onClose={closeDialog}
            editedAccess={editedAccess}
            editType={editType}
          ></EditDialog>
        </ResponsiveDialog>
      )}
    </TableRow>
  );
};

export default TokenAccessRow;
