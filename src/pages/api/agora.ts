import type { NextApiRequest, NextApiResponse } from 'next'
import * as yup from 'yup'
import { testAddress, testWeiAmount } from '../../utils/yupUtils'
import { Effect as E, Logger, LogLevel, pipe } from 'effect'
import { uniq } from 'lodash'
import { tryGetBuiltGraphSdkForNetwork } from '../../vesting-subgraph/vestingSubgraphApi'
import { optimism, optimismSepolia } from 'viem/chains'
import { Address, createPublicClient, encodePacked, getAddress, http, isAddress, keccak256 } from 'viem'
import { mapSubgraphVestingSchedule, VestingSchedule } from '../../features/vesting/types'
import { UnitOfTime } from '../../features/send/FlowRateInput'
import { vestingSchedulerV3Abi, vestingSchedulerV3Address } from '../../generated'
import { allNetworks, findNetworkOrThrow } from '../../features/network/networks'

// TODO: Pre-defining this because yup was not able to infer the types correctly for the transforms...
type AgoraResponseEntry = {
    projectId: string,
    projectName: string,
    KYCStautsCompleted: boolean,
    amounts: string[],
    wallets: Address[]
};
type AgoraResponse = Array<AgoraResponseEntry>;

export const agoraResponseEntrySchema = yup.object({
    projectId: yup.string().required('Project ID is required'),
    projectName: yup.string().required('Project name is required'),
    // Note about wallets: not able to get the output to be `Address` for some reason
    wallets: yup.array().of(
        yup.string().trim().required().test(testAddress()).transform(getAddress)
    )
        .min(1, 'At least one wallet is required')
        .required('Wallets are required'),
    // Note about KYC: the typo is also in the API
    KYCStautsCompleted: yup.boolean().required('KYC status is required'),
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
    endTimestamp: number
    tranchCount: number
    totalDurationInSeconds: number
}

const tranchCount = 6;
const tranchPlan: TranchPlan = {
    endTimestamp: 1767218400,
    tranchCount,
    totalDurationInSeconds: tranchCount * UnitOfTime.Month
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
    totalAmount: string
    totalDuration: number
}>

type UpdateVestingScheduleAction = Action<"update-vesting-schedule", {
    superToken: Address
    sender: Address
    receiver: Address
    totalAmount: string
}>

// Probably don't want to actually "stop" anything. Rather just have them run out.
type StopVestingScheduleAction = Action<"stop-vesting-schedule", {
    superToken: Address
    sender: Address
    receiver: Address
}>

type Actions = CreateVestingScheduleAction | UpdateVestingScheduleAction | StopVestingScheduleAction

type ProjectState = {
    agoraEntry: AgoraResponseEntry

    currentWallet: Address
    previousWallet: Address | null

    activeSchedule: VestingSchedule | null

    todo: Actions[]
}

const AGORA_API_ENDPOINT_URL = "https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/7/onchain-builders"

type ResponseData = {
    success: true
    projectStates: ProjectState[]
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

const OPxAddress = {
    [optimism.id]: "0x1828Bff08BD244F7990edDCd9B19cc654b33cDB4" as const,
    [optimismSepolia.id]: "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7" as const, // ETHx actually
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
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

    // Fetch the wanted state from the API
    // https://op-atlas-git-stepan-rewards-api-mock-voteagora.vercel.app/api/v1/rewards/7/onchain-builders


    const OPx = OPxAddress[chain.id];

    const main = E.gen(function* () {

        const dataFromAgora = yield* pipe(
            E.tryPromise({
                try: () => fetch(AGORA_API_ENDPOINT_URL).then(res => res.json()),
                catch: (error) => {
                    return new AgoraError("Failed to fetch data from Agora", { cause: error })
                }
            }),
            E.retry({
                times: 5
            }),
            E.tap(() => E.logTrace("Fetched data from Agora")),
            E.flatMap(response => E.tryPromise({
                try: () => agoraResponseSchema.validate(response),
                catch: (error) => {
                    return new AgoraError("Invalid data from Agora, i.e. didn't pass validation", { cause: error })
                }
            })),
            E.tap((x) => E.logTrace(`Validated ${x.length} rows from Agora`)),
            E.map(x => {
                // TODO: Was there something to do with KYC?
                // I think it was that when KYC is not done then I effectively ignore it...
                // I'll default to filtering out for now.
                return x.filter(_ => _.KYCStautsCompleted)
            }),
            E.tap(() => E.logTrace(`Filtered out non-KYC'ed rows`))
        );


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
            yield* E.fail(new AgoraError(
                `Found wallets assigned to multiple projects: ${JSON.stringify(duplicateWallets, null, 2)}`
            ));
        }
        // ---


        const subgraphSdk = tryGetBuiltGraphSdkForNetwork(network.id);
        if (!subgraphSdk) {
            throw new Error("Subgraph SDK not found! Should never happen.");
        }

        // TODO: I need tranch start time. Or not? If there is a tranch then that's the start time. I think I only need the end time.

        const allReceiverAddresses_bothActiveAndInactive = uniq(dataFromAgora.flatMap(x => x.wallets));

        yield* E.logTrace(`Fetching vesting schedules for ${allReceiverAddresses_bothActiveAndInactive.length} wallets`);
        const vestingSchedulesFromSubgraph = yield* pipe(
            E.tryPromise({
                try: () => subgraphSdk.getVestingSchedules({
                    where: {
                        superToken: OPx.toLowerCase(),
                        sender: sender.toLowerCase(),
                        receiver_in: allReceiverAddresses_bothActiveAndInactive, // TODO: Can this go over any limits?
                        // What statuses to check so it would be active? Note: Might be fine to just filter later.
                    }
                }),
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
                    .filter(x => !x.status.isFinished) // Probably need more filters
            )
        );
        // TODO: I know this has too many vesting schedules. I'll not perfect the filtering just yet.

        // Probably the most sensible thing to do now is to group together tranches with the relevant vesting schedule data...

        // TODO: Make sure the collection holds active schedules.
        const activeVestingSchedules = vestingSchedulesFromSubgraph;

        // Map into project states
        const projectStates = yield* E.forEach(dataFromAgora, (row) => {
            return E.gen(function* () {

                const agoraCurrentWallet: Address = row.wallets[row.wallets.length - 1] as Address;
                const agoraPreviousWallet: Address | null =
                    row.wallets.length > 1
                        ? row.wallets[row.wallets.length - 2] as Address
                        : null;

                if (agoraCurrentWallet === agoraPreviousWallet) {
                    return yield* E.die(new Error("Current and previous wallets are the same. Not prepared for this situation!"));
                }

                const currentWalletVestingSchedule = activeVestingSchedules.find(x => x.receiver.toLowerCase() === agoraCurrentWallet.toLowerCase()) ?? null;
                const previousWalletVestingSchedule = (agoraPreviousWallet && activeVestingSchedules.find(x => x.receiver.toLowerCase() === agoraPreviousWallet.toLowerCase())) ?? null;

                // TODO: Double-check if an amount is for the total time or for a single tranch.
                // Answer: It is for the current tranch.
                const agoraCurrentAmount_ = row.amounts[row.amounts.length - 1] ?? 0;
                const agoraCurrentAmount = BigInt(agoraCurrentAmount_);

                const actions = yield* E.gen(function* () {
                    const actions: Actions[] = [];

                    const hasProjectJustChangedWallet = !!previousWalletVestingSchedule;
                    if (hasProjectJustChangedWallet) {
                        actions.push({
                            type: "stop-vesting-schedule",
                            payload: {
                                superToken: OPx,
                                sender,
                                receiver: agoraPreviousWallet, // Make sure to use previous wallet here.
                            }
                        } as StopVestingScheduleAction)
                    }

                    const isAlreadyVestingToRightWallet = !!currentWalletVestingSchedule;
                    if (!isAlreadyVestingToRightWallet) {
                        // TODO: This is tricky, we'll have to look at previous vesting schedules as well, so not to double-account

                        actions.push({
                            type: "create-vesting-schedule",
                            payload: {
                                superToken: OPx,
                                sender,
                                receiver: agoraCurrentWallet,
                                totalAmount: agoraCurrentAmount.toString(),
                                totalDuration: tranchPlan.totalDurationInSeconds
                            }
                        } as CreateVestingScheduleAction)
                    } else {
                        // isAlreadyVestingToRightWallet === true

                        const isFundingJustStoppedForProject = agoraCurrentAmount === 0n;
                        if (isFundingJustStoppedForProject) {
                            actions.push({
                                type: "stop-vesting-schedule",
                                payload: {
                                    superToken: OPx,
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
                                    args: [getId(OPx, sender, agoraCurrentWallet)]
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
                        const isFundingJustChangedForProject = agoraCurrentAmount !== currentVestingScheduleAmount;

                        // Calculate expected amount
                        // 

                        // TODO: Consider scenarios where it's off by very small amounts, and whether it can happen bacause of minute calculation issues
                        // TODO: Log something meaningful here

                        if (isFundingJustChangedForProject) {
                            // TODO: Make sure 0 means stopping, not just not changing the flow rate
                            if (agoraCurrentAmount === 0n) {
                                actions.push({
                                    type: "stop-vesting-schedule",
                                    payload: {
                                        superToken: OPx,
                                        sender,
                                        receiver: agoraCurrentWallet,
                                    }
                                } as StopVestingScheduleAction)
                            } else {
                                actions.push({
                                    type: "update-vesting-schedule",
                                    payload: {
                                        superToken: OPx,
                                        sender,
                                        receiver: agoraCurrentWallet,
                                        totalAmount: agoraCurrentAmount.toString(),
                                    }
                                } as UpdateVestingScheduleAction)
                            }
                        }
                    }

                    return actions;
                });

                return {
                    agoraEntry: row,
                    currentWallet: agoraCurrentWallet,
                    previousWallet: agoraPreviousWallet,
                    activeSchedule: currentWalletVestingSchedule,
                    todo: actions
                } as ProjectState;
            });
        });

        yield* E.logTrace(`Processed ${projectStates.length} project states`);

        return projectStates;
    })

    // Note: It's probably easiest to iterate one by one?

    // Fetch the current/previous state from on-chain and/or subgraph.

    // Diff the API state

    // Note: You can handle the "simple" situation without previous state first.

    const result = await E.runPromise(
        pipe(
            main,
            Logger.withMinimumLogLevel(LogLevel.Trace) // TODO: make this work only in dev mode
        )
    );

    res.status(200).json({
        success: true,
        projectStates: result
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
