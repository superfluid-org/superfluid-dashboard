import { Operation } from "@superfluid-finance/sdk-core";
import { getFramework, RpcEndpointBuilder } from "@superfluid-finance/sdk-redux";
import promiseRetry from "promise-retry";
import { getAutoWrapManager } from "../../../eth-sdk/getEthSdk";

type GetWrapSchedule = {
    chainId: number;
    accountAddress: string;
    superTokenAddress: string;
    underlyingTokenAddress: string;
}

type WrapSchedule = {
    user: string;
    superToken: string;
    strategy: string;
    liquidityToken: string;
    expiry: string; // Why was this a big number?
    lowerLimit: string; // Why was this a big number?
    upperLimit: string; // Why was this a big number?
}

const createWrapScheduleOperation = (): Operation => {
    return { } as any;
}

export const adHocRpcEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    getWrapSchedule: builder.query<WrapSchedule, GetWrapSchedule>({
        queryFn: async (arg) => {
            const framework = await getFramework(arg.chainId);
            const autoWrapManager = getAutoWrapManager(arg.chainId, framework.settings.provider);
            const rawWrapSchedule = await autoWrapManager.getWrapSchedule(arg.accountAddress, arg.superTokenAddress, arg.underlyingTokenAddress);
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
            }
        }
    }),
  }),
};
