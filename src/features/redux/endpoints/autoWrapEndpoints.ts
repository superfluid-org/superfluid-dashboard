import { ERC20__factory } from "@superfluid-finance/sdk-core";
import {
  getFramework,
  RpcEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { BigNumber, constants } from "ethers";
import { getAutoWrap } from "../../../eth-sdk/getEthSdk";
import { dateNowSeconds } from "../../../utils/dateUtils";

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

const getActiveWrapScheduleEndpoint = (builder: RpcEndpointBuilder) =>
  builder.query<WrapSchedule | null, GetWrapSchedule>({
    queryFn: async (arg) => {
      const framework = await getFramework(arg.chainId);
      const { manager } = getAutoWrap(arg.chainId, framework.settings.provider);
      const rawWrapSchedule = await manager.getWrapSchedule(
        arg.accountAddress,
        arg.superTokenAddress,
        arg.underlyingTokenAddress
      );
      const wrapSchedule: WrapSchedule = {
        user: rawWrapSchedule.user,
        superToken: rawWrapSchedule.superToken,
        strategy: rawWrapSchedule.strategy,
        liquidityToken: rawWrapSchedule.liquidityToken,
        expiry: rawWrapSchedule.expiry.toString(), // Should have been `number`, not `BigNumber`.
        lowerLimit: rawWrapSchedule.lowerLimit.toString(), // Should have been `number`, not `BigNumber`.
        upperLimit: rawWrapSchedule.upperLimit.toString(), // Should have been `number`, not `BigNumber`.
      };
      const isExpired = rawWrapSchedule.expiry.lt(
        BigNumber.from(dateNowSeconds())
      );

      return {
        data:
          rawWrapSchedule.strategy === constants.AddressZero || isExpired
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
      const framework = await getFramework(arg.chainId);
      const tokenContract = ERC20__factory.connect(
        arg.underlyingTokenAddress,
        framework.settings.provider
      );

      const { strategy } = getAutoWrap(
        arg.chainId,
        framework.settings.provider
      );

      const allowance = await tokenContract.allowance(
        arg.accountAddress,
        strategy.address
      );
      const upperLimit = BigNumber.from(arg.upperLimit);

      return {
        data: allowance.gte(upperLimit),
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
      const framework = await getFramework(arg.chainId);
      const token = ERC20__factory.connect(
        arg.underlyingTokenAddress,
        framework.settings.provider
      );

      const { strategy } = getAutoWrap(
        arg.chainId,
        framework.settings.provider
      );

      const allowance = await token.allowance(
        arg.accountAddress,
        strategy.address
      );

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
