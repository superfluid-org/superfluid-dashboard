import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import Link from "next/link";
import { FC, useMemo } from "react";
import { useAccount } from "wagmi";
import { getSendPagePath } from "../../pages/send";
import { getPrettyEtherFlowRate } from "../../utils/tokenUtils";
import { Network } from "../network/networks";

interface ModifyStreamButtonProps {
  stream: Stream;
  network: Network;
  IconButtonProps?: Partial<IconButtonProps>;
  TooltipProps?: Partial<TooltipProps>;
}

const ModifyStreamButton: FC<ModifyStreamButtonProps> = ({
  stream,
  network,
  IconButtonProps = {},
  TooltipProps = {},
}) => {
  const { address: accountAddress, isConnected } = useAccount();

  const { sender, receiver } = stream;

  const modifyStreamUrl = useMemo(
    () =>
      getSendPagePath({
        token: stream.token,
        receiver: stream.receiver,
        flowRate: getPrettyEtherFlowRate(stream.currentFlowRate),
        network: network.slugName,
      }),
    [stream, network]
  );

  const isSenderOrReceiverLooking = useMemo(
    () =>
      accountAddress &&
      (sender.toLowerCase() === accountAddress.toLowerCase() ||
        receiver.toLowerCase() === accountAddress.toLowerCase()),
    [accountAddress, sender, receiver]
  );

  if (!isSenderOrReceiverLooking) return null;

  return (
    <Tooltip
      data-cy={"modify-stream-tooltip"}
      arrow
      disableInteractive
      placement="top"
      title={"Modify Stream"}
      {...TooltipProps}
    >
      <span>
        <Link href={modifyStreamUrl} passHref>
          <IconButton
            color="primary"
            disabled={!isConnected}
            {...IconButtonProps}
          >
            <EditRoundedIcon />
          </IconButton>
        </Link>
      </span>
    </Tooltip>
  );
};

export default ModifyStreamButton;
