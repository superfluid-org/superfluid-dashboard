import { MessageData } from "../hooks/useNotificationChannels";
import capitalize from "lodash/capitalize";
import format from "date-fns/format";

export const createLiquidationRiskMessage = ({
  token,
  symbol,
  network,
  liquidation,
}: MessageData) =>
  `Your ${token}(${symbol}) on ${capitalize(
    network
  )} is about to be liquidated${
    liquidation
      ? " at " + format(Number(liquidation) * 1000, "yyyy/MM/dd HH:mm")
      : ""
  }.`;

export const createLiquidatedMessage = ({
  network,
  token,
  symbol,
  liquidation,
}: MessageData) =>
  `Your ${token}(${symbol}) on ${capitalize(network)} was liquidated${
    liquidation
      ? " at " + format(Number(liquidation) * 1000, "yyyy/MM/dd HH:mm")
      : ""
  }.`;

export const createMessage = ({
  raw,
  parsed,
}: {
  raw: string;
  parsed: MessageData;
}) => {
  switch (parsed.type) {
    case "liquidation":
      return createLiquidatedMessage(parsed);
    case "liquidation-risk-2day":
      return createLiquidationRiskMessage(parsed);
    case "liquidation-risk-7day":
      return createLiquidationRiskMessage(parsed);
    default:
      return raw;
  }
};

export const parseNotificationBody = (raw: string): MessageData =>
  raw.split(",").reduce((acc, curr) => {
    const [key, value] = curr.split(":");

    return {
      ...acc,
      [key]: value,
    };
  }, {} as MessageData);
