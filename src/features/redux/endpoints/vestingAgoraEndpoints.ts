import { Operation } from "@superfluid-finance/sdk-core";
import { BaseSuperTokenMutation, getFramework, registerNewTransaction, RpcEndpointBuilder, TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { type ProjectsOverview } from "../../../pages/api/agora";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import { Signer } from "ethers";
import { BatchTransaction } from "../../../libs/gnosis-tx-builder/types";
import { vestingSchedulerV3Abi } from "../../../generated";
import { decodeFunctionData, encodeFunctionData, getAbiItem } from "viem";

export interface ExecuteTranchUpdate extends BaseSuperTokenMutation, ProjectsOverview {
}

export const vestingAgoraEndpoints = {
    endpoints: (builder: RpcEndpointBuilder) => ({
        executeTranchUpdate: builder.mutation<
            TransactionInfo & { subTransactionTitles: TransactionTitle[], signerAddress: string },
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
                        signerAddress
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
                        action.payload.startDate,
                        action.payload.cliffPeriod,
                        action.payload.claimPeriod,
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
                    const populatedTransaction1 = await vestingScheduler
                        .populateTransaction.updateVestingSchedule(
                            action.payload.superToken,
                            action.payload.receiver,
                            action.payload.endDate,
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
                }
            }
        }
    }

    return operations;
}

export const mapProjectStateIntoGnosisSafeBatch = (state: ProjectsOverview) => {
    const transactions: BatchTransaction[] = []

    const network = findNetworkOrThrow(allNetworks, state.chainId);
    const vestingContractInfo = network.vestingContractAddress["v3"];
    if (!vestingContractInfo) {
        throw new Error("Vesting contract not found");
    }

    for (const project of state.projects) {
        for (const action of project.todo) {
            switch (action.type) {
                case "create-vesting-schedule": {
                    const args = [
                        action.payload.superToken,
                        action.payload.receiver,
                        BigInt(action.payload.totalAmount),
                        action.payload.totalDuration,
                        action.payload.startDate,
                        action.payload.cliffPeriod,
                        action.payload.claimPeriod,
                        BigInt(action.payload.cliffAmount)
                    ] as const;
                    const functionAbi = getAbiItem({
                        abi: vestingSchedulerV3Abi,
                        name: 'createVestingScheduleFromAmountAndDuration',
                        args
                    })
                    transactions.push({
                        to: vestingContractInfo.address,
                        data: null,
                        value: "0",
                        contractMethod: functionAbi,
                        contractInputsValues: args.reduce((acc, arg, index) => {
                            acc[`arg${index}`] = arg.toString();
                            return acc;
                        }, {} as Record<string, string>)
                    })
                    break;
                }
                case "update-vesting-schedule": {
                    const args = [
                        action.payload.superToken,
                        action.payload.receiver,
                        action.payload.endDate,
                        "0x"
                    ] as const;
                    const functionAbi = getAbiItem({
                        abi: vestingSchedulerV3Abi,
                        name: 'updateVestingSchedule',
                        args
                    })
                    transactions.push({
                        to: vestingContractInfo.address,
                        data: null,
                        value: "0",
                        contractMethod: functionAbi,
                        contractInputsValues: args.reduce((acc, arg, index) => {
                            acc[`arg${index}`] = arg.toString();
                            return acc;
                        }, {} as Record<string, string>)
                    })

                    const args2 = [
                        action.payload.superToken,
                        action.payload.receiver,
                        BigInt(action.payload.totalAmount),
                        "0x"
                    ] as const;
                    const functionAbi2 = getAbiItem({
                        abi: vestingSchedulerV3Abi,
                        name: 'updateVestingScheduleFlowRateFromAmount',
                        args: args2
                    })
                    transactions.push({
                        to: vestingContractInfo.address,
                        data: null,
                        value: "0",
                        contractMethod: functionAbi2,
                        contractInputsValues: args2.reduce((acc, arg, index) => {
                            acc[`arg${index}`] = arg.toString();
                            return acc;
                        }, {} as Record<string, string>)
                    })
                    break;
                }
                case "stop-vesting-schedule": {
                    break;
                }
            }
        }
    }

    return transactions;
}