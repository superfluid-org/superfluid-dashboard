import type { NextApiRequest, NextApiResponse } from 'next'
import * as yup from 'yup'
import { testWeiAmount } from '../../utils/yupUtils'
import { Effect as E, Logger, LogLevel, pipe } from 'effect'
import { uniq } from 'lodash'
import { tryGetBuiltGraphSdkForNetwork } from '../../vesting-subgraph/vestingSubgraphApi'
import { optimism } from 'viem/chains'
import { Address, createPublicClient, http, isAddress, sha256, stringToHex } from 'viem'
import { mapSubgraphVestingSchedule, VestingSchedule } from '../../features/vesting/types'
import { UnitOfTime } from '../../features/send/FlowRateInput'
import { allNetworks, findNetworkOrThrow } from '../../features/network/networks'
import { add, getUnixTime } from 'date-fns'
import { cfaV1ForwarderAbi, cfaV1ForwarderAddress, superTokenAbi } from '../../generated'
import { ACL_CREATE_PERMISSION, ACL_DELETE_PERMISSION, ACL_UPDATE_PERMISSION } from '../../utils/constants'
import { getAddress as getAddress_ } from "ethers/lib/utils"
import { agoraApiEndpoints, RoundType, roundTypes, START_TIMESTAMP_OF_FIRST_TRANCH_ON_OPTIMISM, tokenAddresses, validChainIds } from '../../features/vesting/agora/constants'

// # Agora

// Note: Pre-defining this because yup was not able to infer the types correctly for the transforms...
type AgoraResponseEntry = {
    id: string,
    projectIds: string[],
    projectNames: string[],
    KYCStatusCompleted: boolean,
    amounts: string[],
    wallets: Address[]
};
type AgoraResponse = Array<AgoraResponseEntry>;

const getAddress = (address: string) => getAddress_(address) as Address;

export const agoraResponseEntrySchema = yup.object({
    id: yup.string().required('ID is required'),
    projectIds: yup.array().of(yup.string().required('Project ID is required')),
    projectNames: yup.array().of(yup.string().required('Project name is required')),
    // Note about wallets: not able to get the output to be `Address` for some reason
    wallets: yup.array().of(
        yup.string().required().transform(getAddress)
    )
        .min(1, 'At least one wallet is required')
        .required('Wallets are required'),
    // Note about KYC: the typo is also in the API
    KYCStatusCompleted: yup.boolean().required('KYC status is required'),
    amounts: yup.array().of(
        yup.string().trim().required().transform(x => {
            if (x === null) {
                return '0';
            }
            return x;
        }).test(testWeiAmount({
            notNegative: true,
            notZero: false,
        }))
    )
        .required('Amounts are required').min(1, 'At least one amount is required').max(6, 'Not more than 6 amounts are allowed')
}) as unknown as yup.Schema<AgoraResponseEntry>;

export const agoraResponseSchema = yup.array().of(agoraResponseEntrySchema).required('Response array is required') as unknown as yup.Schema<AgoraResponse>;
// ---

// # Core types
type TranchPlan = {
    tranchCount: 6
    currentTranchCount: number
    totalDurationInSeconds: number
    tranches: {
        startTimestamp: number
        endTimestamp: number
        totalDuration: number
    }[]
}

export type ProjectsOverview = {
    key: string
    chainId: number
    superTokenAddress: string
    senderAddress: string
    tranchPlan: TranchPlan
    projects: ProjectState[]
    allowanceActions: AllowanceActions[]
}

export type ProjectState = {
    agoraEntry: AgoraResponseEntry

    agoraTotalAmount: string
    subgraphTotalAmount: string

    currentWallet: Address
    previousWallet: Address | null

    activeSchedule: VestingSchedule | null
    allRelevantSchedules: VestingSchedule[]

    allocations: {
        tranch: number
        amount: string
    }[]

    projectActions: ProjectActions[]
}
// ---

// # Actions
type ActionType = "create-vesting-schedule" | "update-vesting-schedule" | "stop-vesting-schedule" | "increase-token-allowance" | "increase-flow-operator-permissions"

type Action<TType extends ActionType, TPayload extends Record<string, unknown>> = {
    id: string
    type: TType
    payload: TPayload
}

type CreateVestingScheduleAction = Action<"create-vesting-schedule", {
    superToken: Address
    sender: Address
    receiver: Address
    startDate: number
    totalAmount: string
    totalDuration: number
    cliffAmount: string;
    cliffPeriod: number;
    claimPeriod: number;
}>

