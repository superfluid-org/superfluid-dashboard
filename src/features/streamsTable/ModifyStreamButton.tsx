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
import { useNetwork } from "wagmi";
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
  const { chain: activeChain } = useNetwork();

  const modifyStreamUrl = useMemo(
    () =>
      getSendPagePath({
        token: stream.token,
        receiver: stream.receiver,
        flowRate: getPrettyEtherFlowRate(stream.currentFlowRate),
      }),
    [stream]
  );

  return (
    <Tooltip
      arrow
      disableInteractive
      placement="top"
      title={
        network.id === activeChain?.id
          ? "Modify Stream"
          : `Please connect your wallet and switch provider network to ${network.name} in order to modify the stream.`
      }
      {...TooltipProps}
    >
      <span>
        <Link href={modifyStreamUrl} passHref>
          <IconButton
            color="primary"
            disabled={network.id !== activeChain?.id}
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
