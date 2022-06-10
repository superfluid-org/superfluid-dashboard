import { FC, memo } from "react";
import {
  Activities,
  MintedActivity,
  BurnedActivity,
  AgreementLiquidatedActivity,
} from "../../utils/activityUtils";
import BurnActivity from "./BurnActivity";
import DefaultActivityRow from "./DefaultActivityRow";
import FlowUpdatedActivityRow from "./FlowUpdatedActivityRow";
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

    case "Transfer":
      return <TransferActivityRow keyEvent={keyEvent} network={network} />;

    default:
      return <DefaultActivityRow keyEvent={keyEvent} network={network} />;
  }
};

export default memo(ActivityRow);
