import type { NextApiRequest, NextApiResponse } from 'next'
import * as yup from 'yup'
import { testWeiAmount } from '../../utils/yupUtils'
import { Effect as E, Logger, LogLevel, pipe } from 'effect'
import { uniq } from 'lodash'
import { tryGetBuiltGraphSdkForNetwork } from '../../vesting-subgraph/vestingSubgraphApi'
import { optimism, optimismSepolia } from 'viem/chains'
import { Address, createPublicClient, http, isAddress, stringToHex } from 'viem'
import { mapSubgraphVestingSchedule, VestingSchedule } from '../../features/vesting/types'
import { UnitOfTime } from '../../features/send/FlowRateInput'
import { allNetworks, findNetworkOrThrow } from '../../features/network/networks'
import { getUnixTime } from 'date-fns'
import { cfaV1ForwarderAbi, cfaV1ForwarderAddress, superTokenAbi } from '../../generated'
import { ACL_CREATE_PERMISSION, ACL_DELETE_PERMISSION } from '../../utils/constants'
import { getAddress as getAddress_ } from "ethers/lib/utils"

const getAddress = (address: string) => getAddress_(address) as Address;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

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

// TODO: It would super helpful if:
// - in the response, it would be clear which amounts were for which wallets
// - when was the start date and when will be the end date for a tranch
// Until then, I'm better off handling only the first creation case.
// Until I get that, I might be better for setting up a dummy API endpoint myself...
// Hmm, could I figure out that data by looking at all the vesting schedles???

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
        yup.string().trim().required().test(testWeiAmount({
            notNegative: true,
            notZero: false,
        }))
    )
        .required('Amounts are required').min(1, 'At least one amount is required').max(6, 'Not more than 6 amounts are allowed')
}) as unknown as yup.Schema<AgoraResponseEntry>;

export const agoraResponseSchema = yup.array().of(agoraResponseEntrySchema).required('Response array is required') as unknown as yup.Schema<AgoraResponse>;

export type RoundType = "onchain_builders" | "dev_tooling"
export const roundTypes: Record<RoundType, RoundType> = {
    onchain_builders: "onchain_builders",
    dev_tooling: "dev_tooling",
} as const satisfies Record<RoundType, RoundType>;

// Map this data into a more readable state...
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

