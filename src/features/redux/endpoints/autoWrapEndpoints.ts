import { RpcEndpointBuilder } from "@superfluid-finance/sdk-redux";
import { Address, zeroAddress } from "viem";
import { autoWrapManagerAbi } from "@sfpro/sdk/abi/automation";
import { dateNowSeconds } from "../../../utils/dateUtils";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { getErc20Allowance } from "../../transactions/contractReads";
import { resolvedWagmiClients } from "../../wallet/WagmiManager";

export type WrapSchedule = {
  user: string;
  superToken: string;
  strategy: string;
  liquidityToken: string;
  expiry: string; // Why was this a big number?
  lowerLimit: string; // Why was this a big number?
  upperLimit: string; // Why was this a big number?
};

export type GetWrapSchedule = {
  chainId: number;
  accountAddress: string;
  superTokenAddress: string;
  underlyingTokenAddress: string;
};

const getAutoWrapAddresses = (chainId: number) => {
  const network = findNetworkOrThrow(allNetworks, chainId);
  if (!network.autoWrap) {
    throw new Error("Auto-Wrap not supported on this network");
  }
  return {
    managerAddress: network.autoWrap.managerContractAddress,
    strategyAddress: network.autoWrap.strategyContractAddress,
  };
};

const getActiveWrapScheduleEndpoint = (builder: RpcEndpointBuilder) =>
  builder.query<WrapSchedule | null, GetWrapSchedule>({
    queryFn: async (arg) => {
      const publicClient = resolvedWagmiClients[arg.chainId]();
      const { managerAddress } = getAutoWrapAddresses(arg.chainId);

      const rawWrapSchedule = await publicClient.readContract({
        abi: autoWrapManagerAbi,
        address: managerAddress,
        functionName: "getWrapSchedule",
        args: [
          arg.accountAddress as Address,
          arg.superTokenAddress as Address,
          arg.underlyingTokenAddress as Address,
        ],
      });
      const wrapSchedule: WrapSchedule = {
        user: rawWrapSchedule.user,
        superToken: rawWrapSchedule.superToken,
        strategy: rawWrapSchedule.strategy,
        liquidityToken: rawWrapSchedule.liquidityToken,
        expiry: rawWrapSchedule.expiry.toString(),
        lowerLimit: rawWrapSchedule.lowerLimit.toString(),
        upperLimit: rawWrapSchedule.upperLimit.toString(),
      };
      const isExpired = rawWrapSchedule.expiry < BigInt(dateNowSeconds());

      return {
        data:
          rawWrapSchedule.strategy === zeroAddress || isExpired
            ? null
            : wrapSchedule,
      };
    },
    providesTags: (_result, _error, arg) => [
      {
        type: "GENERAL",
        id: arg.chainId,
      },
    ],
  });

const isAutoWrapAllowanceSufficientEndpoint = (builder: RpcEndpointBuilder) =>
  builder.query<boolean, GetWrapSchedule & { upperLimit: string }>({
    queryFn: async (arg) => {
      const { strategyAddress } = getAutoWrapAddresses(arg.chainId);

      const allowance = await getErc20Allowance({
        chainId: arg.chainId,
        tokenAddress: arg.underlyingTokenAddress,
        ownerAddress: arg.accountAddress,
        spenderAddress: strategyAddress,
      });

      return {
        data: allowance >= BigInt(arg.upperLimit),
      };
    },
    providesTags: (_result, _error, arg) => [
      {
        type: "GENERAL",
        id: arg.chainId,
      },
    ],
  });

const getUnderlyingTokenAllowanceEndpoint = (builder: RpcEndpointBuilder) =>
  builder.query<
    string,
    {
      chainId: number;
      accountAddress: string;
      underlyingTokenAddress: string;
    }
  >({
    queryFn: async (arg) => {
      const { strategyAddress } = getAutoWrapAddresses(arg.chainId);

      const allowance = await getErc20Allowance({
        chainId: arg.chainId,
        tokenAddress: arg.underlyingTokenAddress,
        ownerAddress: arg.accountAddress,
        spenderAddress: strategyAddress,
      });

      return {
        data: allowance.toString(),
      };
    },
    providesTags: (_result, _error, arg) => [
      {
        type: "GENERAL",
        id: arg.chainId,
      },
    ],
  });

export const autoWrapEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getActiveWrapSchedule: getActiveWrapScheduleEndpoint(builder),
    getUnderlyingTokenAllowance: getUnderlyingTokenAllowanceEndpoint(builder),
    isAutoWrapAllowanceSufficient:
      isAutoWrapAllowanceSufficientEndpoint(builder),
  }),
};
