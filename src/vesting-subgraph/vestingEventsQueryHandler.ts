import { Event_Filter, Event_OrderBy } from "@superfluid-finance/sdk-core";
import {
    RelevantAddressesIntermediate,
    SubgraphListQuery,
    SubgraphQueryHandler,
} from "@superfluid-finance/sdk-core";

import {
    VestingScheduleEventsDocument,
    VestingScheduleEventsQuery,
    VestingScheduleEventsQueryVariables,
} from "./.graphclient";
import { AllVestingEvents } from "./vestingEvents";
import { mapAllVestingEvents } from "./mapAllVestingEvents";

export type VestingEventListQuery = SubgraphListQuery<Event_Filter, Event_OrderBy>;

export class VestingEventsQueryHandler extends SubgraphQueryHandler<
    AllVestingEvents,
    VestingEventListQuery,
    VestingScheduleEventsQuery,
    VestingScheduleEventsQueryVariables
> {
    getAddressFieldKeysFromFilter = (): {
        accountKeys: (keyof Event_Filter)[];
        tokenKeys: (keyof Event_Filter)[];
    } => ({
        accountKeys: ["addresses"], // Note that "addresses" can contain both accounts and tokens. Not sure what the best thing to do here is.
        tokenKeys: [],
    });

    getRelevantAddressesFromResultCore(): RelevantAddressesIntermediate {
        return {
            accounts: [],
            tokens: [],
        };
    }

    mapFromSubgraphResponse(response: VestingScheduleEventsQuery): AllVestingEvents[] {
        return mapAllVestingEvents(response.events);
    }

    requestDocument = VestingScheduleEventsDocument;
}