export type ProjectsOverview = {
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


export type AgoraResponseData = {
    success: true
    projectsOverview: ProjectsOverview
} | {
    success: false
    message: string
}

// TODO: Should the Effect errors inherit from Error class?
// Answer: Doesn't need to be but I went with it anyway.

class AgoraError extends Error {
    readonly _tag = 'AgoraError'
}

class SubgraphError extends Error {
    readonly _tag = 'SubgraphError'
}

class PublicClientRpcError extends Error {
    readonly _tag = 'PublicClientRpcError'
}

const tokenAddresses = {
    [optimism.id]: "0x1828Bff08BD244F7990edDCd9B19cc654b33cDB4" as const,
    [optimismSepolia.id]: "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7" as const, // ETHx actually
}

const agoraApiEndpoints = {
    // [optimismSepolia.id]: "https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/7/onchain-builders",
    [optimism.id]: {
        onchain_builders: `${APP_URL}/api/mock`,
        dev_tooling: "https://op-atlas-git-stepan-rewards-claiming-voteagora.vercel.app/api/v1/rewards/7/onchain-builders",
    },
    [optimismSepolia.id]: {
        onchain_builders: `${APP_URL}/api/mock`,
        // onchain_builders: "https://op-atlas-git-stepan-rewards-claiming-voteagora.vercel.app/api/v1/rewards/7/onchain-builders",
        dev_tooling: "https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/7/dev-tooling",
    },
} as const satisfies Record<number, Record<RoundType, string>>;

const validChainIds = Object.keys(agoraApiEndpoints).map(Number);

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

    // Optionally validate that the chainId is one we support
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

    const main = E.gen(function* () {

        const dataFromAgora = yield* pipe(
            E.tryPromise({
                try: () => fetch(agoraApiEndpoint + `?tranch=${tranch}`).then(res => res.json()),
                catch: (error) => {
                    return new AgoraError("Failed to fetch data from Agora", { cause: error })
                }
            }),
            E.retry({
                times: 5
            }),
            E.tap(() => E.logTrace("Fetched data from Agora")),
            E.map(x => {
                if (!Array.isArray(x)) {
                    return E.fail(new AgoraError("Invalid data from Agora: response is not an array"))
                }
                return x;
            }),
            E.flatMap(response => E.forEach(response, entry =>
                E.tryPromise(() => agoraResponseEntrySchema.validate(entry))
                    .pipe(
                        E.catchAll(error =>
                            E.logError(`Invalid data from Agora for project ${entry.projectId || 'unknown'}: validation failed`, { cause: error }).pipe(
                                E.flatMap(() => E.succeed(null))
                            )
                        )
                    )
            )),
            E.map(x => x.filter((x): x is AgoraResponseEntry => x !== null)),
            E.tap((x) => E.logTrace(`Validated ${x.length} rows from Agora`))
        );

        // TODO: I should change this logic to only do the tranch times calculation for first tranch. Otherwise, I'm better off looking at existing schedules.

        const currentTranchCount = dataFromAgora[0].amounts.length;
        const startOfTranchOne = getUnixTime(new Date()) + 4 * UnitOfTime.Minute;
        const tranchDuration = 1 * UnitOfTime.Month;

        // Calculate which tranch index is current (0-based)
        const currentTranchIndex = currentTranchCount - 1;

        const tranchCount = 6;
        const tranchPlan: TranchPlan = {
            tranchCount,
            currentTranchCount,
            totalDurationInSeconds: tranchCount * tranchDuration,
            tranches: Array(tranchCount).fill(null).map((_, index) => {
                // Calculate offset from current tranch
                const offset = (index - currentTranchIndex) * tranchDuration;

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
        const claimEndDate = tranchPlan.tranches[tranchPlan.tranches.length - 1].endTimestamp + 1 * UnitOfTime.Year;
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
            // Note: we use uniq here because I allow the scenario that for a single project there are duplicates.
            for (const wallet of uniq(row.wallets)) {
                if (walletToRowMap.has(wallet)) {
                    const existingProject = walletToRowMap.get(wallet);
                    const duplicateEntry = duplicateWallets.find(d => d.wallet === wallet);

                    if (duplicateEntry) {
                        duplicateEntry.projects.push(row.id);
                    } else {
                        duplicateWallets.push({
                            wallet,
                            projects: [existingProject!, row.id]
                        });
                    }
                } else {
                    walletToRowMap.set(wallet, row.id);
                }
            }
        }

        if (duplicateWallets.length > 0) {
            // TODO: Ignore this error for now has there are some in the test data...
            // yield* E.fail(new AgoraError(
            //     `Found wallets assigned to multiple projects: ${JSON.stringify(duplicateWallets, null, 2)}`
            // ));
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
                try: () => {
                    return subgraphSdk.getVestingSchedules({
                        where: {
                            // TODO: add cut-off dates here? Answer: Might not be necessary because these are brand new.
                            superToken: token.toLowerCase(),
                            sender: sender.toLowerCase(),
                            receiver_in: allReceiverAddresses_bothActiveAndInactive.map(x => x.toLowerCase()), // Note: Can this go over any limits? Answer: not too worried...
                            // What statuses to check so it would be active? Note: Might be fine to just filter later.
                        }
                    })
                },
                catch: (error) => {
                    return new SubgraphError("Failed to fetch vesting schedules from subgraph", { cause: error })
                }
            }),
            E.retry({
                times: 3
            }),
            E.tap(({ vestingSchedules }) => E.logTrace(`Fetched ${vestingSchedules.length} vesting schedules from subgraph`)),
            E.map(subgraphResponse =>
                subgraphResponse.vestingSchedules.map(vestingSchedule =>
                    mapSubgraphVestingSchedule(vestingSchedule)
                )
                    .filter(x => !x.status.isDeleted) // TODO: Consider this filter...
            )
        );
        // TODO: I know this has too many vesting schedules. I'll not perfect the filtering just yet.

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
                    // TODO: Handle this better
                    // return yield* E.die(new Error("Current and previous wallets are the same. Not prepared for this situation!"));
                }

                const allRelevantVestingSchedules = vestingSchedulesFromSubgraph.filter(x => walletsLowerCased.includes(x.receiver.toLowerCase()));

                const currentWalletVestingSchedule = allRelevantVestingSchedules.find(
                    x => !x.status.isFinished && x.receiver.toLowerCase() === agoraCurrentWallet.toLowerCase()
                ) ?? null;
                const previousWalletVestingSchedule = (agoraPreviousWallet && allRelevantVestingSchedules.find(x => x.receiver.toLowerCase() === agoraPreviousWallet.toLowerCase())) ?? null;

                const agoraCurrentAmount_ = row.amounts[row.amounts.length - 1] ?? 0;
                const agoraCurrentAmount = BigInt(agoraCurrentAmount_);
                const agoraTotalAmount = row.amounts.reduce((sum, amount) => sum + BigInt(amount || 0), 0n);
                const subgraphTotalAmount = allRelevantVestingSchedules.reduce((sum, vestingSchedule) => sum + BigInt(vestingSchedule.totalAmount ?? 0), 0n);
                const missingAmount = agoraTotalAmount - subgraphTotalAmount;

                const actions = yield* E.gen(function* () {
                    const actions: ProjectActions[] = [];

                    function pushAction(action: Omit<ProjectActions, "id">) {
                        actions.push({
                            ...action,
                            id: stringToHex(`${row.id}-${action.type}-${JSON.stringify(action.payload)}`).slice(2)
                        } as ProjectActions)
                    }

                    if (!row.KYCStatusCompleted) {
                        return [];
                    }

                    const sumOfPreviousTranches = row.amounts
                        .slice(0, -1)
                        .reduce((sum, amount) => sum + BigInt(amount || 0), 0n);
                    const didKycGetJustApproved = allRelevantVestingSchedules.length === 0;
                    const cliffAmount = 0n; // Note: Cliff will always be 0. We decided to disable this feature.
                    // didKycGetJustApproved ? sumOfPreviousTranches : 0n;
                    const totalAmount = agoraCurrentAmount + cliffAmount;
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
                        if (didKycGetJustApproved) {
                            pushAction({
                                type: "create-vesting-schedule",
                                payload: {
                                    superToken: token,
                                    sender,
                                    receiver: agoraCurrentWallet,
                                    startDate: currentTranch.startTimestamp,
                                    totalAmount: totalAmount.toString(),
                                    totalDuration: currentTranch.totalDuration,
                                    cliffAmount: cliffAmount.toString(),
                                    cliffPeriod: cliffAmount > 0n ? 1 : 0,
                                    claimPeriod: getClaimPeriod(currentTranch.startTimestamp)
                                }
                            })
                        } else {
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

                        // TODO: Consider scenarios where it's off by very small amounts, and whether it can happen bacause of minute calculation issues
                        // TODO: Log something meaningful here

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
                    id: stringToHex(`${action.type}-${JSON.stringify(action.payload)}`).slice(2)
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
            const permissionsDelta = ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION;
            const expectedPermissions = existingPermissions | permissionsDelta;
            const needsMorePermissions = existingPermissions !== expectedPermissions;
            const neededFlowRateAllowance = projectStates
                .flatMap(x => x.projectActions)
                .filter(x => x.type === "create-vesting-schedule")
                .reduce((sum, action) => {
                    const streamedAmount = BigInt(action.payload.totalAmount) - BigInt(action.payload.cliffAmount);
                    const flowRate = streamedAmount / BigInt(action.payload.totalDuration);
                    return sum + flowRate;
                }, 0n);

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

        return {
            chainId,
            senderAddress: sender,
            superTokenAddress: token,
            tranchPlan,
            projects: projectStates,
            allowanceActions
        }
    })

    // Look at create commands and sum up the expected flow rates for flow rate allowance
    // The token allowance should be the sum of all tranches

    const projectsOverview = await E.runPromise(
        pipe(
            main,
            Logger.withMinimumLogLevel(LogLevel.Trace) // TODO: make this work only in dev mode
        )
    );

    res.status(200).json({
        success: true,
        projectsOverview
    })
}
