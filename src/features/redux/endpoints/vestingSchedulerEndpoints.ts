import {
  BaseQuery,
  BaseSuperTokenMutation,
  RpcEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import {
  getErc20Allowance,
  getFlowOperatorData,
} from "../../transactions/contractReads";
import { UnitOfTime } from "../../send/FlowRateInput";
import { getUnixTime } from "date-fns";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { resolvedWagmiClients } from "../../wallet/wagmiConfig";
import { getVestingSchedulerContractInfo } from "../../vesting/useVestingWrites";
import { VestingVersion } from "../../network/networkConstants";

export const MAX_VESTING_DURATION_IN_YEARS = 10;
export const MAX_VESTING_DURATION_IN_SECONDS =
  MAX_VESTING_DURATION_IN_YEARS * UnitOfTime.Year;

export interface CreateVestingSchedule extends BaseSuperTokenMutation {
  senderAddress: string;
  receiverAddress: string;
  startDateTimestamp: number;
  cliffDateTimestamp: number;
  flowRateWei: string;
  endDateTimestamp: number;
  cliffTransferAmountWei: string;
  claimEnabled: boolean;
  version: "v3";
}

export interface CreateVestingScheduleFromAmountAndDuration
  extends BaseSuperTokenMutation {
  senderAddress: string;
  receiverAddress: string;
  startDateTimestamp: number;
  cliffPeriodInSeconds: number;
  cliffTransferAmountWei: string;
  totalDurationInSeconds: number;
  totalAmountWei: string;
  claimEnabled: boolean;
  version: "v3";
}

export interface ClaimVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  senderAddress: string;
  receiverAddress: string;
  version: "v2" | "v3";
}

export interface DeleteVestingSchedule extends BaseSuperTokenMutation {
  chainId: number;
  senderAddress: string;
  receiverAddress: string;
  deleteFlow: boolean;
  version: VestingVersion;
}

interface GetVestingSchedule extends BaseQuery<RpcVestingSchedule | null> {
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  version: VestingVersion;
}

interface RpcVestingSchedule {
  endDateTimestamp: number;
  claimValidityDate: number;
  isClaimable: boolean;
}

interface FixAccessForVestingMutation extends BaseSuperTokenMutation {
  senderAddress: string;
  requiredTokenAllowanceWei: string;
  requiredFlowOperatorPermissions: number;
  requiredFlowRateAllowanceWei: string;
  version: VestingVersion;
}

export const vestingSchedulerQueryEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getVestingSchedulerConstants: builder.query<
      {
        MIN_VESTING_DURATION_IN_DAYS: number;
        MIN_VESTING_DURATION_IN_MINUTES: number;
        MIN_VESTING_DURATION_IN_SECONDS: number;
        START_DATE_VALID_AFTER_IN_DAYS: number;
        START_DATE_VALID_AFTER_IN_SECONDS: number;
        END_DATE_VALID_BEFORE_IN_DAYS: number;
        END_DATE_VALID_BEFORE_IN_SECONDS: number;
      },
      { chainId: number; version: VestingVersion }
    >({
      keepUnusedDataFor: 3600,
      extraOptions: {
        maxRetries: 10,
      },
      queryFn: async ({ chainId, version }) => {
        const network = findNetworkOrThrow(allNetworks, chainId);
        const contractInfo = network.vestingContractAddress[version];
        if (!contractInfo) {
          throw new Error("Vesting contract not supported on this network");
        }
        const MIN_VESTING_DURATION_IN_SECONDS = contractInfo.MIN_VESTING_DURATION_IN_SECONDS;
        const END_DATE_VALID_BEFORE_IN_SECONDS = contractInfo.END_DATE_VALID_BEFORE_IN_SECONDS;
        const START_DATE_VALID_AFTER_IN_SECONDS = contractInfo.START_DATE_VALID_AFTER_IN_SECONDS;
        return {
          data: {
            MIN_VESTING_DURATION_IN_SECONDS,
            MIN_VESTING_DURATION_IN_DAYS: Math.round(
              MIN_VESTING_DURATION_IN_SECONDS / UnitOfTime.Day
            ),
            MIN_VESTING_DURATION_IN_MINUTES: Math.round(
              MIN_VESTING_DURATION_IN_SECONDS / UnitOfTime.Minute
            ),
            START_DATE_VALID_AFTER_IN_SECONDS,
            START_DATE_VALID_AFTER_IN_DAYS: Math.round(
              START_DATE_VALID_AFTER_IN_SECONDS / UnitOfTime.Day
            ),
            END_DATE_VALID_BEFORE_IN_SECONDS,
            END_DATE_VALID_BEFORE_IN_DAYS: Math.round(
              END_DATE_VALID_BEFORE_IN_SECONDS / UnitOfTime.Day
            ),
          },
        };
      },
    }),
    getVestingSchedulerAllowances: builder.query<
      {
        tokenAllowance: string;
        flowOperatorPermissions: number;
        flowRateAllowance: string;
      },
      {
        chainId: number;
        tokenAddress: string;
        senderAddress: string;
        version: VestingVersion;
      }
    >({
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
      queryFn: async ({ chainId, tokenAddress, senderAddress, version }) => {
        const { address: vestingSchedulerContractAddress } =
          getVestingSchedulerContractInfo(chainId, version);

        const [tokenAllowance, flowOperatorData] = await Promise.all([
          getErc20Allowance({
            chainId,
            tokenAddress,
            ownerAddress: senderAddress,
            spenderAddress: vestingSchedulerContractAddress,
          }),
          getFlowOperatorData({
            chainId,
            superTokenAddress: tokenAddress,
            senderAddress,
            flowOperatorAddress: vestingSchedulerContractAddress,
          }),
        ]);

        return {
          data: {
            tokenAllowance: tokenAllowance.toString(),
            flowOperatorPermissions: flowOperatorData.permissions,
            flowRateAllowance: flowOperatorData.flowRateAllowanceWei.toString(),
          },
        };
      },
    }),
    getActiveVestingSchedule: builder.query<
      RpcVestingSchedule | null,
      GetVestingSchedule
    >({
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId,
        },
      ],
      queryFn: async ({
        chainId,
        superTokenAddress,
        senderAddress,
        receiverAddress,
        version,
      }) => {
        const publicClient = resolvedWagmiClients[chainId]();

        const { abi, address } = getVestingSchedulerContractInfo(
          chainId,
          version
        );

        const rpcVestingSchedule = await publicClient.readContract({
          abi,
          address,
          functionName: "getVestingSchedule",
          args: [superTokenAddress as `0x${string}`, senderAddress as `0x${string}`, receiverAddress as `0x${string}`],
        });

        // TODO: Use viem here
        const rpcVestingScheduleNormalized = {
          claimValidityDate: 0n,
          ...(rpcVestingSchedule),
        };

        const unixNow = BigInt(getUnixTime(new Date()));

        const mappedVestingSchedule =
          rpcVestingScheduleNormalized.endDate > 0
            ? {
                endDateTimestamp: rpcVestingScheduleNormalized.endDate,
                claimValidityDate: Number(rpcVestingScheduleNormalized.claimValidityDate) ?? null,
                isClaimable:
                  !!rpcVestingScheduleNormalized.cliffAndFlowDate &&
                  !!rpcVestingScheduleNormalized.claimValidityDate &&
                  rpcVestingScheduleNormalized.cliffAndFlowDate < unixNow &&
                  unixNow < rpcVestingScheduleNormalized.claimValidityDate,
              }
            : null;

        return {
          data: mappedVestingSchedule,
        };
      },
    }),
  })
};
