import {
  BaseSuperTokenMutation,
  getFramework,
  registerNewTransaction,
  RpcEndpointBuilder,
  TransactionInfo,
  TransactionTitle
} from "@superfluid-finance/sdk-redux";
import { convertVestingScheduleFromAmountAndDurationsToAbsolutes, VestingScheduleFromAmountAndDurationsParams } from "../../vesting/batch/VestingScheduleParams";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import { Operation, SuperToken__factory } from "@superfluid-finance/sdk-core";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { calculateRequiredAccessForActiveVestingSchedule } from "../../vesting/VestingSchedulesAllowancesTable/calculateRequiredAccessForActiveVestingSchedule";
import { BigNumber } from "ethers";
import { ACL_UPDATE_PERMISSION } from "@/utils/constants";

interface ExecuteBatchVesting extends BaseSuperTokenMutation {
  params: VestingScheduleFromAmountAndDurationsParams[];
  version: "v3"
}

export const batchVestingEndpoints = {
  endpoints: (builder: RpcEndpointBuilder) => ({
    executeBatchVesting: builder.mutation<TransactionInfo & {
      subTransactionTitles: TransactionTitle[];
      signerAddress: string;
    }, ExecuteBatchVesting>({
      queryFn: async ({ params, chainId, superTokenAddress, signer, transactionExtraData, version }, { dispatch }) => {
        const framework = await getFramework(chainId);
        const superToken = await framework.loadSuperToken(superTokenAddress);
        const vestingScheduler = getVestingScheduler(chainId, signer, version);
        const network = findNetworkOrThrow(allNetworks, chainId);

        const subOperations: {
          operation: Operation;
          title: TransactionTitle;
        }[] = [];

        const paramsWithAbsolutes = params.map(convertVestingScheduleFromAmountAndDurationsToAbsolutes);
        const requiredAllowances = paramsWithAbsolutes.map(x => calculateRequiredAccessForActiveVestingSchedule({
          cliffAndFlowDate: x.cliffDate ? x.cliffDate : x.startDate,
          ...x
        }, {
          START_DATE_VALID_AFTER_IN_SECONDS: network.vestingContractAddress.v3!.START_DATE_VALID_AFTER_IN_SECONDS,
          END_DATE_VALID_BEFORE_IN_SECONDS: network.vestingContractAddress.v3!.END_DATE_VALID_BEFORE_IN_SECONDS
        }));

        const totalRequiredTokenAllowance = requiredAllowances.reduce((acc, x) => acc.add(x.recommendedTokenAllowance), BigNumber.from(0));
        const totalRequiredFlowRateAllowance = requiredAllowances.reduce((acc, x) => acc.add(x.requiredFlowRateAllowance), BigNumber.from(0));

        subOperations.push({
          operation: superToken.increaseFlowRateAllowanceWithPermissions({
            flowOperator: vestingScheduler.address,
            flowRateAllowanceDelta: totalRequiredFlowRateAllowance.toString(),
            permissionsDelta: requiredAllowances[0].requiredFlowOperatorPermissions | ACL_UPDATE_PERMISSION // Update is not required but recommended.
          }),
          title: "Approve Vesting Scheduler",
        });

        const superTokenContract = SuperToken__factory.connect(
          superToken.address,
          signer
        );
        const approveAllowancePromise =
          superTokenContract.populateTransaction.increaseAllowance(
            vestingScheduler.address,
            totalRequiredTokenAllowance
          );
        subOperations.push({
          operation: new Operation(
            approveAllowancePromise,
            "ERC20_INCREASE_ALLOWANCE"
          ),
          title: "Approve Allowance",
        });

        await Promise.all(
          params.map(async (arg) => {
            const tx = vestingScheduler.populateTransaction[
              "createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32)"
            ](
              superTokenAddress,
              arg.receiver,
              arg.totalAmount,
              arg.totalDuration,
              arg.startDate,
              arg.cliffPeriod,
              arg.claimPeriod
            );

            subOperations.push({
              operation: new Operation(
                tx,
                'ERC2771_FORWARD_CALL'
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
          title: "Create Batch of Vesting Schedules"
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
