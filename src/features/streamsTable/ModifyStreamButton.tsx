import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { FC, useMemo } from "react";
import { useAccount } from "@/hooks/useAccount"
import { getSendPagePath } from "../../pages/send";
import { getPrettyEtherFlowRate } from "../../utils/tokenUtils";
import { Network } from "../network/networks";
import Link from "../common/Link";

interface ModifyStreamButtonProps {
  stream: Stream;
  network: Network;
  size?: IconButtonProps["size"];
  TooltipProps?: Partial<TooltipProps>;
}

const ModifyStreamButton: FC<ModifyStreamButtonProps> = ({
  stream,
  network,
  size,
  TooltipProps = {},
}) => {
  const { address: accountAddress, isConnected } = useAccount();

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

  const isSenderLooking = useMemo(
    () =>
      accountAddress &&
      stream.sender.toLowerCase() === accountAddress.toLowerCase(),
    [accountAddress, stream.sender]
  );

  if (!isSenderLooking) return null;

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
        <IconButton
          size={size}
          LinkComponent={Link}
          href={modifyStreamUrl}
          color="primary"
          disabled={!isConnected}
        >
          <EditRoundedIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default ModifyStreamButton;
