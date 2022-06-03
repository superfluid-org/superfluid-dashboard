import { AllEvents } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import { Network } from "../network/networks";
import DefaultEventRow from "./DefaultEventRow";
import FlowUpdatedEventRow from "./FlowUpdatedEventRow";
import TokenDowngradedEventRow from "./TokenDowngradedEventRow";
import TokenUpgradedEventRow from "./TokenUpgradedEventRow";
import TransferEventRow from "./TransferEventRow";

interface EventHistoryRowProps {
  event: AllEvents;
  network: Network;
}

const EventHistoryRow: FC<EventHistoryRowProps> = ({ event, network }) => {
  console.log(event.name);
  switch (event.name) {
    case "FlowUpdated":
      return <FlowUpdatedEventRow event={event} network={network} />;
    case "TokenDowngraded":
      return <TokenDowngradedEventRow event={event} network={network} />;
    case "TokenUpgraded":
      return <TokenUpgradedEventRow event={event} network={network} />;
    case "Transfer":
      return <TransferEventRow event={event} network={network} />;
    default:
      return <DefaultEventRow event={event} network={network} />;
  }
};

export default EventHistoryRow;
