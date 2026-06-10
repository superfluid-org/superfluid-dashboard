import { Actions, type ProjectsOverview } from "../../../pages/api/agora";
import { allNetworks, findNetworkOrThrow } from "../../network/networks";
import { BatchTransaction } from "../../../libs/gnosis-tx-builder/types";
import { constantFlowAgreementV1Abi, constantFlowAgreementV1Address, superfluidAbi, superfluidAddress, superTokenAbi, vestingSchedulerV3Abi } from "../../../generated";
import { encodeFunctionData, getAbiItem } from "viem";

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
            case "end-vesting-schedule-now": {
                const args = [
                    action.payload.superToken,
                    action.payload.receiver
                ] as const;
                const functionAbi = getAbiItem({
                    abi: vestingSchedulerV3Abi,
                    name: 'endVestingScheduleNow',
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
            case "delete-vesting-schedule": {
                const args = [
                    action.payload.superToken,
                    action.payload.receiver
                ] as const;
                const functionAbi = getAbiItem({
                    abi: vestingSchedulerV3Abi,
                    name: 'deleteVestingSchedule',
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
            case "let-vesting-schedule-end": {
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
