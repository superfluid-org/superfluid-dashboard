import { Operation } from "@superfluid-finance/sdk-core";
import { BaseSuperTokenMutation, getFramework, RpcEndpointBuilder, TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { type ProjectsOverview } from "../../../pages/api/agora";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import { Signer } from "ethers";

export interface ExecuteTranchUpdate extends BaseSuperTokenMutation, ProjectsOverview {
}

export const createVestingScheduleEndpoint = (builder: RpcEndpointBuilder) => ({
    executeTranchUpdate: builder.mutation<
        TransactionInfo & { subTransactionTitles: TransactionTitle[] },
        ExecuteTranchUpdate
    >({
        queryFn: async (
            { signer, ...arg },
            { dispatch }
        ) => {

            const signerAddress = await signer.getAddress();
            if (signerAddress !== arg.senderAddress) {
                throw new Error("Signer address does not match sender address");
            }

            const operations = await mapProjectStateIntoOperations(arg, signer);

            return {
                data: null!
            }
        },
    })
});

type SubOperation = {
    operation: Operation;
    title: TransactionTitle;
};

async function mapProjectStateIntoOperations(state: ProjectsOverview, signer: Signer): Promise<SubOperation[]> {
    // TODO: This should probably be moved into a redux slice...

    const operations: SubOperation[] = [];

    const network = findNetworkOrThrow(allNetworks, state.chainId);
    const vestingScheduler = getVestingScheduler(network.id, signer, 'v3');
    const framework = await getFramework(network.id);
    const superToken = await framework.loadSuperToken(state.superTokenAddress);

    // TODO: needs tokens

    for (const project of state.projects) {
        for (const action of project.todo) {
            switch (action.type) {
                case "create-vesting-schedule": {
                    const populatedTransaction = vestingScheduler
                        .populateTransaction[
                        'createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)'
                    ](
                        action.payload.superToken,
                        action.payload.receiver,
                        action.payload.totalAmount,
                        action.payload.totalDuration,
                        state.tranchPlan.tranches[state.tranchPlan.currentTranchCount - 1].startTimestamp, // start date, should be the beginning of next tranch?
                        0, // cliff period, should be 0
                        0, // claim period, should be 0 // TODO: this should be how much longer than the end of the tranch?
                        0  // cliff amount, should be 0 // TODO: need to calculate this
                    );
                    const operation = new Operation(
                        populatedTransaction,
                        'ERC2771_FORWARD_CALL'
                    );
                    operations.push({
                        operation,
                        title: "Create Vesting Schedule"
                    });
                    break;
                }
                case "update-vesting-schedule": {
                    // {
                    //     type: 'function',
                    //     inputs: [
                    //       {
                    //         name: 'superToken',
                    //         internalType: 'contract ISuperToken',
                    //         type: 'address',
                    //       },
                    //       { name: 'receiver', internalType: 'address', type: 'address' },
                    //       { name: 'newTotalAmount', internalType: 'uint256', type: 'uint256' },
                    //       { name: 'ctx', internalType: 'bytes', type: 'bytes' },
                    //     ],
                    //     name: 'updateVestingScheduleFlowRateFromAmount',
                    //     outputs: [{ name: 'newCtx', internalType: 'bytes', type: 'bytes' }],
                    //     stateMutability: 'nonpayable',
                    //   },

                    // operations.push(updateVestingSchedule(action.payload));
                    const populatedTransaction = await vestingScheduler
                        .populateTransaction.updateVestingScheduleFlowRateFromAmount(
                            action.payload.superToken,
                            action.payload.receiver,
                            action.payload.totalAmount,
                            []
                        );
                    const operation = await framework.host.callAppAction(
                        vestingScheduler.address,
                        populatedTransaction.data!
                    );
                    operations.push({
                        operation,
                        title: "Update Vesting Schedule"
                    });
                    break;
                }
                case "stop-vesting-schedule": {

                    // TODO: stopping means bringing up the end date
                    const populatedTransaction = await vestingScheduler
                        .populateTransaction.updateVestingSchedule(
                            action.payload.superToken,
                            action.payload.receiver,
                            state.tranchPlan.tranches[state.tranchPlan.currentTranchCount - 1].endTimestamp,
                            []
                        );

                    const operation = await framework.host.callAppAction(
                        vestingScheduler.address,
                        populatedTransaction.data!
                    );

                    operations.push({
                        operation,
                        title: "Update Vesting Schedule"
                    });
                    break;
                }
            }
        }
    }

    return operations;
}