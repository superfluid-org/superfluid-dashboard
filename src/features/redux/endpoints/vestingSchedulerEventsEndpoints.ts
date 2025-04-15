import { createPagedResult, PagedResult, SubgraphListQuery } from "@superfluid-finance/sdk-core";
import { createGeneralTags, getSubgraphClient, provideSpecificCacheTagsFromRelevantAddresses } from "@superfluid-finance/sdk-redux";
import { RelevantAddressProviderFromFilter, RelevantAddressProviderFromResult, SubgraphGetQueryHandler, SubgraphListQueryHandler } from "@superfluid-finance/sdk-core";
import { SubgraphGetQuery } from "@superfluid-finance/sdk-core";
import { SubgraphEndpointBuilder } from "@superfluid-finance/sdk-redux";
import { ILightEntity } from "@superfluid-finance/sdk-core";
import { VestingEventListQuery, VestingEventsQueryHandler } from "../../../vesting-subgraph/vestingEventsQueryHandler";
import { AllVestingEvents } from "../../../vesting-subgraph/vestingEvents";
import { tryGetBuiltGraphSdkForNetwork, tryGetSubgraphClientForNetwork } from "../../../vesting-subgraph/vestingSubgraphApi";

export interface VestingEventQuery extends SubgraphGetQuery {
    chainId: number;
}

export interface VestingEventsQuery extends VestingEventListQuery {
    chainId: number;
}

export const createVestingEventEndpoints = (builder: SubgraphEndpointBuilder) => {
    // NOTE: Ignoring prettier because longer lines are more readable here.
    // prettier-ignore
    return {
        vestingEvent: get<AllVestingEvents, VestingEventQuery>(builder, new VestingEventsQueryHandler()),
        vestingEvents: list<AllVestingEvents, VestingEventsQuery>(builder, new VestingEventsQueryHandler()),
    };
};

/**
 * Creates "get" endpoint.
 */
function get<TReturn extends ILightEntity, TQuery extends {chainId: number} & SubgraphGetQuery>(
    builder: SubgraphEndpointBuilder,
    queryHandler: SubgraphGetQueryHandler<TReturn> & RelevantAddressProviderFromResult<TReturn>,
    cacheTime?: CacheTime
) {
    return builder.query<TReturn | null, TQuery>({
        queryFn: async (arg) => {
            const subgraphClient = await tryGetSubgraphClientForNetwork(arg.chainId);
            if (!subgraphClient) {
                return {
                    data: null,
                };
            }

            return {
                data: await queryHandler.get(subgraphClient, arg),
            };
        },
        providesTags: (result, _error, arg) => [
            ...createGeneralTags({chainId: arg.chainId}),
            ...provideSpecificCacheTagsFromRelevantAddresses(
                arg.chainId,
                queryHandler.getRelevantAddressesFromResult(result)
            ),
        ],
        keepUnusedDataFor: cacheTime ?? CacheTime.OneMinute,
    });
}

/**
 * Creates "list" endpoint.
 */
function list<
    TReturn extends ILightEntity,
    TQuery extends {chainId: number} & SubgraphListQuery<TFilter, TOrderBy>,
    TFilter extends {[key: string]: unknown} = NonNullable<TQuery['filter']>,
    TOrderBy extends string = NonNullable<TQuery['order']>['orderBy'],
>(
    builder: SubgraphEndpointBuilder,
    queryHandler: SubgraphListQueryHandler<TReturn, TQuery, TFilter> & RelevantAddressProviderFromFilter<TFilter>,
    cacheTime?: CacheTime
) {
    return builder.query<PagedResult<TReturn>, TQuery>({
        queryFn: async (arg) => {
            const subgraphClient = await tryGetSubgraphClientForNetwork(arg.chainId);
            if (!subgraphClient) {
                return {
                    data: createPagedResult<TReturn>([], {
                        take: arg.pagination?.take ?? 1000,
                        skip: arg.pagination?.skip ?? 0
                    })
                };
            }

            return {
                data: await queryHandler.list(subgraphClient, arg),
            };
        },
        providesTags: (_result, _error, arg) => [
            ...createGeneralTags({chainId: arg.chainId}),
            ...provideSpecificCacheTagsFromRelevantAddresses(
                arg.chainId,
                queryHandler.getRelevantAddressesFromFilter(arg.filter)
            ),
        ],
        keepUnusedDataFor: cacheTime ?? CacheTime.OneMinute,
    });
}

export enum CacheTime {
    None = 0,
    OneMinute = 60,
    TwoMinutes = 120,
    ThreeMinutes = 180,
    FiveMinutes = 300,
    Forever = Number.MAX_VALUE,
}