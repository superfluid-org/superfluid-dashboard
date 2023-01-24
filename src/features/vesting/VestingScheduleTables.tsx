import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Card,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC, useMemo } from "react";
import NoContentPaper from "../../components/NoContent/NoContentPaper";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApi";
import { CopyIconBtn } from "../common/CopyIconBtn";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  mapPendingToVestingSchedule,
  useAddressPendingVestingSchedules,
} from "../pendingUpdates/PendingVestingSchedule";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AggregatedVestingSchedules from "./AggregatedVestingSchedules";
import VestingSchedulerAllowancesTable from "./VestingSchedulesAllowancesTable/VestingSchedulerAllowancesTable";
import VestingScheduleTable from "./VestingScheduleTable";
import Link from "../common/Link";
import TooltipIcon from "../common/TooltipIcon";
import { platformApi } from "../redux/platformApi/platformApi";

interface VestingScheduleTablesProps {}

const VestingScheduleTables: FC<VestingScheduleTablesProps> = ({}) => {
  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();

  const {
    vestingSchedules: receivedVestingSchedules,
    isLoading: receivedSchedulesLoading,
  } = vestingSubgraphApi.useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          chainId: network.id,
          where: { receiver: visibleAddress?.toLowerCase(), deletedAt: null },
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

  const {
    vestingSchedules: sentVestingSchedules,
    isLoading: sentSchedulesLoading,
  } = vestingSubgraphApi.useGetVestingSchedulesQuery(
    visibleAddress
      ? {
          chainId: network.id,
          where: { sender: visibleAddress?.toLowerCase(), deletedAt: null },
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

  const { isPlatformWhitelisted } = platformApi.useIsAccountWhitelistedQuery(
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

  const vestingSchedulesLoading =
    receivedSchedulesLoading || sentSchedulesLoading;

  return (
    <Stack
      gap={2}
      direction={
        receivedVestingSchedules.length === 0 &&
        mappedSentVestingSchedules.length > 0
          ? "column-reverse"
          : "column"
      }
    >
      <Stack gap={2} direction="column">
        <Typography variant="h6">
          {vestingSchedulesLoading ? (
            <Skeleton width="200px" />
          ) : (
            "Received Vesting Schedules"
          )}
        </Typography>
        <Card sx={{ p: 0, mb: 3 }}>
          {vestingSchedulesLoading || receivedVestingSchedules.length > 0 ? (
            <VestingScheduleTable
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
        </Card>
      </Stack>

      <Stack gap={2} direction="column">
        <Typography variant="h6">
          {vestingSchedulesLoading ? (
            <Skeleton width="200px" />
          ) : (
            "Sent Vesting Schedules"
          )}
        </Typography>
        {vestingSchedulesLoading || mappedSentVestingSchedules.length > 0 ? (
          <>
            <AggregatedVestingSchedules
              vestingSchedules={mappedSentVestingSchedules}
              network={network}
            />
            <VestingScheduleTable
              data-cy={"created-table"}
              isLoading={vestingSchedulesLoading}
              network={network}
              vestingSchedules={mappedSentVestingSchedules}
            />
          </>
        ) : (
          <Paper>
            <NoContentPaper
              dataCy={"no-created-schedules"}
              title="No Sent Vesting Schedules"
              description="Vesting schedules that you have created will appear here."
            />
          </Paper>
        )}

        {vestingSchedulesLoading ? (
          <Skeleton width="200px" />
        ) : (
          <Typography variant="h6">Allowances and Permissions</Typography>
        )}

        <VestingSchedulerAllowancesTable />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Typography variant="body1" color="secondary">
            Transaction executed by:{" "}
            {isPlatformWhitelisted ? "Superfluid" : "User"}
          </Typography>

          {network.vestingContractAddress && (
            <Stack direction="row" alignItems="center">
              <Typography variant="body1" color="secondary">
                Contract address
              </Typography>

              <CopyIconBtn
                TooltipProps={{ placement: "top" }}
                copyText={getAddress(network.vestingContractAddress)}
                description="Copy address to clipboard"
              />
              <Tooltip
                title="View on blockchain explorer"
                arrow
                placement="top"
              >
                <Link
                  passHref
                  href={network.getLinkForAddress(
                    network.vestingContractAddress
                  )}
                  target="_blank"
                >
                  <IconButton href="" target="_blank">
                    <LaunchRoundedIcon color="inherit" />
                  </IconButton>
                </Link>
              </Tooltip>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default VestingScheduleTables;
