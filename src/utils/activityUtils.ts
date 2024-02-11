import {
  AgreementLiquidatedByEvent,
  AgreementLiquidatedV2Event,
  AllEvents,
  BurnedEvent,
  FlowUpdatedEvent,
  IndexDistributionClaimedEvent,
  IndexSubscribedEvent,
  IndexUnitsUpdatedEvent,
  IndexUnsubscribedEvent,
  MintedEvent,
  SubscriptionApprovedEvent,
  SubscriptionDistributionClaimedEvent,
  SubscriptionRevokedEvent,
  SubscriptionUnitsUpdatedEvent,
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

export interface IndexUnitsUpdatedActivity
  extends Activity<IndexUnitsUpdatedEvent> {
  subscriptionUnitsUpdatedEvent?: SubscriptionUnitsUpdatedEvent;
}

export interface SubscriptionApprovedActivity
  extends Activity<IndexSubscribedEvent> {
  subscriptionApprovedEvent?: SubscriptionApprovedEvent;
}

export interface SubscriptionRevokedActivity
  extends Activity<IndexUnsubscribedEvent> {
  subscriptionRevokedEvent?: SubscriptionRevokedEvent;
}

export interface IndexDistributionClaimedActivity
  extends Activity<IndexDistributionClaimedEvent> {
  subscriptionDistributionClaimed?: SubscriptionDistributionClaimedEvent;
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
  Object.values(groupBy((x) => x.transactionHash, events)).reduce<
    Array<Activities>
  >(
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

    case "IndexUnitsUpdated": {
      const {
        eventsFound: [subscriptionApprovedEvent],
        eventsRemaining,
      } = findEventsByNameRecursive(
        ["SubscriptionUnitsUpdated"],
        transactionEvents
      );

      return mapTransactionActivityRecursive(
        eventsRemaining,
        network,
        activities.concat([
          {
            keyEvent,
            network,
            subscriptionApprovedEvent,
          } as IndexUnitsUpdatedActivity,
        ])
      );
    }

    case "IndexSubscribed": {
      const {
        eventsFound: [subscriptionApprovedEvent],
        eventsRemaining,
      } = findEventsByNameRecursive(
        ["SubscriptionApproved"],
        transactionEvents
      );

      return mapTransactionActivityRecursive(
        eventsRemaining,
        network,
        activities.concat([
          {
            keyEvent,
            network,
            subscriptionApprovedEvent,
          } as SubscriptionApprovedActivity,
        ])
      );
    }

    case "IndexUnsubscribed": {
      const {
        eventsFound: [subscriptionRevokedEvent],
        eventsRemaining,
      } = findEventsByNameRecursive(["SubscriptionRevoked"], transactionEvents);

      return mapTransactionActivityRecursive(
        eventsRemaining,
        network,
        activities.concat([
          {
            keyEvent,
            network,
            subscriptionRevokedEvent,
          } as SubscriptionRevokedActivity,
        ])
      );
    }

    case "IndexDistributionClaimed": {
      const {
        eventsFound: [subscriptionDistributionClaimed],
        eventsRemaining,
      } = findEventsByNameRecursive(
        ["SubscriptionDistributionClaimed"],
        transactionEvents
      );

      return mapTransactionActivityRecursive(
        eventsRemaining,
        network,
        activities.concat([
          {
            keyEvent,
            network,
            subscriptionDistributionClaimed,
          } as IndexDistributionClaimedActivity,
        ])
      );
    }

    case "IndexUpdated":
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

    case "Transfer": {
      const tokenAddressLowerCased = keyEvent.token.toLowerCase();
      const isNFTTransfer = // this is also mapped to subgraph but currently not mapped in the SDK
        tokenAddressLowerCased ===
          network.metadata.contractsV1.constantInflowNFT?.toLowerCase() ||
        tokenAddressLowerCased ===
          network.metadata.contractsV1.constantOutflowNFT?.toLowerCase();

      if (isNFTTransfer) {
        // skip NFT events
        return mapTransactionActivityRecursive(
          transactionEvents,
          network,
          activities
        );
      }

      // fall to next case
    }
    case "FlowUpdated":
    case "IndexCreated":
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

    /**
     * Removing Sent from activities and rendering only Transfer.
     */
    case "Sent":
      return mapTransactionActivityRecursive(
        transactionEvents,
        network,
        activities
      );

    // All unhandled events will be skipped as well
    default: {
      return mapTransactionActivityRecursive(
        transactionEvents,
        network,
        activities
      );
    }
  }
};
