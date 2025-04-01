import type { NextApiRequest, NextApiResponse } from 'next'
import * as yup from 'yup'
import { testWeiAmount } from '../../utils/yupUtils'
import { Effect as E, Logger, LogLevel, pipe } from 'effect'
import { uniq } from 'lodash'
import { tryGetBuiltGraphSdkForNetwork } from '../../vesting-subgraph/vestingSubgraphApi'
import { optimism, optimismSepolia } from 'viem/chains'
import { Address, createPublicClient, encodePacked, getAddress, http, isAddress, keccak256 } from 'viem'
import { mapSubgraphVestingSchedule, VestingSchedule } from '../../features/vesting/types'
import { UnitOfTime } from '../../features/send/FlowRateInput'
import { vestingSchedulerV3Abi, vestingSchedulerV3Address } from '../../generated'
import { allNetworks, findNetworkOrThrow } from '../../features/network/networks'
import { getUnixTime } from 'date-fns'

// TODO: Pre-defining this because yup was not able to infer the types correctly for the transforms...
type AgoraResponseEntry = {
    projectId: string,
    projectName: string,
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
    projectId: yup.string().required('Project ID is required'),
    projectName: yup.string().required('Project name is required'),
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

type ActionType = "create-vesting-schedule" | "update-vesting-schedule" | "stop-vesting-schedule"

type Action<TType extends ActionType, TPayload extends Record<string, unknown>> = {
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
    previousTotalAmount: string
}>

// Probably don't want to actually "stop" anything. Rather just have them run out.
type StopVestingScheduleAction = Action<"stop-vesting-schedule", {
    superToken: Address
    sender: Address
    receiver: Address
}>

export type Actions = CreateVestingScheduleAction | UpdateVestingScheduleAction | StopVestingScheduleAction

export type ProjectsOverview = {
    chainId: number
    superTokenAddress: string
    senderAddress: string
    tranchPlan: TranchPlan
    projects: ProjectState[]
}

export type ProjectState = {
    agoraEntry: AgoraResponseEntry

    currentWallet: Address
    previousWallet: Address | null

    activeSchedule: VestingSchedule | null
    previousSchedules: VestingSchedule[]
    allRelevantSchedules: VestingSchedule[]

    allocations: {
        tranch: number
        amount: string
    }[]

    todo: Actions[]
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
    [optimismSepolia.id]: "http://localhost:3000/api/mock",
}

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

    // TODO: validate method?
    const chain = optimismSepolia;
    const network = findNetworkOrThrow(allNetworks, chain.id);

    const sender_ = req.query.sender
    if (!sender_ || typeof sender_ !== 'string' || !isAddress(sender_)) {
        // res.status(400).json({ message: 'Sender address is required as query parameter' })
        // TODO: Handle this better
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

    const agoraApiEndpoint = agoraApiEndpoints[chainId as keyof typeof agoraApiEndpoints];
    if (!agoraApiEndpoint) {
        return res.status(400).json({
            success: false,
            message: 'Agora API endpoint not found.'
        })
    }

    const token = tokenAddresses[chain.id];

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
        const startOfTranchOne = getUnixTime(new Date()) + 5 * UnitOfTime.Minute;
        const tranchDuration = 604800 * UnitOfTime.Second;

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
                        duplicateEntry.projects.push(row.projectName);
                    } else {
                        duplicateWallets.push({
                            wallet,
                            projects: [existingProject!, row.projectName]
                        });
                    }
                } else {
                    walletToRowMap.set(wallet, row.projectName);
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

        // TODO: I need tranch start time. Or not? If there is a tranch then that's the start time. I think I only need the end time.

        // TODO: Should I filter out the non-KYC projects from here for optimization purposes?
        const allReceiverAddresses_bothActiveAndInactive = uniq(dataFromAgora.flatMap(x => x.wallets));

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
                    .filter(x => !x.status.isDeleted && !x.status.isError) // TODO: Consider this filter...
            )
        );
        // TODO: I know this has too many vesting schedules. I'll not perfect the filtering just yet.

        // Probably the most sensible thing to do now is to group together tranches with the relevant vesting schedule data...

        // Map into project states
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

                // TODO: Find all relevant vesting schedules
                // TODO: Probably want to update subgraph after all...

                const allRelevantVestingSchedules = vestingSchedulesFromSubgraph.filter(x => walletsLowerCased.includes(x.receiver.toLowerCase()));

                const currentWalletVestingSchedule = allRelevantVestingSchedules.find(
                    x => !x.status.isFinished && x.receiver.toLowerCase() === agoraCurrentWallet.toLowerCase()
                ) ?? null;
                const previousWalletVestingSchedule = (agoraPreviousWallet && allRelevantVestingSchedules.find(x => x.receiver.toLowerCase() === agoraPreviousWallet.toLowerCase())) ?? null;

                // TODO: Double-check if an amount is for the total time or for a single tranch.
                // Answer: It is for the current tranch.
                const agoraCurrentAmount_ = row.amounts[row.amounts.length - 1] ?? 0;
                const agoraCurrentAmount = BigInt(agoraCurrentAmount_);
                const agoraTotalAmount = row.amounts.reduce((sum, amount) => sum + BigInt(amount || 0), 0n);

                const actions = yield* E.gen(function* () {
                    const actions: Actions[] = [];

                    if (!row.KYCStatusCompleted) {
                        return [];
                    }

                    const sumOfPreviousTranches = row.amounts
                        .slice(0, -1)
                        .reduce((sum, amount) => sum + BigInt(amount || 0), 0n);
                    const didKycGetJustApproved = allRelevantVestingSchedules.length === 0;
                    const cliffAmount = didKycGetJustApproved ? sumOfPreviousTranches : 0n;
                    const totalAmount = agoraCurrentAmount + cliffAmount;
                    const currentTranch = tranchPlan.tranches[tranchPlan.currentTranchCount - 1];

                    const hasProjectJustChangedWallet = !!previousWalletVestingSchedule;
                    if (hasProjectJustChangedWallet) {
                        actions.push({
                            type: "stop-vesting-schedule",
                            payload: {
                                superToken: token,
                                sender,
                                receiver: agoraPreviousWallet, // Make sure to use previous wallet here.
                            }
                        } as StopVestingScheduleAction)
                    }

                    // ARGH: Something is off here. When updating a vesting schedule, I need to know how much was vested to this particular receiver!
                    // I might need to do in the subgraph. I can look at previous vesting schedules and see if they match!

                    const isAlreadyVestingToRightWallet = !!currentWalletVestingSchedule;
                    if (!isAlreadyVestingToRightWallet) {
                        // TODO: This is tricky, we'll have to look at previous vesting schedules as well, so not to double-account

                        actions.push({
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
                                claimPeriod: currentTranch.totalDuration * 2 // TODO: this is not finished solution
                            }
                        } as CreateVestingScheduleAction)
                    } else {
                        // isAlreadyVestingToRightWallet === true

                        const isFundingJustStoppedForProject = agoraCurrentAmount === 0n;
                        if (isFundingJustStoppedForProject) {
                            actions.push({
                                type: "stop-vesting-schedule",
                                payload: {
                                    superToken: token,
                                    sender,
                                    receiver: agoraCurrentWallet, // Make sure to use current wallet here.
                                }
                            } as StopVestingScheduleAction)
                        }

                        const publicClient = createPublicClient({
                            chain: optimism,
                            transport: http(network.rpcUrls.superfluid.http[0])
                        });

                        // TODO: Not sure I can do anything useful with the already vested amount...
                        const [alreadyVestedAmount_, lastUpdated_] = yield* pipe(
                            E.tryPromise({
                                try: () => publicClient.readContract({
                                    abi: vestingSchedulerV3Abi,
                                    address: vestingSchedulerV3Address[network.id as keyof typeof vestingSchedulerV3Address],
                                    functionName: "accountings",
                                    args: [getId(token, sender, agoraCurrentWallet)]
                                }),
                                catch: (error) => {
                                    return new PublicClientRpcError("Failed to read contract accounting data", { cause: error })
                                }
                            }),
                            E.retry({
                                times: 3
                            })
                        );

                        const accounting = {
                            lastUpdated: Number(lastUpdated_),
                            alreadyVestedAmount: alreadyVestedAmount_.toString()
                        }
                        const currentVestingScheduleAmount = getTotalVestedAmount(currentWalletVestingSchedule, accounting);

                        // TODO: this breaks with wallet changing...
                        const isFundingJustChangedForProject = agoraTotalAmount !== currentVestingScheduleAmount;

                        // TODO: Consider scenarios where it's off by very small amounts, and whether it can happen bacause of minute calculation issues
                        // TODO: Log something meaningful here

                        if (isFundingJustChangedForProject) {
                            // TODO: Make sure 0 means stopping, not just not changing the flow rate
                            if (agoraCurrentAmount === 0n) {
                                actions.push({
                                    type: "stop-vesting-schedule",
                                    payload: {
                                        superToken: token,
                                        sender,
                                        receiver: agoraCurrentWallet,
                                    }
                                } as StopVestingScheduleAction)
                            } else {
                                actions.push({
                                    type: "update-vesting-schedule",
                                    payload: {
                                        superToken: token,
                                        sender,
                                        receiver: agoraCurrentWallet,
                                        totalAmount: totalAmount.toString(), // TODO: This is wrong! Because of multiple wallets.
                                        previousTotalAmount: currentVestingScheduleAmount.toString()
                                    }
                                } as UpdateVestingScheduleAction)
                            }
                        }
                    }

                    return actions;
                });

                const projectState: ProjectState = {
                    agoraEntry: row,
                    currentWallet: agoraCurrentWallet,
                    previousWallet: agoraPreviousWallet,
                    activeSchedule: currentWalletVestingSchedule,
                    previousSchedules: [], // TODO: Implement this!
                    todo: actions,
                    allocations: row.amounts.map((amount, index) => ({
                        tranch: index + 1,
                        amount: amount
                    })),
                    allRelevantSchedules: allRelevantVestingSchedules
                };
                return projectState;
            });
        });

        yield* E.logTrace(`Processed ${projectStates.length} project states`);

        return {
            chainId,
            senderAddress: sender,
            superTokenAddress: token,
            tranchPlan,
            projects: projectStates
        }
    })

    // Note: It's probably easiest to iterate one by one?

    // Fetch the current/previous state from on-chain and/or subgraph.

    // Diff the API state

    // Note: You can handle the "simple" situation without previous state first.

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

// # Helpers
interface ScheduleAccounting {
    lastUpdated: number;
    alreadyVestedAmount: string;
}

function getTotalVestedAmount(
    schedule: VestingSchedule,
    accounting: ScheduleAccounting
): bigint {
    // TODO: I might need to handle myself the cliffAndFlowDate being before the current timestamp

    // If lastUpdated is 0, use the cliff date instead
    const actualLastUpdate = accounting.lastUpdated === 0
        ? schedule.cliffAndFlowDate
        : accounting.lastUpdated;

    // Calculate the duration of the current flow period
    const currentFlowDuration = schedule.endDate - actualLastUpdate;

    // Calculate the amount from the current flow
    const currentFlowAmount = BigInt(currentFlowDuration) * BigInt(schedule.flowRate);

    // Calculate the total vested amount by summing all components
    const totalVestedAmount =
        BigInt(accounting.alreadyVestedAmount) +
        BigInt(schedule.cliffAmount) +
        BigInt(schedule.remainderAmount) +
        currentFlowAmount;

    return totalVestedAmount;
}

function getId(superToken: Address, sender: Address, receiver: Address): `0x${string}` {
    return keccak256(
        encodePacked(
            ["address", "address", "address"],
            [superToken, sender, receiver]
        )
    );
}