type UpdateVestingScheduleAction = Action<"update-vesting-schedule", {
    superToken: Address
    sender: Address
    receiver: Address
    totalAmount: string
    endDate: number
    previousTotalAmount: string
    previousFlowRate: string
    previousStartDate: number
}>

// Probably don't want to actually "stop" anything. Rather just have them run out.
type StopVestingScheduleAction = Action<"stop-vesting-schedule", {
    superToken: Address
    sender: Address
    receiver: Address
}>

type TokenAllowanceAction = Action<"increase-token-allowance", {
    superToken: Address
    sender: Address
    receiver: Address
    allowanceDelta: string
}>

type SetFlowOperatorPermissionsAction = Action<"increase-flow-operator-permissions", {
    superToken: Address
    sender: Address
    receiver: Address
    permissionsDelta: number
    flowRateAllowanceDelta: string
}>

export type AllowanceActions = TokenAllowanceAction | SetFlowOperatorPermissionsAction
export type ProjectActions = CreateVestingScheduleAction | UpdateVestingScheduleAction | StopVestingScheduleAction
export type Actions = AllowanceActions | ProjectActions
// ---

// # Errors
class AgoraError extends Error {
    readonly _tag = 'AgoraError'
}

class SubgraphError extends Error {
    readonly _tag = 'SubgraphError'
}

class PublicClientRpcError extends Error {
    readonly _tag = 'PublicClientRpcError'
}
// ---

