import { Operation, SuperToken__factory } from "@superfluid-finance/sdk-core";
import { BaseSuperTokenMutation, getFramework, registerNewTransaction, RpcEndpointBuilder, TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { type ProjectsOverview } from "../../../pages/api/agora";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import { Signer } from "ethers";
import { BatchTransaction } from "../../../libs/gnosis-tx-builder/types";
import { constantFlowAgreementV1Abi, superfluidAbi, superfluidAddress, superTokenAbi, vestingSchedulerV3Abi } from "../../../generated";
import { encodeFunctionData, getAbiItem } from "viem";

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
    
    const operations: SubOperation[] = [];

    const network = findNetworkOrThrow(allNetworks, state.chainId);
    const vestingScheduler = getVestingScheduler(network.id, signer, 'v3');
    const framework = await getFramework(network.id);
    const allActions = [...state.allowanceActions, ...state.projects.flatMap(project => project.todo)];

    for (const action of allActions) {
        switch (action.type) {
            case "increase-token-allowance": {
                const superTokenContract = SuperToken__factory.connect(
                    action.payload.superToken,
                    signer
                );
                const approveAllowancePromise =
                    superTokenContract.populateTransaction.increaseAllowance(
                        vestingScheduler.address,
                        action.payload.allowanceDelta
                    );
                const operation = new Operation(
                    approveAllowancePromise,
                    "ERC20_INCREASE_ALLOWANCE"
                );
                operations.push({
                    operation,
                    title: "Approve Allowance",
                });
                break;
            }
            case "increase-flow-operator-permissions": {
                const superToken = await framework.loadSuperToken(action.payload.superToken);
                operations.push({
                    operation: await superToken.increaseFlowRateAllowanceWithPermissions({
                        flowOperator: vestingScheduler.address,
                        flowRateAllowanceDelta: action.payload.flowRateAllowanceDelta,
                        permissionsDelta: action.payload.permissionsDelta
                    }),
                    title: "Approve Vesting Scheduler",
                });
                break;
            }
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
                const populatedTransaction = vestingScheduler
                    .populateTransaction.updateVestingScheduleFlowRateFromAmountAndEndDate(
                        action.payload.superToken,
                        action.payload.receiver,
                        action.payload.totalAmount,
                        action.payload.endDate
                    );
                const operation = new Operation(
                    populatedTransaction,
                    'ERC2771_FORWARD_CALL'
                );
                operations.push({
                    operation: operation,
                    title: "Update Vesting Schedule" // end date
                });


                break;
            }
            case "stop-vesting-schedule": {
                break;
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

    const allActions = [...state.allowanceActions, ...state.projects.flatMap(project => project.todo)];
    for (const action of allActions) {
        switch (action.type) {
            case "increase-token-allowance": {
                const args = [
                    vestingContractInfo.address,
                    BigInt(action.payload.allowanceDelta)
                ] as const;

                const functionAbi = getAbiItem({
                    abi: superTokenAbi,
                    name: 'increaseAllowance',
                    args
                })

                transactions.push({
                    to: action.payload.superToken,
                    contractMethod: functionAbi,
                    contractInputsValues: args.reduce((acc, arg, index) => {
                        acc[`arg${index}`] = arg.toString();
                        return acc;
                    }, {} as Record<string, string>)
                })

                break;
            }
            case "increase-flow-operator-permissions": {
                const internalArgs = [
                    action.payload.superToken,
                    vestingContractInfo.address,
                    action.payload.permissionsDelta,
                    BigInt(action.payload.flowRateAllowanceDelta),
                    "0x"
                ] as const;

                const callData = encodeFunctionData({
                    abi: constantFlowAgreementV1Abi,
                    functionName: "increaseFlowRateAllowanceWithPermissions",
                    args: internalArgs
                });

                const args = [
                    vestingContractInfo.address,
                    callData,
                    "0x"
                ] as const;

                const functionAbi = getAbiItem({
                    abi: superfluidAbi,
                    name: 'callAgreement',
                    args
                })

                transactions.push({
                    to: superfluidAddress[network.id as keyof typeof superfluidAddress],
                    contractMethod: functionAbi,
                    contractInputsValues: mapArgsIntoContractInputsValues(args)
                });

                break;
            }
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
                    contractMethod: functionAbi,
                    contractInputsValues: mapArgsIntoContractInputsValues(args)
                })
                break;
            }
            case "update-vesting-schedule": {
                const args = [
                    action.payload.superToken,
                    action.payload.receiver,
                    BigInt(action.payload.totalAmount),
                    action.payload.endDate
                ] as const;
                const functionAbi = getAbiItem({
                    abi: vestingSchedulerV3Abi,
                    name: 'updateVestingScheduleFlowRateFromAmountAndEndDate',
                    args
                })
                transactions.push({
                    to: vestingContractInfo.address,
                    contractMethod: functionAbi,
                    contractInputsValues: mapArgsIntoContractInputsValues(args)
                })
                break;
            }
            case "stop-vesting-schedule": {
                break;
            }
        }
    }

    return transactions;
}

function mapArgsIntoContractInputsValues(args: ReadonlyArray<(string | bigint | number)>) {
    return args.reduce((acc, arg, index) => {
        acc[`arg${index}`] = arg.toString();
        return acc;
    }, {} as Record<string, string>)
}