import {
  BaseSuperTokenMutation,
  getFramework,
  RpcEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { erc20ABI, prepareWriteContract } from "@wagmi/core";
import { constants } from "ethers";
import { getAutoWrap } from "../../../eth-sdk/getEthSdk";

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

// Rename to "active".
const createGetWrapScheduleEndpoint = (builder: RpcEndpointBuilder) =>
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
        expiry: rawWrapSchedule.expiry.toString(), // Why was this a big number?
        lowerLimit: rawWrapSchedule.lowerLimit.toString(), // Why was this a big number?
        upperLimit: rawWrapSchedule.upperLimit.toString(), // Why was this a big number?
      };

      return {
        data:
          rawWrapSchedule.strategy === constants.AddressZero
            ? null
            : wrapSchedule,
      };
    },
  });

type AutoWrapAllowanceMutation = {
  accountAddress: string;
  underlyingTokenAddress: string;
} & Pick<BaseSuperTokenMutation, "chainId" | "signer" | "overrides">;

// const createPrepareAutoWrapApproveEndpoint = (builder: RpcEndpointBuilder) =>
//   builder.mutation<unknown, AutoWrapAllowanceMutation>({
//     queryFn: async ({ chainId, signer, underlyingTokenAddress, overrides }) => {
//       const { strategy } = getAutoWrap(chainId, signer);
//       const config = await prepareWriteContract({
//         address: underlyingTokenAddress as `0x${string}`,
//         abi: erc20ABI,
//         functionName: "approve",
//         args: [strategy.address as `0x${string}`, constants.MaxUint256],
//         signer: signer,
//         chainId: chainId,
//         overrides: overrides as any, // `0x${string}` issue
//       });

//       return {
//         // data: config,
//         data: { } as any
//       };
//     },
//     serializeQueryArgs: ({ queryArgs }) => {
//       const { signer, overrides, ...rest } = queryArgs;
//       return rest;
//     },
//   });

export const autoWrapEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    // prepareAutoWrapApprove: createPrepareAutoWrapApproveEndpoint(builder),
    getWrapSchedule: createGetWrapScheduleEndpoint(builder),
  }),
};
