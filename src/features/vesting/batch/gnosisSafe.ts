import { encodeFunctionData, getAddress } from "viem";
import { Address } from "viem";
import { Network } from "../../network/networks";
import { calculateChecksum, getDefaultSafeTxBuilderInput, pipe, SafeTxBuilderInput, Transaction } from "./safeUtils";
import metadata from "@superfluid-finance/metadata";

import { convertVestingScheduleFromAmountAndDurationsToAbsolutes, VestingScheduleFromAmountAndDurationsParams } from "./VestingScheduleParams";
import { getMaximumNeededTokenAllowance } from "../VestingSchedulesAllowancesTable/calculateRequiredAccessForActiveVestingSchedule";
import { constantFlowAgreementV1Abi, superfluidAbi, superTokenAbi } from "../../../generated";
import { ACL_CREATE_PERMISSION, ACL_DELETE_PERMISSION, ACL_UPDATE_PERMISSION } from "@/utils/constants";

type GetTxBuilderInputArgs = {
    schedules: VestingScheduleFromAmountAndDurationsParams[];
    network: Network;
    chunkSize?: number;
    permissionTxSlots?: number;
};

export const getTxBuilderInputs_v3 = ({
    network,
    schedules,
    chunkSize = 100,
    permissionTxSlots = 2,
}: GetTxBuilderInputArgs): SafeTxBuilderInput[] => {
    const txBuilderInput: SafeTxBuilderInput =
        getDefaultSafeTxBuilderInput(network);

    const vestingSchedulerV3Address = network.vestingContractAddress.v3?.address;
    if (!vestingSchedulerV3Address) {
        throw new Error(
            `VestingScheduler contract address not found for chain ${network.name}`
        );
    }

    const transactions = schedules.reduce<Transaction[][]>((acc, schedule, i) => {
        const index = Math.floor(i / (chunkSize - permissionTxSlots));
        const toTx = getCreateVestingScheduleTx(vestingSchedulerV3Address);

        acc[index] = acc[index]
            ? [...acc[index], toTx(schedule)]
            : [toTx(schedule)];

        return acc;
    }, []);

    const createSafeTxBuilderInput = pipe(
        insertTxs(txBuilderInput),
        prependPermissionTxs(network, vestingSchedulerV3Address),
        insertChecksum
    );

    return transactions.map(createSafeTxBuilderInput);
};

export const getCreateVestingScheduleTx =
    (schedulerAddress: Address) =>
        ({
            superToken,
            receiver,
            totalAmount,
            totalDuration,
            startDate,
            claimPeriod,
            cliffPeriod,
        }: VestingScheduleFromAmountAndDurationsParams): Transaction => ({
            to: schedulerAddress,
            value: "0",
            data: null,
            contractMethod: {
                inputs: [
                    {
                        internalType: "contract ISuperToken",
                        name: "superToken",
                        type: "address",
                    },
                    { internalType: "address", name: "receiver", type: "address" },
                    { internalType: "uint256", name: "totalAmount", type: "uint256" },
                    { internalType: "uint32", name: "totalDuration", type: "uint32" },
                    { internalType: "uint32", name: "startDate", type: "uint32" },
                    { internalType: "uint32", name: "cliffPeriod", type: "uint32" },
                    { internalType: "uint32", name: "claimPeriod", type: "uint32" },
                ],
                name: "createVestingScheduleFromAmountAndDuration",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
            } as const,
            contractInputsValues: {
                // use of getAddress() makes/fixes the checksum mixed-case format
                superToken: getAddress(superToken),
                receiver: getAddress(receiver),
                totalAmount: totalAmount.toString(),
                totalDuration: totalDuration.toString(),
                startDate: startDate.toString(),
                cliffPeriod: cliffPeriod.toString(),
                claimPeriod: claimPeriod.toString(),
            },
        });

