import { TransactionResponse } from "@ethersproject/abstract-provider";
import { ERC20__factory, Operation } from "@superfluid-finance/sdk-core";
import {
  BaseSuperTokenMutation,
  getFramework,
  RpcEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { prepareWriteContract } from "@wagmi/core";
import { constants } from "ethers";
import promiseRetry from "promise-retry";
import { AutoWrapStrategy__factory } from "../../../eth-sdk/client/types";
import { getAutoWrap } from "../../../eth-sdk/getEthSdk";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";

type GetWrapSchedule = {
  chainId: number;
  accountAddress: string;
  superTokenAddress: string;
  underlyingTokenAddress: string;
};

type WrapSchedule = {
  user: string;
  superToken: string;
  strategy: string;
  liquidityToken: string;
  expiry: string; // Why was this a big number?
  lowerLimit: string; // Why was this a big number?
  upperLimit: string; // Why was this a big number?
};

const createGetWrapScheduleEndpoint = (builder: RpcEndpointBuilder) =>
  builder.query<WrapSchedule, GetWrapSchedule>({
    queryFn: async (arg) => {
      const framework = await getFramework(arg.chainId);
      const { manager } = getAutoWrap(
        arg.chainId,
        framework.settings.provider
      );
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
        expiry: rawWrapSchedule.expiry.toString(), // Why was this a big number?
        lowerLimit: rawWrapSchedule.lowerLimit.toString(), // Why was this a big number?
        upperLimit: rawWrapSchedule.upperLimit.toString(), // Why was this a big number?
      };

      return {
        data: wrapSchedule,
      };
    },
  });

type AutoWrapAllowanceMutation = BaseSuperTokenMutation & {
  accountAddress: string;
  underlyingTokenAddress: string;
};

const createAutoWrapApproveEndpoint = (builder: RpcEndpointBuilder) =>
  builder.mutation<TransactionResponse, AutoWrapAllowanceMutation>({
    queryFn: async ({ chainId, signer, underlyingTokenAddress, overrides }) => {
      // Need to approve the strategy.

      const { strategy } = getAutoWrap(chainId, signer);
      
      const contract = ERC20__factory.connect(underlyingTokenAddress, signer);
    //   const config = await prepareWriteContract({
    //     address: contract.address as `0x${string}`,
    //     abi: ,
    //     functionName: 'feed',
    //   })

      const foo = await contract.populateTransaction.approve(strategy.address, constants.MaxUint256, overrides);

      return {
        data: null!,
      };
    },
  });

export const autoWrapEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    autoWrapApprove: createAutoWrapApproveEndpoint(builder),
    getWrapSchedule: createGetWrapScheduleEndpoint(builder),
  }),
};
