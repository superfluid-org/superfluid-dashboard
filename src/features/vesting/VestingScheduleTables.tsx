import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
    Box,
    IconButton,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC, useMemo } from "react";
import NoContentPaper from "../../components/NoContent/NoContentPaper";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApi";
import { CopyIconBtn } from "../common/CopyIconBtn";
import { NextLinkComposed } from "../common/Link";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import {
  mapPendingToVestingSchedule,
  useAddressPendingVestingSchedules,
} from "../pendingUpdates/PendingVestingSchedule";
import { platformApi } from "../redux/platformApi/platformApi";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AggregatedVestingSchedules from "./AggregatedVestingSchedules";
import VestingSchedulerAllowancesTable from "./VestingSchedulesAllowancesTable/VestingSchedulerAllowancesTable";
import VestingScheduleTable from "./VestingScheduleTable";

interface ExecutionWhitelistInfoProps {
  whitelisted: boolean;
  network: Network;
}

const AutoWrapContractInfo: FC<{ network: Network }> = ({network}) => {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
    if (!network || !network.autoWrap) return null;
    return <Box alignSelf={isBelowMd ? "flex-start" : "flex-end"}>
        <Stack direction="row" gap={0.5}>
            <Typography variant={isBelowMd ? "body2" : "body1"} color="secondary">
                Auto-Wrap Manager Smart Contract
            </Typography>
            <Stack
                data-cy="auto-wrap-manager-contract-buttons"
                direction="row"
                alignItems="center"
            >
                <CopyIconBtn
                    TooltipProps={{placement: "top"}}
                    copyText={getAddress(network.autoWrap.managerContractAddress)}
                    description="Copy address to clipboard"
                    IconButtonProps={{size: "small"}}
                />
                <Tooltip arrow title="View on blockchain explorer" placement="top">
                    <NextLinkComposed
                        passHref
                        to={network.getLinkForAddress(network.autoWrap.managerContractAddress)}
                        target="_blank"
                    >
                        <IconButton size="small">
                            <LaunchRoundedIcon color="inherit"/>
                        </IconButton>
                    </NextLinkComposed>
                </Tooltip>
            </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant={isBelowMd ? "body2" : "body1"} color="secondary">
                Auto-Wrap Strategy Smart Contract
            </Typography>
            <Stack
                data-cy="auto-wrap-strategy-contract-buttons"
                direction="row"
                alignItems="center"
            >
                <CopyIconBtn
                    TooltipProps={{placement: "top"}}
                    copyText={getAddress(network.autoWrap.strategyContractAddress)}
                    description="Copy address to clipboard"
                    IconButtonProps={{size: "small"}}
                />
                <Tooltip arrow title="View on blockchain explorer" placement="top">
                    <NextLinkComposed
                        passHref
                        to={network.getLinkForAddress(network.autoWrap.strategyContractAddress)}
                        target="_blank"
                    >
                        <IconButton size="small">
                            <LaunchRoundedIcon color="inherit"/>
                        </IconButton>
                    </NextLinkComposed>
                </Tooltip>
            </Stack>
        </Stack>
    </Box>
}

const ExecutionWhitelistInfo: FC<ExecutionWhitelistInfoProps> = ({
  whitelisted,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
   <Stack>
      <Stack
      direction={isBelowMd ? "column" : "row"}
      alignItems={isBelowMd ? "start" : "center"}
      justifyContent="space-between"
      spacing={1}
    >
      <Typography variant={isBelowMd ? "body2" : "body1"} color="secondary">
        {whitelisted ? (
          <>
            Your wallet address <strong>is</strong> on the allowlist.
          </>
        ) : (
          <>
            Your wallet address is <strong>not</strong> on the allowlist.
          </>
        )}
      </Typography>
      {network.vestingContractAddress && (
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography variant={isBelowMd ? "body2" : "body1"} color="secondary">
            Vesting Smart Contract
          </Typography>
          <Stack
            data-cy="vesting-contract-buttons"
            direction="row"
            alignItems="center"
          >
            <CopyIconBtn
              TooltipProps={{ placement: "top" }}
              copyText={getAddress(network.vestingContractAddress)}
              description="Copy address to clipboard"
              IconButtonProps={{ size: "small" }}
            />
            <Tooltip arrow title="View on blockchain explorer" placement="top">
              <NextLinkComposed
                passHref
                to={network.getLinkForAddress(network.vestingContractAddress)}
                target="_blank"
              >
                <IconButton size="small">
                  <LaunchRoundedIcon color="inherit" />
                </IconButton>
              </NextLinkComposed>
            </Tooltip>
          </Stack>
        </Stack>
      )}
    </Stack>
    <AutoWrapContractInfo network={network} />
  </Stack>
  );
};

interface VestingScheduleTablesProps {}

