import { getFramework } from "@superfluid-finance/sdk-redux";
import { ContractCallContext, Multicall } from "ethereum-multicall";
import { BigNumber, ethers } from "ethers";
import promiseRetry from "promise-retry";
import { allNetworks } from "../../network/networks";
import { NATIVE_ASSET_ADDRESS } from "./tokenTypes";

const multicallContractAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";

export type UnderlyingBalance = {
  balance: string;
};

export type RealtimeBalance = {
  balance: string;
  balanceTimestamp: number;
  flowRate: string;
};

export type BalanceQueryParams = {
  chainId: number;
  tokenAddress: string;
  accountAddress: string;
};

const getKey = (params: BalanceQueryParams): string =>
  `${params.chainId}-${params.tokenAddress}-${params.accountAddress}`.toLowerCase();

const mutableNetworkStates: Record<
  number,
  {
    queryBatch: { isSuperToken: boolean; params: BalanceQueryParams }[];
    nextFetching: Promise<
      Record<string, UnderlyingBalance | RealtimeBalance>
    > | null;
  }
> = Object.fromEntries(
  allNetworks.map((x) => [x.id, { nextFetching: null, queryBatch: [] }])
);

const createFetching = (
  chainId: number
): Promise<Record<string, UnderlyingBalance | RealtimeBalance>> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const state = mutableNetworkStates[chainId];
      state.nextFetching = null;

      if (state.queryBatch.length) {
        const queries = state.queryBatch.splice(0, state.queryBatch.length); // Makes a copy of the queries and empties the original array.
        const framework = await getFramework(chainId);

        const superTokenCalls = (
          await Promise.all(
            queries
              .filter((x) => x.isSuperToken)
              .map((x) =>
                createRealtimeBalanceCalls(
                  framework.contracts.cfaV1.address,
                  x.params
                )
              )
          )
        ).flat();

        const underlyingTokenCalls = queries
          .filter((x) => !x.isSuperToken)
          .map((x) => createUnderlyingBalanceCall(x.params));

        const contractCalls = superTokenCalls.concat(underlyingTokenCalls);

        const multicall = new Multicall({
          ethersProvider: framework.settings.provider,
          tryAggregate: true,
          multicallCustomContractAddress: multicallContractAddress,
        });

        const results = await promiseRetry(
          (retry) =>
            multicall
              .call(contractCalls)
              .catch(retry)
              .then((x) => x.results),
          {
            minTimeout: 100,
            maxTimeout: 1000,
            retries: 5,
          }
        );

        const mappedResult = Object.fromEntries(
          queries.map((x) => {
            if (x.isSuperToken) {
              const getNetFlowCall =
                results[getKey(x.params) + "-getNetFlow"].callsReturnContext[0];
              const realtimeBalanceOfNowCall =
                results[getKey(x.params) + "-realtimeBalanceOfNow"]
                  .callsReturnContext[0];

              return [
                getKey(x.params),
                {
                  balance: ethers.BigNumber.from(
                    realtimeBalanceOfNowCall.returnValues[0]
                  ).toString(),
                  balanceTimestamp: BigNumber.from(
                    realtimeBalanceOfNowCall.returnValues[3]
                  ).toNumber(),
                  flowRate: ethers.BigNumber.from(
                    getNetFlowCall.returnValues[0]
                  ).toString(),
                } as RealtimeBalance,
              ];
            } else {
              const balanceOfCall =
                results[getKey(x.params)].callsReturnContext[0]; // "getEthBalance" or "balanceOf"
              return [
                getKey(x.params),
                {
                  balance: ethers.BigNumber.from(
                    balanceOfCall.returnValues[0]
                  ).toString(),
                },
              ];
            }
          })
        );

        resolve(mappedResult);
      }
    }, 150);
  });
};

export const balanceFetcher = {
  async getUnderlyingBalance(
    params: BalanceQueryParams
  ): Promise<UnderlyingBalance> {
    const state = mutableNetworkStates[params.chainId];
    state.queryBatch.push({
      params,
      isSuperToken: false,
    });
    state.nextFetching = state.nextFetching || createFetching(params.chainId);
    return (await state.nextFetching)[getKey(params)] as UnderlyingBalance;
  },
  async getRealtimeBalance(
    params: BalanceQueryParams
  ): Promise<RealtimeBalance> {
    const state = mutableNetworkStates[params.chainId];
    state.queryBatch.push({
      params,
      isSuperToken: true,
    });
    state.nextFetching = state.nextFetching || createFetching(params.chainId);
    return (await state.nextFetching)[getKey(params)] as RealtimeBalance;
  },
};

const createUnderlyingBalanceCall = (
  params: BalanceQueryParams
): ContractCallContext => {
  if (params.tokenAddress === NATIVE_ASSET_ADDRESS) {
    return {
      reference: getKey(params), // Keep this as the coin key because it's used as a dictionary key later!
      contractAddress: ethers.utils.getAddress(multicallContractAddress),
      abi: [
        {
          inputs: [{ internalType: "address", name: "addr", type: "address" }],
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
          methodParameters: [ethers.utils.getAddress(params.accountAddress)],
        },
      ],
    };
  } else {
    return {
      reference: getKey(params),
      contractAddress: ethers.utils.getAddress(params.tokenAddress),
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
          methodParameters: [ethers.utils.getAddress(params.accountAddress)],
        },
      ],
    };
  }
};

const createRealtimeBalanceCalls = async (
  cfaContractAddress: string,
  params: BalanceQueryParams
): Promise<[ContractCallContext, ContractCallContext]> => {
  return [
    {
      reference: getKey(params) + "-realtimeBalanceOfNow",
      contractAddress: ethers.utils.getAddress(params.tokenAddress),
      abi: [
        {
          name: "realtimeBalanceOfNow",
          inputs: [
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          outputs: [
            {
              internalType: "int256",
              name: "availableBalance",
              type: "int256",
            },
            {
              internalType: "uint256",
              name: "deposit",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "owedDeposit",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      calls: [
        {
          reference: "realtimeBalanceOfNowCall",
          methodName: "realtimeBalanceOfNow",
          methodParameters: [ethers.utils.getAddress(params.accountAddress)],
        },
      ],
    },
    {
      reference: getKey(params) + "-getNetFlow",
      contractAddress: cfaContractAddress,
      abi: [
        {
          name: "getNetFlow",
          inputs: [
            {
              internalType: "contract ISuperfluidToken",
              name: "token",
              type: "address",
            },
            {
              internalType: "address",
              name: "account",
              type: "address",
            },
          ],
          outputs: [
            {
              internalType: "int96",
              name: "flowRate",
              type: "int96",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      calls: [
        {
          reference: "getNetFlowCall",
          methodName: "getNetFlow",
          methodParameters: [
            ethers.utils.getAddress(params.tokenAddress),
            ethers.utils.getAddress(params.accountAddress),
          ],
        },
      ],
    },
  ];
};
