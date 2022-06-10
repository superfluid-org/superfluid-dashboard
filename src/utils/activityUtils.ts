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

const validateRelatedEvents = (
  relatedEventNames: Array<string>,
  events: Array<AllEvents>
): [Array<AllEvents | undefined>, Array<AllEvents>] => {
  const notRelatedEvents = events.slice(relatedEventNames.length);

  return [
    relatedEventNames.map((eventName, index) => {
      return events[index]?.name === eventName ? events[index] : undefined;
    }),
    notRelatedEvents,
  ];
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
      const [[transferEvent, tokenUpgradedEvent], remainingEvents] =
        validateRelatedEvents(["Transfer", "TokenUpgraded"], transactionEvents);

      return mapTransactionActivityRecursive(
        remainingEvents,
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
      const [[transferEvent, tokenDowngradedEvent], remainingEvents] =
        validateRelatedEvents(
          ["Transfer", "TokenDowngraded"],
          transactionEvents
        );

      return mapTransactionActivityRecursive(
        remainingEvents,
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
      const [[flowUpdatedEvent], remainingEvents] = validateRelatedEvents(
        ["FlowUpdated"],
        transactionEvents
      );

      return mapTransactionActivityRecursive(
        remainingEvents,
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
