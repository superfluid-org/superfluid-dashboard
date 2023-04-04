import { ERC20__factory } from "@superfluid-finance/sdk-core";
import {
  getFramework,
  RpcEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { constants } from "ethers";
import { getAutoWrap } from "../../../eth-sdk/getEthSdk";
import { isCloseToUnlimitedTokenAllowance } from "../../../utils/isCloseToUnlimitedAllowance";
import { rpcApiBase } from "../store";

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

      return {
        data:
          rawWrapSchedule.strategy === constants.AddressZero
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

const isAutoWrapStrategyConfiguredEndpoint = (builder: RpcEndpointBuilder) =>
  builder.query<boolean, GetWrapSchedule>({
    queryFn: async (arg, { dispatch }) => {
      const framework = await getFramework(arg.chainId);
      const { strategy } = getAutoWrap(
        arg.chainId,
        framework.settings.provider
      );

      const getWrapSchedule = dispatch(
        rpcApiBase.endpoints.getActiveWrapSchedule.initiate(arg, {
          subscribe: true,
        })
      );
      const wrapSchedule = await getWrapSchedule
        .unwrap()
        .finally(() => getWrapSchedule.unsubscribe());

      const isStrategyConfigured =
        wrapSchedule?.strategy.toLowerCase() === strategy.address.toLowerCase();

      // NOTE: To be completely correct, other properties should be checked as well. For example, to check that it's not expired...

      return {
        data: isStrategyConfigured,
      };
    },
    providesTags: (_result, _error, arg) => [
      {
        type: "GENERAL",
        id: arg.chainId,
      },
    ],
  });

const isAutoWrapAllowanceConfiguredEndpoint = (builder: RpcEndpointBuilder) =>
  builder.query<boolean, GetWrapSchedule>({
    queryFn: async (arg) => {
      const framework = await getFramework(arg.chainId);
      const tokenContract = ERC20__factory.connect(arg.underlyingTokenAddress, framework.settings.provider);

      const { strategy } = getAutoWrap(
        arg.chainId,
        framework.settings.provider
      );

      const allowance = await tokenContract.allowance(arg.accountAddress, strategy.address);

      return {
        data: !allowance.isZero(), // Meh... We check that there has been some allowance interaction.
      };
    },
    providesTags: (_result, _error, arg) => [
      {
        type: "GENERAL",
        id: arg.chainId,
      },
    ],
  });

export const autoWrapEndpoints_1of2 = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getActiveWrapSchedule: getActiveWrapScheduleEndpoint(builder),
    isAutoWrapAllowanceConfigured: isAutoWrapAllowanceConfiguredEndpoint(builder)
  }),
};

export const autoWrapEndpoints_2of2 = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    isAutoWrapStrategyConfigured:
      isAutoWrapStrategyConfiguredEndpoint(builder),
  }),
};