export const prependPermissionTxs =
    (network: Network, vestingSchedulerAddress: Address) =>
        (safeTxBuilderInput: SafeTxBuilderInput): SafeTxBuilderInput => {
            const [allowance, flowrateAllowance] =
                safeTxBuilderInput.transactions.reduce(
                    (acc, curr) => {
                        const {
                            token,
                            receiver,
                            totalAmount,
                            totalDuration,
                            startDate,
                            cliffPeriod,
                            claimPeriod,
                        } = curr.contractInputsValues;

                        const params = convertVestingScheduleFromAmountAndDurationsToAbsolutes({
                            superToken: token as Address,
                            receiver: receiver as Address,
                            totalAmount: totalAmount,
                            totalDuration: Number(totalDuration),
                            startDate: Number(startDate),
                            cliffPeriod: Number(cliffPeriod),
                            claimPeriod: Number(claimPeriod),
                        });

                        // allowance
                        acc[0] =
                            acc[0] +
                            getMaximumNeededTokenAllowance({
                                schedule: {
                                    ...params,
                                    cliffAndFlowDate: params.cliffDate
                                        ? params.cliffDate
                                        : Number(startDate),
                                },
                                START_DATE_VALID_AFTER_IN_SECONDS: network.vestingContractAddress.v3!.START_DATE_VALID_AFTER_IN_SECONDS,
                                END_DATE_VALID_BEFORE_IN_SECONDS: network.vestingContractAddress.v3!.END_DATE_VALID_BEFORE_IN_SECONDS,
                            });

                        // flowrate allowance
                        acc[1] = acc[1] + BigInt(params.flowRate);

                        return acc;
                    },
                    [BigInt(0), BigInt(0)]
                );

            const superTokenAddress = safeTxBuilderInput.transactions[0]
                .contractInputsValues.superToken as Address;

            const increaseAllowance = superTokenAbi.find(
                (x) => x.type === "function" && x.name === "increaseAllowance"
            );
            if (!increaseAllowance) {
                throw new Error("increaseAllowance not found");
            }

            const increaseAllowanceTx: Transaction = {
                to: superTokenAddress,
                value: "0",
                data: null,
                contractMethod: increaseAllowance,
                contractInputsValues: {
                    spender: vestingSchedulerAddress,
                    addedValue: allowance.toString(),
                },
            };

            const callAgreement = superfluidAbi.find(
                (x) => x.type === "function" && x.name === "callAgreement"
            );
            if (!callAgreement) {
                throw new Error("callAgreement not found");
            }

            const callData = encodeFunctionData({
                abi: constantFlowAgreementV1Abi,
                functionName: "increaseFlowRateAllowanceWithPermissions",
                args: [
                    superTokenAddress,
                    vestingSchedulerAddress,
                    // Update is not required but recommended
                    ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION | ACL_UPDATE_PERMISSION,
                    flowrateAllowance,
                    "0x",
                ],
            });

            const hostAddress = metadata.getNetworkByChainId(network.id)
                ?.contractsV1.host as Address;

            const cfaV1Address = metadata.getNetworkByChainId(network.id)
                ?.contractsV1.cfaV1 as Address;

            const increaseFlowRateAllowanceWithPermissionsTx: Transaction = {
                to: hostAddress,
                value: "0",
                data: null,
                contractMethod: callAgreement,
                contractInputsValues: {
                    agreementClass: cfaV1Address,
                    callData: callData,
                    userData: "0x",
                },
            };

            return {
                ...safeTxBuilderInput,
                transactions: [
                    increaseAllowanceTx,
                    increaseFlowRateAllowanceWithPermissionsTx,
                    ...safeTxBuilderInput.transactions,
                ],
            };
        };

export const insertChecksum = (
    txBuilderInput: SafeTxBuilderInput
): SafeTxBuilderInput => ({
    ...txBuilderInput,
    meta: {
        ...txBuilderInput.meta,
        checksum: calculateChecksum(txBuilderInput),
    },
});

export const insertTxs =
  (txBuilderInput: SafeTxBuilderInput) =>
  (transactions: Transaction[]): SafeTxBuilderInput => ({
    ...txBuilderInput,
    transactions,
  });