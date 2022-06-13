import {
  AgreementLiquidatedByEvent,
  AgreementLiquidatedV2Event,
  AllEvents,
  BurnedEvent,
  FlowUpdatedEvent,
  MintedEvent,
  TokenDowngradedEvent,
  TokenUpgradedEvent,
  TransferEvent,
} from "@superfluid-finance/sdk-core";
import groupBy from "lodash/fp/groupBy";
import { Network } from "../features/network/networks";

export interface MintedActivity extends Activity<MintedEvent> {
  transferEvent?: TransferEvent;
  tokenUpgradedEvent?: TokenUpgradedEvent;
}

export interface BurnedActivity extends Activity<BurnedEvent> {
  transferEvent?: TransferEvent;
  tokenDowngradedEvent?: TokenDowngradedEvent;
}

export interface AgreementLiquidatedActivity
  extends Activity<AgreementLiquidatedByEvent | AgreementLiquidatedV2Event> {
  flowUpdatedEvent?: FlowUpdatedEvent;
}

export interface Activity<T = AllEvents> {
  keyEvent: T;
  network: Network;
}

export type Activities =
  | MintedActivity
  | BurnedActivity
  | AgreementLiquidatedActivity
  | Activity;

export const mapActivitiesFromEvents = (
  events: Array<AllEvents>,
  network: Network
) =>
  Object.values(groupBy("transactionHash", events)).reduce<Array<Activities>>(
    (mappedActivities, activities) =>
      mappedActivities.concat(
        mapTransactionActivityRecursive(activities.reverse(), network)
      ),
    []
  );

/**
 *
 * @param   relatedEventNames - Pattern of event names to find.
 * @param   events - Events to search from.
 * @returns eventsFound - Events until the related event names pattern matches the names in array that we are searching from.
 *          eventsRemaining - Events that were left over or did not match the pattern anymore. They are used to match the next pattern.
 */
const findEventsByNameRecursive = (
  relatedEventNames: Array<string>,
  patternStartEvents: Array<AllEvents>
): {
  eventsFound: Array<AllEvents | undefined>;
  eventsRemaining: Array<AllEvents>;
} => {
  const [eventNameToFind, ...otherEventNamesToFind] = relatedEventNames;
  const [eventToMatch, ...otherEvents] = patternStartEvents;

  if (eventNameToFind && eventToMatch?.name === eventNameToFind) {
    const { eventsFound, eventsRemaining } = findEventsByNameRecursive(
      otherEventNamesToFind,
      otherEvents
    );

    return { eventsFound: [eventToMatch, ...eventsFound], eventsRemaining };
  }

  return { eventsFound: [], eventsRemaining: patternStartEvents };
};

const mapTransactionActivityRecursive = (
  events: Array<AllEvents>,
  network: Network,
  activities: Array<Activity> = []
): Array<Activities> => {
  const [keyEvent, ...transactionEvents] = events;

  if (!keyEvent) return activities;

  switch (keyEvent.name) {
    case "Minted": {
      const {
        eventsFound: [transferEvent, tokenUpgradedEvent],
        eventsRemaining,
      } = findEventsByNameRecursive(
        ["Transfer", "TokenUpgraded"],
        transactionEvents
      );

      return mapTransactionActivityRecursive(
        eventsRemaining,
        network,
        activities.concat([
          {
            keyEvent,
            network,
            transferEvent,
            tokenUpgradedEvent,
          } as MintedActivity,
        ])
      );
    }

    case "Burned": {
      const {
        eventsFound: [transferEvent, tokenDowngradedEvent],
        eventsRemaining,
      } = findEventsByNameRecursive(
        ["Transfer", "TokenDowngraded"],
        transactionEvents
      );

      return mapTransactionActivityRecursive(
        eventsRemaining,
        network,
        activities.concat([
          {
            keyEvent,
            network,
            transferEvent,
            tokenDowngradedEvent,
          } as BurnedActivity,
        ])
      );
    }

    case "AgreementLiquidatedBy":
    case "AgreementLiquidatedV2": {
      const {
        eventsFound: [flowUpdatedEvent],
        eventsRemaining,
      } = findEventsByNameRecursive(["FlowUpdated"], transactionEvents);

      return mapTransactionActivityRecursive(
        eventsRemaining,
        network,
        activities.concat([
          {
            keyEvent,
            network,
            flowUpdatedEvent,
          } as AgreementLiquidatedActivity,
        ])
      );
    }

    /**
     * Removing Sent from activities and rendering only Transfer.
     */
    case "Sent":
      return mapTransactionActivityRecursive(
        transactionEvents,
        network,
        activities
      );

    default:
      return mapTransactionActivityRecursive(
        transactionEvents,
        network,
        activities.concat([
          {
            keyEvent,
            network,
          } as Activity,
        ])
      );
  }
};
