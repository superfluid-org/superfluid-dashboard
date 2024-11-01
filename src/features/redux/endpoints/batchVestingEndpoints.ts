import {
  BaseQuery,
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransaction,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle
} from "@superfluid-finance/sdk-redux";
import { VestingScheduleFromAmountAndDurationsParams } from "../../vesting/batch/VestingScheduleParams";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import { Address, Operation } from "@superfluid-finance/sdk-core";
import { getTxBuilderInputs_v2 } from "../../vesting/batch/gnosisSafe";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { SafeTxBuilderInput } from "../../vesting/batch/safeUtils";

interface GetSafeTxBuilderJsons extends BaseQuery<string> {
  params: VestingScheduleFromAmountAndDurationsParams[];
}

interface ExecuteBatchVesting extends BaseSuperTokenMutation {
  params: VestingScheduleFromAmountAndDurationsParams[];
}

export const batchVestingEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    txBuilderInputs: builder.query<SafeTxBuilderInput[], GetSafeTxBuilderJsons>({
      queryFn: async ({ params, chainId }) => {
        const network = findNetworkOrThrow(allNetworks, chainId);
        return ({
          data: await getTxBuilderInputs_v2({
            network,
            schedules: params
          })
        });
      },
      keepUnusedDataFor: 180
    }),
    executeBatchVesting: builder.mutation<TransactionInfo & {
      subTransactionTitles: TransactionTitle[];
      signerAddress: string;
    }, ExecuteBatchVesting>({
      queryFn: async ({ params, chainId, superTokenAddress, signer, transactionExtraData }, { dispatch }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);
        const vestingScheduler = getVestingScheduler(chainId, signer, "v2");

        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        await Promise.all(
          params.map(async (arg) => {
            const tx = await vestingScheduler.populateTransaction[
              "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,bytes)"
            ](
              superTokenAddress,
              arg.receiver,
              arg.totalAmount,
              arg.totalDuration,
              arg.startDate,
              arg.cliffPeriod,
              arg.claimPeriod,
              []
            );

            subOperations.push({
              operation: await framework.host.callAppAction(
                vestingScheduler.address,
                tx.data!
              ),
              title: "Create Vesting Schedule",
            });
          })
        );

        const signerAddress = await signer.getAddress();
        const executable = framework.batchCall(
          subOperations.map((x) => x.operation)
        );
        const subTransactionTitles = subOperations.map((x) => x.title);

        const transactionResponse = await executable.exec(signer);

        await registerNewTransaction({
          dispatch,
          chainId,
          transactionResponse,
          signerAddress,
          extraData: {
            subTransactionTitles,
            ...(transactionExtraData ?? {}),
          },
          title: "Create Batch of Vesting Schedules", // Use a different title here?
        });

        return {
          data: {
            chainId,
            hash: transactionResponse.hash,
            subTransactionTitles,
            signerAddress
          },
        };
      },
    }),
  })
};