// # API
export type AgoraResponseData = {
    success: true
    projectsOverview: ProjectsOverview
} | {
    success: false
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AgoraResponseData>
) {
    // Get the tranch parameter from the query
    const tranchParam = req.query.tranch;

    // Check if tranch parameter exists and validate it
    let tranch: number | undefined;
    if (tranchParam) {
        if (typeof tranchParam !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Tranch parameter must be a string'
            });
        }

        tranch = parseInt(tranchParam, 10);
        if (isNaN(tranch)) {
            return res.status(400).json({
                success: false,
                message: 'Tranch parameter must be a valid number'
            });
        }
    }

    const type_ = req.query.type
    if (!type_ || typeof type_ !== 'string' || !roundTypes[type_ as RoundType]) {
        return res.status(400).json({
            success: false,
            message: 'Round type is required as query parameter'
        })
    }
    const type = type_ as RoundType;

    const sender_ = req.query.sender
    if (!sender_ || typeof sender_ !== 'string' || !isAddress(sender_)) {
        return res.status(400).json({
            success: false,
            message: 'Sender address is required as query parameter'
        })
    }
    const sender = getAddress(sender_);

    const chainId_ = req.query.chainId
    if (!chainId_ || typeof chainId_ !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Chain ID is required as query parameter'
        })
    }

    const chainId = parseInt(chainId_, 10)
    if (isNaN(chainId)) {
        return res.status(400).json({
            success: false,
            message: 'Chain ID must be a valid number'
        })
    }

    if (!validChainIds.includes(chainId)) {
        return res.status(400).json({
            success: false,
            message: 'Unsupported chain ID. Only Optimism and Optimism Sepolia are supported.'
        })
    }

    const agoraApiEndpoint = agoraApiEndpoints[chainId as keyof typeof agoraApiEndpoints][type];
    if (!agoraApiEndpoint) {
        return res.status(400).json({
            success: false,
            message: 'Agora API endpoint not found.'
        })
    }

    const network = findNetworkOrThrow(allNetworks, chainId);
    const vestingContractInfo = network.vestingContractAddress["v3"]
    if (!vestingContractInfo) {
        return res.status(400).json({
            success: false,
            message: 'Network does not support vesting scheduler V3.'
        })
    }

    const token = tokenAddresses[network.id as keyof typeof tokenAddresses];
    const isProd = chainId === optimism.id;

    const mainEffect = E.gen(function* () {

        const dataFromAgora = yield* pipe(
            E.tryPromise({
                try: async () => {
                    if (isProd) {
                        const res = await fetch(agoraApiEndpoint, {
                            headers: {
                                'Authorization': `Bearer ${process.env.AGORA_API_KEY}`
                            }
                        })
                        return await res.json() as AgoraResponse
                    } else {
                        const res = await fetch(agoraApiEndpoint + `?tranch=${tranch}`)
                        return await res.json() as AgoraResponse
                    }
                },
                catch: (error) => {
                    return new AgoraError("Failed to fetch data from Agora", { cause: error })
                }
            }),
            E.retry({
                times: 5
            }),
            E.map(x => {
                if (!Array.isArray(x)) {
                    throw new AgoraError("Invalid data from Agora: response is not an array")
                }
                return x;
            }),
            E.tap((x) => E.logTrace(`Fetched ${x.length} rows from Agora.`)),
            E.flatMap(response => E.forEach(response, entry =>
                E.tryPromise(() => agoraResponseEntrySchema.validate(entry))
                    .pipe(
                        E.catchAll(error =>
                            E.logError(`Invalid data from Agora for project ${entry.projectIds.join(', ') || 'unknown'}: validation failed`, { cause: error }).pipe(
                                E.flatMap(() => E.succeed(null))
                            )
                        )
                    )
            )),
            E.map(x => x.filter((x): x is AgoraResponseEntry => x !== null)),
            E.tap((x) => E.logTrace(`Validated ${x.length} rows from Agora`))
        );

        const startOfTranchOne = function() {
            if (isProd) {
                return START_TIMESTAMP_OF_FIRST_TRANCH_ON_OPTIMISM;
            } else {
                return getUnixTime(new Date()) + 4 * UnitOfTime.Minute;
            }
        }()

        const currentTranchCount = dataFromAgora[0].amounts.length;
        const tranchDuration = 1 * UnitOfTime.Month;

        const tranchCount = 6;
        const tranchPlan: TranchPlan = {
            tranchCount,
            currentTranchCount,
            totalDurationInSeconds: tranchCount * tranchDuration,
            tranches: Array(tranchCount).fill(null).map((_, index) => {
                // Reminder: index is 0-based

                // Calculate offset from current tranch
                const offset = index * tranchDuration;

                // Start time is now plus offset (negative for past tranches, positive for future)
                const startTimestamp = startOfTranchOne + offset;

                // End time is start time plus duration
                const endTimestamp = startTimestamp + tranchDuration;

                return {
                    startTimestamp,
                    endTimestamp,
                    totalDuration: endTimestamp - startTimestamp
                };
            })
        }

        const claimEndDate = tranchPlan.tranches[tranchPlan.tranches.length - 1].endTimestamp + UnitOfTime.Year;
        function getClaimPeriod(startTimestamp: number) {
            if (startTimestamp > claimEndDate) {
                throw new Error("Start timestamp is after claim end date. This shouldn't happen. Please investigate!");
            }

            return claimEndDate - startTimestamp;
        }

        // # Validate no wallet appears in multiple rows
        // Just in case... You can probably skip reading this part.
        const walletToRowMap = new Map<string, string>();
        const duplicateWallets: Array<{ wallet: string, projects: string[] }> = [];

        yield* E.logTrace("Validating no wallet appears in multiple rows");
        for (const row of dataFromAgora) {
            // Note: we use uniq here because we allow the scenario that for a single project there are duplicates.
            for (const wallet of uniq(row.wallets)) {
                if (walletToRowMap.has(wallet)) {
                    const existingProject = walletToRowMap.get(wallet)!;
                    const duplicateEntry = duplicateWallets.find(d => d.wallet === wallet);

                    if (duplicateEntry) {
                        duplicateEntry.projects.push(row.id);
                    } else {
                        duplicateWallets.push({
                            wallet,
                            projects: [existingProject, row.id]
                        });
                    }
                } else {
                    walletToRowMap.set(wallet, row.id);
                }
            }
        }

        if (duplicateWallets.length > 0) {
            yield* E.fail(new AgoraError(
                `Found wallets assigned to multiple projects: ${JSON.stringify(duplicateWallets, null, 2)}`
            ));
        }
        // ---

        const subgraphSdk = tryGetBuiltGraphSdkForNetwork(network.id);
        if (!subgraphSdk) {
            throw new Error("Subgraph SDK not found! Should never happen.");
        }

        const allReceiverAddresses_bothActiveAndInactive = uniq(
            dataFromAgora
                .filter(x => x.KYCStatusCompleted)
                .flatMap(x => x.wallets)
        );

        yield* E.logTrace(`Fetching vesting schedules for ${allReceiverAddresses_bothActiveAndInactive.length} wallets`);
        const vestingSchedulesFromSubgraph = yield* pipe(
            E.tryPromise({
                try: async () => {
                    const { vestingSchedules } = await subgraphSdk.getVestingSchedules({
                        where: {
                            superToken: token.toLowerCase(),
                            sender: sender.toLowerCase(),
                            receiver_in: allReceiverAddresses_bothActiveAndInactive.map(x => x.toLowerCase()), // Note: Can this go over any limits? Answer: not too worried...
                            // What statuses to check so it would be active? Note: Might be fine to just filter later.
                        }
                    })
                    return vestingSchedules;
                },
                catch: (error) => {
                    return new SubgraphError("Failed to fetch vesting schedules from subgraph", { cause: error })
                }
            }),
            E.retry({
                times: 3
            }),
            E.tap(vestingSchedules => E.logTrace(`Fetched ${vestingSchedules.length} vesting schedules from subgraph`)),
            E.map(vestingSchedules => {
                if (vestingSchedules.length >= 1000) {
                    throw new SubgraphError("Received more than 1000 vesting schedules from subgraph. This shouldn't happen. Please investigate!");
                }
                return vestingSchedules;
            }),
            E.map(vestingSchedules =>
                vestingSchedules.map(vestingSchedule =>
                    mapSubgraphVestingSchedule(vestingSchedule)
                ).filter(x => !x.status.isDeleted)
            )
        );

        // # Map into project states
        const projectStates = yield* E.forEach(dataFromAgora, (row) => {
            return E.gen(function* () {

                const walletsLowerCased = row.wallets.map(x => x.toLowerCase());
                const agoraCurrentWallet: Address = row.wallets[row.wallets.length - 1] as Address;
                let agoraPreviousWallet: Address | null =
                    row.wallets.length > 1
                        ? row.wallets[row.wallets.length - 2] as Address
                        : null;

                if (agoraCurrentWallet === agoraPreviousWallet) {
                    agoraPreviousWallet = null;
                }

                const allRelevantVestingSchedules = vestingSchedulesFromSubgraph.filter(x => walletsLowerCased.includes(x.receiver.toLowerCase()));

                const currentWalletVestingSchedule = allRelevantVestingSchedules.find(
                    x => !x.status.isFinished && x.receiver.toLowerCase() === agoraCurrentWallet.toLowerCase()
                ) ?? null;
                const previousWalletVestingSchedule = (agoraPreviousWallet && allRelevantVestingSchedules.find(x => x.receiver.toLowerCase() === agoraPreviousWallet.toLowerCase())) ?? null;

                const agoraCurrentAmount_ = row.amounts[row.amounts.length - 1] ?? 0;
                const agoraCurrentAmount = BigInt(agoraCurrentAmount_);
                const agoraTotalAmount = row.amounts.reduce((sum, amount) => sum + BigInt(amount || 0), 0n);
                const subgraphTotalAmount = allRelevantVestingSchedules.reduce((sum, vestingSchedule) => sum + BigInt(vestingSchedule.totalAmountWithOverpayment ?? 0), 0n);
                const missingAmount = agoraTotalAmount - subgraphTotalAmount;

                const actions = yield* E.gen(function* () {
                    const actions: ProjectActions[] = [];
                    if (agoraTotalAmount === 0n) {
                        return actions;
                    }

                    if (!row.KYCStatusCompleted) {
                        return actions;
                    }

                    function pushAction(action: Omit<ProjectActions, "id">) {
                        actions.push({
                            ...action,
                            id: sha256(stringToHex(`${row.id}-${action.type}-${JSON.stringify(action.payload)}`))
                        } as ProjectActions)
                    }

                    // const _sumOfPreviousTranches = row.amounts
                    //     .slice(0, -1)
                    //     .reduce((sum, amount) => sum + BigInt(amount || 0), 0n);
                    // const didKycGetJustApproved = allRelevantVestingSchedules.length === 0;
                    //const cliffAmount = 0n; // Note: Cliff will always be 0. We decided to disable this feature.
                    // The old cliff logic: didKycGetJustApproved ? sumOfPreviousTranches : 0n;
                    // const totalAmount = agoraCurrentAmount + cliffAmount;
                    const currentTranch = tranchPlan.tranches[tranchPlan.currentTranchCount - 1];

                    const hasProjectJustChangedWallet = !!previousWalletVestingSchedule;
                    if (hasProjectJustChangedWallet) {
                        pushAction({
                            type: "stop-vesting-schedule",
                            payload: {
                                superToken: token,
                                sender,
                                receiver: agoraPreviousWallet!, // Make sure to use previous wallet here!
                            }
                        })
                    }

                    const isAlreadyVestingToRightWallet = !!currentWalletVestingSchedule;
                    if (!isAlreadyVestingToRightWallet) {
                        if (missingAmount > 0n) {
                            pushAction({
                                type: "create-vesting-schedule",
                                payload: {
                                    superToken: token,
                                    sender,
                                    receiver: agoraCurrentWallet,
                                    startDate: currentTranch.startTimestamp,
                                    totalAmount: missingAmount.toString(),
                                    totalDuration: currentTranch.totalDuration,
                                    cliffAmount: "0",
                                    cliffPeriod: 0,
                                    claimPeriod: getClaimPeriod(currentTranch.startTimestamp)
                                }
                            })
                        }
                    } else {
                        // isAlreadyVestingToRightWallet === true

                        const isFundingJustStoppedForProject = agoraCurrentAmount === 0n;
                        if (isFundingJustStoppedForProject) {
                            pushAction({
                                type: "stop-vesting-schedule",
                                payload: {
                                    superToken: token,
                                    sender,
                                    receiver: agoraCurrentWallet, // Make sure to use current wallet here.
                                }
                            })
                        }

                        const isFundingJustChangedForProject = agoraTotalAmount > subgraphTotalAmount;

                        if (isFundingJustChangedForProject) {
                            if (agoraCurrentAmount === 0n) {
                                pushAction({
                                    type: "stop-vesting-schedule",
                                    payload: {
                                        superToken: token,
                                        sender,
                                        receiver: agoraCurrentWallet,
                                    }
                                })
                            } else {
                                const newTotalAmount = BigInt(currentWalletVestingSchedule.totalAmount) + missingAmount;

                                pushAction({
                                    type: "update-vesting-schedule",
                                    payload: {
                                        superToken: token,
                                        sender,
                                        receiver: agoraCurrentWallet,
                                        totalAmount: newTotalAmount.toString(),
                                        previousTotalAmount: currentWalletVestingSchedule.totalAmount,
                                        previousFlowRate: currentWalletVestingSchedule.flowRate,
                                        previousStartDate: currentWalletVestingSchedule.startDate,
                                        endDate: currentTranch.endTimestamp
                                    }
                                })
                            }
                        }
                    }

                    return actions
                        .filter(x => x.type !== "stop-vesting-schedule") // Filter out stop vesting schedules for now as we don't need to do anything.
                });

                const projectState: ProjectState = {
                    agoraEntry: row,
                    currentWallet: agoraCurrentWallet,
                    previousWallet: agoraPreviousWallet,
                    activeSchedule: currentWalletVestingSchedule,
                    projectActions: actions,
                    allocations: row.amounts.map((amount, index) => ({
                        tranch: index + 1,
                        amount: amount
                    })),
                    allRelevantSchedules: allRelevantVestingSchedules,
                    agoraTotalAmount: agoraTotalAmount.toString(),
                    subgraphTotalAmount: subgraphTotalAmount.toString()
                };
                return projectState;
            });
        });

        yield* E.logTrace(`Processed ${projectStates.length} project states`);

        const publicClient = createPublicClient({
            chain: network,
            transport: http(network.rpcUrls.superfluid.http[0])
        });

        const allowanceActions = yield* E.gen(function* () {
            const actions: AllowanceActions[] = [];

            const pushAction = (action: Omit<AllowanceActions, 'id'>) => {
                actions.push({
                    ...action,
                    id: sha256(stringToHex(`${action.type}-${JSON.stringify(action.payload)}`))
                } as AllowanceActions)
            }

            const flowOperatorData = yield* E.tryPromise({
                try: () => publicClient.readContract({
                    address: cfaV1ForwarderAddress[network.id as keyof typeof cfaV1ForwarderAddress],
                    abi: cfaV1ForwarderAbi,
                    functionName: "getFlowOperatorPermissions",
                    args: [token, sender, vestingContractInfo.address]
                }),
                catch: (error) => new PublicClientRpcError("Failed to read flow operator permissions", { cause: error })
            });
            const existingPermissions = Number(flowOperatorData[0]);
            const permissionsDelta = ACL_CREATE_PERMISSION | ACL_UPDATE_PERMISSION | ACL_DELETE_PERMISSION;
            const expectedPermissions = existingPermissions | permissionsDelta;
            const needsMorePermissions = existingPermissions !== expectedPermissions;

            const neededFlowRateAllowanceForCreations = projectStates
                .flatMap(x => x.projectActions)
                .filter(x => x.type === "create-vesting-schedule")
                .reduce((sum, action) => {
                    const streamedAmount = BigInt(action.payload.totalAmount) - BigInt(action.payload.cliffAmount);
                    const flowRate = streamedAmount / BigInt(action.payload.totalDuration);
                    return sum + flowRate;
                }, 0n);
            
            const neededFlowRateAllowanceForUpdates = projectStates
                .flatMap(x => x.projectActions)
                .filter(x => x.type === "update-vesting-schedule")
                .reduce((sum, action) => {
                    const newTotalAmount = BigInt(action.payload.totalAmount);
                    const previousTotalAmount = BigInt(action.payload.previousTotalAmount);
                    if (newTotalAmount < previousTotalAmount) {
                        console.warn("Previous total amount is more than new total amount. This shouldn't happen. Please investigate!");
                        return sum;
                    }

                    const amountDelta = newTotalAmount - previousTotalAmount;

                    const nowishUnix = getUnixTime(add(new Date(), { hours: 48 })); 
                    // Calculate the flow rate allowance with 48 hours of TX execution delay in mind.
                    // Pushing the time forwards leaves less time for "total amount" to flow in the remaining duration,
                    // hence the needed flow rate allowance will be higher.
                    const streamTimeDelta = action.payload.endDate - nowishUnix;
                    if (streamTimeDelta <= 0) {
                        console.warn("There's less than 2 days till end of schedule. Are you sure you want to increase the amount?");
                        return sum + amountDelta;
                    }

                    const addedFlowRate = amountDelta / BigInt(streamTimeDelta);
                    return sum + addedFlowRate;
                }, 0n);

            const neededFlowRateAllowance = neededFlowRateAllowanceForCreations + neededFlowRateAllowanceForUpdates;

            if (needsMorePermissions || neededFlowRateAllowance > 0n) {
                pushAction({
                    type: "increase-flow-operator-permissions",
                    payload: {
                        superToken: token,
                        sender,
                        receiver: vestingContractInfo.address,
                        permissionsDelta,
                        flowRateAllowanceDelta: neededFlowRateAllowance.toString()
                    }
                })
            }

            const tokenAllowance = yield* E.tryPromise({
                try: () => publicClient.readContract({
                    address: token,
                    abi: superTokenAbi,
                    functionName: "allowance",
                    args: [sender, vestingContractInfo.address]
                }),
                catch: (error) => new PublicClientRpcError("Failed to read token allowance", { cause: error })
            });

            const agoraTotalAmountOfAllProjects = dataFromAgora
                .filter(x => x.KYCStatusCompleted)
                .reduce((sum, row) => sum + BigInt(row.amounts.reduce((sum, amount) => sum + BigInt(amount || 0), 0n)), 0n);
            const missingAllowance = agoraTotalAmountOfAllProjects - tokenAllowance;
            if (missingAllowance > 0n) {
                pushAction({
                    type: "increase-token-allowance",
                    payload: {
                        superToken: token,
                        sender,
                        receiver: vestingContractInfo.address,
                        allowanceDelta: missingAllowance.toString()
                    }
                })
            }

            return actions;
        })

        const key = sha256(stringToHex([
            chainId.toString(),
            sender,
            token,
            ...projectStates.flatMap(x => x.projectActions.map(x => x.id)),
            ...allowanceActions.map(x => x.id)
        ].sort().join("")))

        return {
            key,
            chainId,
            senderAddress: sender,
            superTokenAddress: token,
            tranchPlan,
            projects: projectStates,
            allowanceActions
        }
    })

    const effectResult = await E.runPromise(
        pipe(
            mainEffect,
            E.tapError((error) => E.logError("Error in the main pipeline", { cause: error })), // Directly log the error object
            E.match({
                onSuccess: (projectsOverview): AgoraResponseData => ({
                    success: true,
                    projectsOverview
                }),
                onFailure: (error): AgoraResponseData => { // error type is still inferred
                    // Determine the user-facing error message based on the error type
                    const userMessage = error instanceof AgoraError ? "Agora API error occurred." :
                                        error instanceof SubgraphError ? "Subgraph data retrieval error occurred." :
                                        error instanceof PublicClientRpcError ? "RPC interaction error occurred." :
                                        "An unexpected error occurred.";

                    return {
                        success: false,
                        message: userMessage
                    };
                }
            }),
            // Apply overall logging level configuration
            Logger.withMinimumLogLevel(process.env.NODE_ENV === 'development' ? LogLevel.Trace : LogLevel.Info)
        )
    );

    res.status(effectResult.success ? 200 : 500).json(effectResult);
}
