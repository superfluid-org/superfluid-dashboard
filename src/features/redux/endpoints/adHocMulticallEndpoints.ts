import {
  getFramework,
  RpcEndpointBuilder,
} from "@superfluid-finance/sdk-redux";
import { ContractCallContext, Multicall } from "ethereum-multicall";
import { ethers } from "ethers";
import { uniq } from "lodash";
import { COIN_ADDRESS } from "./adHocSubgraphEndpoints";

const multicallContractAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";

export const adHocMulticallEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    balanceOfMulticall: builder.query<
      { balances: Record<string, string> },
      { chainId: number; accountAddress: string; tokenAddresses: string[] }
    >({
      queryFn: async (arg) => {
        const framework = await getFramework(arg.chainId);
        const multicall = new Multicall({
          ethersProvider: framework.settings.provider,
          tryAggregate: true,
          multicallCustomContractAddress: multicallContractAddress,
        });

        const uniqueAddresses = uniq(arg.tokenAddresses);
        const wrapperSuperTokenAddresses = uniqueAddresses.filter(
          (x) => x !== COIN_ADDRESS
        );
        const hasCoin =
          uniqueAddresses.length !== wrapperSuperTokenAddresses.length;

        const tokenContractCalls: ContractCallContext[] =
          wrapperSuperTokenAddresses.map((tokenAddress) => ({
            reference: tokenAddress, // Keep this as the token address because it's used as a dictionary key later!
            contractAddress: ethers.utils.getAddress(tokenAddress),
            abi: [
              {
                constant: true,
                inputs: [
                  {
                    name: "_owner",
                    type: "address",
                  },
                ],
                name: "balanceOf",
                outputs: [
                  {
                    name: "balance",
                    type: "uint256",
                  },
                ],
                payable: false,
                stateMutability: "view",
                type: "function",
              },
            ],
            calls: [
              {
                reference: "balanceOfCall",
                methodName: "balanceOf",
                methodParameters: [ethers.utils.getAddress(arg.accountAddress)],
              },
            ],
          }));

        const coinBalanceCall: ContractCallContext = {
          reference: COIN_ADDRESS, // Keep this as the coin key because it's used as a dictionary key later!
          contractAddress: ethers.utils.getAddress(multicallContractAddress),
          abi: [
            {
              inputs: [
                { internalType: "address", name: "addr", type: "address" },
              ],
              name: "getEthBalance",
              outputs: [
                { internalType: "uint256", name: "balance", type: "uint256" },
              ],
              stateMutability: "view",
              type: "function",
            },
          ],
          calls: [
            {
              reference: "coinBalanceCall",
              methodName: "getEthBalance",
              methodParameters: [ethers.utils.getAddress(arg.accountAddress)],
            },
          ],
        };

        const contractCalls = tokenContractCalls.concat(hasCoin ? coinBalanceCall : []);
        const call = await multicall.call(contractCalls);

        const weiAmounts = Object.fromEntries(
          Object.entries(call.results).map(([key, value]) => [
            key,
            ethers.BigNumber.from(
              value.callsReturnContext[0].returnValues[0].hex
            ).toString(),
          ])
        );

        return {
          data: {
            balances: weiAmounts,
          },
        };
      },
      providesTags: (_result, _error, arg) => [
        {
          type: "GENERAL",
          id: arg.chainId, // TODO(KK): Could be made more specific.
        },
      ],
    }),
  }),
};