const VestingScheduleTables: FC<VestingScheduleTablesProps> = ({}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();

  const {
    vestingSchedules: receivedVestingSchedules,
    isLoading: receivedSchedulesLoading,
  } = vestingSubgraphApi.useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          chainId: network.id,
          where: { receiver: visibleAddress?.toLowerCase() },
          orderBy: "createdAt",
          orderDirection: "desc",
        }
      : skipToken,
    {
      refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
      selectFromResult: (result) => ({
        ...result,
        vestingSchedules: result.data?.vestingSchedules ?? [],
      }),
    }
  );

  const {
    vestingSchedules: sentVestingSchedules,
    isLoading: sentSchedulesLoading,
  } = vestingSubgraphApi.useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          chainId: network.id,
          where: { sender: visibleAddress?.toLowerCase() },
          orderBy: "createdAt",
          orderDirection: "desc",
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        vestingSchedules: result.data?.vestingSchedules ?? [],
      }),
    }
  );

  const { isPlatformWhitelisted, isLoading: isWhitelistLoading } =
    platformApi.useIsAccountWhitelistedQuery(
      visibleAddress && network?.platformUrl
        ? {
            chainId: network.id,
            baseUrl: network.platformUrl,
            account: visibleAddress?.toLowerCase(),
          }
        : skipToken,
      {
        selectFromResult: (queryResult) => ({
          ...queryResult,
          isPlatformWhitelisted: !!queryResult.data,
        }),
      }
    );

  const pendingVestingSchedules =
    useAddressPendingVestingSchedules(visibleAddress);

  const mappedPendingVestingSchedules = useMemo(
    () =>
      visibleAddress
        ? pendingVestingSchedules.map((pendingVestingSchedule) =>
            mapPendingToVestingSchedule(visibleAddress, pendingVestingSchedule)
          )
        : [],
    [pendingVestingSchedules, visibleAddress]
  );

  const mappedSentVestingSchedules = useMemo(() => {
    return [...mappedPendingVestingSchedules, ...(sentVestingSchedules || [])];
  }, [mappedPendingVestingSchedules, sentVestingSchedules]);

  const notDeletedSentVestingSchedules = useMemo(
    () =>
      mappedSentVestingSchedules.filter(
        (vestingSchedule) => !vestingSchedule.status.isDeleted
      ),
    [mappedSentVestingSchedules]
  );
  const vestingSchedulesLoading =
    receivedSchedulesLoading || sentSchedulesLoading;

  return (
    <Stack
      gap={3.5}
      direction={
        receivedVestingSchedules.length === 0 &&
        mappedSentVestingSchedules.length > 0
          ? "column-reverse"
          : "column"
      }
    >
      <Stack gap={2}>
        <Typography variant="h6">
          {vestingSchedulesLoading ? (
            <Skeleton width="200px" />
          ) : (
            "Received Vesting Schedules"
          )}
        </Typography>
        {vestingSchedulesLoading || receivedVestingSchedules.length > 0 ? (
          <VestingScheduleTable
            incoming
            dataCy={"received-table"}
            isLoading={vestingSchedulesLoading}
            network={network}
            vestingSchedules={receivedVestingSchedules}
          />
        ) : (
          <NoContentPaper
            dataCy={"no-received-schedules"}
            title="No Received Vesting Schedules"
            description="Vesting schedules that you have received will appear here."
          />
        )}
      </Stack>

      <Stack gap={3.5}>
        <Stack gap={2}>
          <Typography variant="h6">
            {vestingSchedulesLoading ? (
              <Skeleton width="200px" />
            ) : (
              "Sent Vesting Schedules"
            )}
          </Typography>
          {vestingSchedulesLoading || mappedSentVestingSchedules.length > 0 ? (
            <Stack gap={isBelowMd ? 0 : 3.5}>
              <AggregatedVestingSchedules
                vestingSchedules={notDeletedSentVestingSchedules}
                network={network}
              />
              <VestingScheduleTable
                data-cy={"created-table"}
                isLoading={vestingSchedulesLoading}
                network={network}
                vestingSchedules={mappedSentVestingSchedules}
              />
            </Stack>
          ) : (
            <NoContentPaper
              dataCy={"no-created-schedules"}
              title="No Sent Vesting Schedules"
              description="Vesting schedules that you have created will appear here."
            />
          )}
        </Stack>

        <Stack gap={2}>
          {vestingSchedulesLoading ? (
            <Skeleton width="200px" />
          ) : (
            <Typography variant="h6">Permissions and Allowances</Typography>
          )}

          <VestingSchedulerAllowancesTable />

          {!isWhitelistLoading && (
            <ExecutionWhitelistInfo
              network={network}
              whitelisted={isPlatformWhitelisted}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default VestingScheduleTables;
