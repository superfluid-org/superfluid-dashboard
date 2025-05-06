import { Operation, SuperToken__factory } from "@superfluid-finance/sdk-core";
import { BaseSuperTokenMutation, getFramework, registerNewTransaction, RpcEndpointBuilder, TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { Actions, AllowanceActions, ProjectActions, type ProjectsOverview } from "../../../pages/api/agora";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { getVestingScheduler } from "../../../eth-sdk/getEthSdk";
import { Signer } from "ethers";
import { BatchTransaction } from "../../../libs/gnosis-tx-builder/types";
import { constantFlowAgreementV1Abi, constantFlowAgreementV1Address, superfluidAbi, superfluidAddress, superTokenAbi, vestingSchedulerV3Abi } from "../../../generated";
import { encodeFunctionData, getAbiItem } from "viem";

export interface ExecuteTranchUpdate extends BaseSuperTokenMutation {
  projectsOverview: ProjectsOverview,
  actionsToExecute: Actions[]
}

export const vestingAgoraEndpoints = {
    endpoints: (builder: RpcEndpointBuilder) => ({
        executeTranchUpdate: builder.mutation<
            TransactionInfo & { subTransactionTitles: TransactionTitle[], signerAddress: string },
            ExecuteTranchUpdate
        >({
            queryFn: async (
                { signer, projectsOverview, actionsToExecute, ...arg },
                { dispatch }
            ) => {

                const { senderAddress} = projectsOverview;

                if (arg.chainId !== projectsOverview.chainId) {
                    throw new Error("Chain ID does not match");
                }

                const signerAddress = await signer.getAddress();
                if (signerAddress !== senderAddress) {
                    throw new Error("Signer address does not match sender address");
                }

                const subOperations = await mapProjectStateIntoOperations(projectsOverview, actionsToExecute, signer);

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

async function mapProjectStateIntoOperations(state: ProjectsOverview, actionsToExecute: Actions[], signer: Signer): Promise<SubOperation[]> {

    const operations: SubOperation[] = [];

    const network = findNetworkOrThrow(allNetworks, state.chainId);
    const vestingScheduler = getVestingScheduler(network.id, signer, 'v3');
    const framework = await getFramework(network.id);

    for (const action of actionsToExecute) {
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
                    operation: superToken.increaseFlowRateAllowanceWithPermissions({
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

export const mapProjectStateIntoGnosisSafeBatch = (state: ProjectsOverview, actionsToExecute: Actions[]) => {
    const transactions: BatchTransaction[] = []

    const network = findNetworkOrThrow(allNetworks, state.chainId);
    const vestingContractInfo = network.vestingContractAddress["v3"];
    if (!vestingContractInfo) {
        throw new Error("Vesting contract not found");
    }

    for (const action of actionsToExecute) {
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

                const argNames = functionAbi.inputs.map(input => input.name);
                transactions.push({
                    to: action.payload.superToken,
                    contractMethod: functionAbi,
                    contractInputsValues: mapArgsIntoContractInputsValues(argNames, args)
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
                    constantFlowAgreementV1Address[network.id as keyof typeof constantFlowAgreementV1Address],
                    callData,
                    "0x"
                ] as const;

                const functionAbi = getAbiItem({
                    abi: superfluidAbi,
                    name: 'callAgreement',
                    args
                })

                const argNames = functionAbi.inputs.map(input => input.name);
                transactions.push({
                    to: superfluidAddress[network.id as keyof typeof superfluidAddress],
                    contractMethod: functionAbi,
                    contractInputsValues: mapArgsIntoContractInputsValues(argNames, args)
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
                const argNames = functionAbi.inputs.map(input => input.name);
                transactions.push({
                    to: vestingContractInfo.address,
                    contractMethod: functionAbi,
                    contractInputsValues: mapArgsIntoContractInputsValues(argNames, args)
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
                const argNames = functionAbi.inputs.map(input => input.name);
                transactions.push({
                    to: vestingContractInfo.address,
                    contractMethod: functionAbi,
                    contractInputsValues: mapArgsIntoContractInputsValues(argNames, args)
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

function mapArgsIntoContractInputsValues(argNames: string[], args: ReadonlyArray<(string | bigint | number)>) {
    if (argNames.length !== args.length) {
        throw new Error("Argument names and values length mismatch");
    }

    return argNames.reduce((acc, argName, index) => {
        acc[argName] = args[index].toString();
        return acc;
    }, {} as Record<string, string>)
}
