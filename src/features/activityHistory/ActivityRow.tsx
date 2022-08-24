import { FC, memo } from "react";
import {
  Activities,
  AgreementLiquidatedActivity,
  BurnedActivity,
  IndexDistributionClaimedActivity,
  SubscriptionApprovedActivity,
  IndexUnitsUpdatedActivity,
  SubscriptionRevokedActivity,
  MintedActivity,
} from "../../utils/activityUtils";
import BurnActivity from "./BurnActivity";
import DefaultActivityRow from "./DefaultActivityRow";
import FlowUpdatedActivityRow from "./FlowUpdatedActivityRow";
import IndexCreatedActivityRow from "./IndexCreatedActivityRow";
import IndexDistributionClaimedRow from "./IndexDistributionClaimedRow";
import SubscriptionApprovedActivityRow from "././SubscriptionApprovedActivityRow";
import IndexUnitsUpdatedActivityRow from "./IndexUnitsUpdatedActivityRow";
import SubscriptionRevokedActivityRow from "./SubscriptionRevokedActivityRow";
import IndexUpdatedActivityRow from "./IndexUpdatedActivityRow";
import LiquidatedActivityRow from "./LiquidatedActivityRow";
import MintActivityRow from "./MintActivityRow";
import TransferActivityRow from "./TransferActivityRow";

interface ActivityRowProps {
  activity: Activities;
}

const ActivityRow: FC<ActivityRowProps> = ({ activity }) => {
  const { keyEvent, network } = activity;

  switch (keyEvent.name) {
    case "Minted": {
      const { transferEvent, tokenUpgradedEvent } = activity as MintedActivity;

      return (
        <MintActivityRow
          keyEvent={keyEvent}
          transferEvent={transferEvent}
          tokenUpgradedEvent={tokenUpgradedEvent}
          network={network}
        />
      );
    }

    case "Burned": {
      const { transferEvent, tokenDowngradedEvent } =
        activity as BurnedActivity;

      return (
        <BurnActivity
          keyEvent={keyEvent}
          transferEvent={transferEvent}
          tokenDowngradedEvent={tokenDowngradedEvent}
          network={network}
        />
      );
    }

    case "FlowUpdated":
      return <FlowUpdatedActivityRow keyEvent={keyEvent} network={network} />;

    case "AgreementLiquidatedBy":
    case "AgreementLiquidatedV2": {
      const { flowUpdatedEvent } = activity as AgreementLiquidatedActivity;

      return (
        <LiquidatedActivityRow
          keyEvent={keyEvent}
          flowUpdatedEvent={flowUpdatedEvent}
          network={network}
        />
      );
    }

    case "IndexCreated":
      return <IndexCreatedActivityRow keyEvent={keyEvent} network={network} />;

    case "IndexUpdated":
      return <IndexUpdatedActivityRow keyEvent={keyEvent} network={network} />;

    case "IndexSubscribed": {
      const { subscriptionApprovedEvent } =
        activity as SubscriptionApprovedActivity;

      return (
        <SubscriptionApprovedActivityRow
          keyEvent={keyEvent}
          subscriptionApprovedEvent={subscriptionApprovedEvent}
          network={network}
        />
      );
    }

    case "IndexUnsubscribed": {
      const { subscriptionRevokedEvent } =
        activity as SubscriptionRevokedActivity;

      return (
        <SubscriptionRevokedActivityRow
          keyEvent={keyEvent}
          subscriptionRevokedEvent={subscriptionRevokedEvent}
          network={network}
        />
      );
    }

    case "IndexDistributionClaimed": {
      const { subscriptionDistributionClaimed } =
        activity as IndexDistributionClaimedActivity;

      return (
        <IndexDistributionClaimedRow
          keyEvent={keyEvent}
          subscriptionDistributionClaimed={subscriptionDistributionClaimed}
          network={network}
        />
      );
    }

    case "IndexUnitsUpdated": {
      const { subscriptionUnitsUpdatedEvent } =
        activity as IndexUnitsUpdatedActivity;

      return (
        <IndexUnitsUpdatedActivityRow
          keyEvent={keyEvent}
          subscriptionUnitsUpdatedEvent={subscriptionUnitsUpdatedEvent}
          network={network}
        />
      );
    }

    case "Transfer":
      return <TransferActivityRow keyEvent={keyEvent} network={network} />;

    default:
      return <DefaultActivityRow keyEvent={keyEvent} network={network} />;
  }
};

export default memo(ActivityRow);
