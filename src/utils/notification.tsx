import { MessageData } from "../hooks/useNotificationChannels";
import capitalize from "lodash/capitalize";
import format from "date-fns/format";

import WaringIcon from "@mui/icons-material/Error";
import { colors } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";

export const createLiquidationRiskMessage = ({
  symbol,
  network,
  liquidation,
}: MessageData) =>
  `Your ${symbol} on ${capitalize(network)} is about to be liquidated${
    liquidation
      ? " at " + format(Number(liquidation) * 1000, "yyyy/MM/dd HH:mm")
      : ""
  }.`;

export const createLiquidatedMessage = ({
  network,
  symbol,
  liquidation,
}: MessageData) =>
  `Your ${symbol} on ${capitalize(network)} was liquidated${
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

export const getNotificationIcon = ({ type }: MessageData) => {
  switch (type) {
    case "liquidation":
      return <ErrorIcon fontSize="small" sx={{ color: colors.red[500] }} />;
    case "liquidation-risk-2day":
      return <WaringIcon fontSize="small" sx={{ color: colors.amber[500] }} />;
    case "liquidation-risk-7day":
      return <WaringIcon fontSize="small" sx={{ color: colors.amber[500] }} />;
    default:
      return (
        <InfoIcon fontSize="small" sx={{ color: colors.lightBlue[500] }} />
      );
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
