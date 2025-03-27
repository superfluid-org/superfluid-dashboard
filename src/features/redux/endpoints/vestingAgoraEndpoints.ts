import { Operation } from "@superfluid-finance/sdk-core";
import { BaseSuperTokenMutation, getFramework, registerNewTransaction, RpcEndpointBuilder, TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { type ProjectsOverview } from "../../../pages/api/agora";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import { Signer } from "ethers";
import { UnitOfTime } from "../../send/FlowRateInput";

export interface ExecuteTranchUpdate extends BaseSuperTokenMutation, ProjectsOverview {
}

export const vestingAgoraEndpoints = {
    endpoints: (builder: RpcEndpointBuilder) => ({
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
    
                const subOperations = await mapProjectStateIntoOperations(arg, signer);
    
                const framework = await getFramework(arg.chainId);
                const executable = framework.batchCall(
                    subOperations.map((x) => x.operation)
                );
                const subTransactionTitles = subOperations.map((x) => x.title);
    
                const transactionResponse = await executable.exec(signer);
    
                await registerNewTransaction({
                    dispatch,
                    chainId: arg.chainId,
                    transactionResponse,
                    signerAddress,
                    extraData: {
                        subTransactionTitles,
                        ...(arg.transactionExtraData ?? {}),
                    },
                    title: "Execute Tranch Update"
                });
    
                return {
                    data: {
                        chainId: arg.chainId,
                        hash: transactionResponse.hash,
                        subTransactionTitles,
                    },
                };
                
            },
        })
    })
}

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
    // const superToken = await framework.loadSuperToken(state.superTokenAddress);
    const claimPeriod = 1 * UnitOfTime.Year; // TODO: This should be made dynamic based on the current tranch.

    for (const project of state.projects) {
        for (const action of project.todo) {
            switch (action.type) {
                case "create-vesting-schedule": {
                    const hasCliff = BigInt(action.payload.cliffAmount) > 0n;

                    // {
                    //     name: 'superToken',
                    //     internalType: 'contract ISuperToken',
                    //     type: 'address',
                    //   },
                    //   { name: 'receiver', internalType: 'address', type: 'address' },
                    //   { name: 'totalAmount', internalType: 'uint256', type: 'uint256' },
                    //   { name: 'totalDuration', internalType: 'uint32', type: 'uint32' },
                    //   { name: 'startDate', internalType: 'uint32', type: 'uint32' },
                    //   { name: 'cliffPeriod', internalType: 'uint32', type: 'uint32' },
                    //   { name: 'claimPeriod', internalType: 'uint32', type: 'uint32' },
                    //   { name: 'cliffAmount', internalType: 'uint256', type: 'uint256' },
                    //   { name: 'ctx', internalType: 'bytes', type: 'bytes' },

                    const populatedTransaction = vestingScheduler
                        .populateTransaction[
                        'createVestingScheduleFromAmountAndDuration(address,address,uint256,uint32,uint32,uint32,uint32,uint256)'
                    ](
                        action.payload.superToken,
                        action.payload.receiver,
                        action.payload.totalAmount,
                        action.payload.totalDuration,
                        action.payload.startDate,
                        hasCliff ? 1 : 0, // If there's cliff then set 1 second cliff period for instant transfer.
                        claimPeriod,
                        action.payload.cliffAmount
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
                    const populatedTransaction1 = await vestingScheduler
                        .populateTransaction.updateVestingSchedule(
                            action.payload.superToken,
                            action.payload.receiver,
                            state.tranchPlan.tranches[state.tranchPlan.currentTranchCount - 1].endTimestamp,
                            []
                        );
                    const operation1 = await framework.host.callAppAction(
                        vestingScheduler.address,
                        populatedTransaction1.data!
                    );
                    operations.push({
                        operation: operation1,
                        title: "Update Vesting Schedule" // end date
                    });

                    const populatedTransaction2 = await vestingScheduler
                        .populateTransaction.updateVestingScheduleFlowRateFromAmount(
                            action.payload.superToken,
                            action.payload.receiver,
                            action.payload.totalAmount,
                            []
                        );
                    const operation2 = await framework.host.callAppAction(
                        vestingScheduler.address,
                        populatedTransaction2.data!
                    );

                    operations.push({
                        operation: operation2,
                        title: "Update Vesting Schedule" // amount
                    });
                    break;
                }
                case "stop-vesting-schedule": {
                    break;

                    // NOTE: Nothing needs to be done when stopping.

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