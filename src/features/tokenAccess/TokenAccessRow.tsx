import {
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Address } from "@superfluid-finance/sdk-core";
import TokenIcon from "../token/TokenIcon";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import AddressName from "../../components/AddressName/AddressName";
import Amount from "../token/Amount";
import { subgraphApi } from "../redux/store";
import { UnitOfTime, timeUnitShortFormMap } from "../send/FlowRateInput";
import { BigNumber } from "ethers";
import { Network } from "../network/networks";
import {
  isCloseToUnlimitedFlowRateAllowance,
  isCloseToUnlimitedTokenAllowance,
} from "../../utils/isCloseToUnlimitedAllowance";
import { flowOperatorPermissionsToString } from "../../utils/flowOperatorPermissionsToString";
import { useTheme } from "@mui/material/styles";
import { UpsertTokenAccessDialogProvider } from "./dialog/UpsertTokenAccessDialogProvider";
import { Token } from "./dialog/UpsertTokenAccessFormProvider";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";

interface Props {
  address: Address;
  network: Network;
  token: Address;
  tokenAllowance: string;
  flowOperatorPermissions: number;
  flowRateAllowance: string;
}

const TokenAccessRow: FC<Props> = ({
  address,
  network,
  token,
  tokenAllowance,
  flowOperatorPermissions,
  flowRateAllowance,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [initialAccess, setInitialState] = useState({
    tokenAllowanceWei: BigNumber.from(tokenAllowance),
    flowOperatorPermissions: flowOperatorPermissions,
    flowRateAllowance: {
      amountWei: BigNumber.from(flowRateAllowance),
      unitOfTime: UnitOfTime.Second,
    },
  });

  const { data: tokenInfo, isLoading: isTokenLoading } =
    subgraphApi.useTokenQuery({
      id: token,
      chainId: network.id,
    });

  useEffect(() => {
    setInitialState({
      tokenAllowanceWei: BigNumber.from(tokenAllowance),
      flowOperatorPermissions: flowOperatorPermissions,
      flowRateAllowance: {
        amountWei: BigNumber.from(flowRateAllowance),
        unitOfTime: UnitOfTime.Second,
      },
    });
  }, [
    address,
    network,
    tokenInfo,
    tokenAllowance,
    flowOperatorPermissions,
    flowRateAllowance,
  ]);

  const initialFormValues = {
    network: network,
    token: tokenInfo
      ? ({
          address: tokenInfo.id,
          decimals: tokenInfo.decimals,
          isListed: tokenInfo.isListed,
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          type: getSuperTokenType({
            network,
            address: tokenInfo.id,
            underlyingAddress: tokenInfo.underlyingAddress,
          }),
        } as Token)
      : undefined,
    operatorAddress: address,
    flowOperatorPermissions: initialAccess.flowOperatorPermissions,
    flowRateAllowance: initialAccess.flowRateAllowance,
    tokenAllowanceWei: initialAccess.tokenAllowanceWei,
  };

  return (
    <>
      {isBelowMd ? (
        <TableRow>
          <TableCell>
            <Stack gap={2} sx={{ px: 2, py: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ width: "auto" }}
              >
                <Typography variant="subtitle1">Asset</Typography>
                <Stack
                  data-cy={"token-header"}
                  direction="row"
                  alignItems="center"
                  gap={2}
                >
                  <TokenIcon
                    isSuper
                    tokenSymbol={tokenInfo?.symbol}
                    isLoading={isTokenLoading}
                  />
                  <Typography variant="h6" data-cy={"token-symbol"}>
                    {tokenInfo?.symbol}
                  </Typography>
                </Stack>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ width: "auto" }}
              >
                <Typography variant="subtitle1">Address</Typography>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <AddressAvatar
                    address={address}
                    AvatarProps={{
                      sx: {
                        width: "24px",
                        height: "24px",
                        borderRadius: "5px",
                      },
                    }}
                    BlockiesProps={{ size: 8, scale: 3 }}
                  />
                  <AddressCopyTooltip address={address}>
                    <Typography data-cy={"access-setting-address"} variant="h6">
                      <AddressName address={address} />
                    </Typography>
                  </AddressCopyTooltip>
                </Stack>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ width: "auto" }}
              >
                <Typography variant="subtitle1">ERC-20 Allowance</Typography>
                {tokenInfo && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="h6">
                      {isCloseToUnlimitedTokenAllowance(
                        initialAccess.tokenAllowanceWei
                      ) ? (
                        <span>Unlimited</span>
                      ) : (
                        <>
                          <Amount
                            decimals={tokenInfo?.decimals}
                            wei={initialAccess.tokenAllowanceWei}
                          >{` ${tokenInfo?.symbol}`}</Amount>
                        </>
                      )}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ width: "auto" }}
              >
                <Typography variant="subtitle1">Stream Permissions</Typography>
                <Typography variant="h6">
                  {flowOperatorPermissionsToString(
                    initialAccess.flowOperatorPermissions
                  )}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ width: "auto" }}
              >
                <Typography variant="subtitle1">Stream Allowance</Typography>
                {tokenInfo && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="h6">
                      {isCloseToUnlimitedFlowRateAllowance(
                        initialAccess.flowRateAllowance.amountWei
                      ) ? (
                        <span>Unlimited</span>
                      ) : (
                        <>
                          <Amount
                            decimals={tokenInfo?.decimals}
                            wei={initialAccess.flowRateAllowance.amountWei}
                          >{` ${tokenInfo?.symbol}/${
                            timeUnitShortFormMap[
                              initialAccess.flowRateAllowance.unitOfTime
                            ]
                          }`}</Amount>
                        </>
                      )}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Stack gap={2} direction="column">
                <UpsertTokenAccessDialogProvider
                  initialFormValues={initialFormValues}
                >
                  {({ openDialog }) => (
                    <Button
                      data-cy={"modify-access-button"}
                      size="medium"
                      fullWidth={true}
                      variant="contained"
                      color="primary"
                      onClick={() => openDialog()}
                    >
                      Modify
                    </Button>
                  )}
                </UpsertTokenAccessDialogProvider>
              </Stack>
            </Stack>
          </TableCell>
        </TableRow>
      ) : (
        <TableRow>
          <TableCell align="left">
            <Stack
              data-cy={"token-header"}
              direction="row"
              alignItems="center"
              gap={2}
            >
              <TokenIcon
                isSuper
                tokenSymbol={tokenInfo?.symbol}
                isLoading={isTokenLoading}
              />
              <Typography variant="h6" data-cy={"token-symbol"}>
                {tokenInfo?.symbol}
              </Typography>
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
          <TableCell sx={{ overflowWrap: "anywhere" }} align="left">
            {tokenInfo && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Typography variant="h6">
                  {isCloseToUnlimitedTokenAllowance(
                    initialAccess.tokenAllowanceWei
                  ) ? (
                    <span>Unlimited</span>
                  ) : (
                    <>
                      <Amount
                        decimals={tokenInfo?.decimals}
                        wei={initialAccess.tokenAllowanceWei}
                      >{` ${tokenInfo?.symbol}`}</Amount>
                    </>
                  )}
                </Typography>
              </Stack>
            )}
          </TableCell>
          <TableCell align="left">
            <Typography variant="h6">
              {flowOperatorPermissionsToString(
                initialAccess.flowOperatorPermissions
              )}
            </Typography>
          </TableCell>
          <TableCell align="left" sx={{ overflowWrap: "anywhere" }}>
            {tokenInfo && (
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Typography variant="h6">
                  {isCloseToUnlimitedFlowRateAllowance(
                    initialAccess.flowRateAllowance.amountWei
                  ) ? (
                    <span>Unlimited</span>
                  ) : (
                    <>
                      <Amount
                        decimals={tokenInfo?.decimals}
                        wei={initialAccess.flowRateAllowance.amountWei}
                      >{` ${tokenInfo?.symbol}/${
                        timeUnitShortFormMap[
                          initialAccess.flowRateAllowance.unitOfTime
                        ]
                      }`}</Amount>
                    </>
                  )}
                </Typography>
              </Stack>
            )}
          </TableCell>
          <TableCell
            align="left"
            sx={{
              p: 3
            }}
          >
            <UpsertTokenAccessDialogProvider
              initialFormValues={initialFormValues}
            >
              {({ openDialog }) => (
                <Button
                  data-cy={"modify-access-button"}
                  size="medium"
                  fullWidth={true}
                  variant="contained"
                  color="primary"
                  onClick={() => openDialog()}
                >
                  Modify
                </Button>
              )}
            </UpsertTokenAccessDialogProvider>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default TokenAccessRow;
