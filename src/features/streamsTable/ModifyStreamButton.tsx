import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { FC, useCallback } from "react";
import { useNetwork } from "wagmi";
import { getSendPagePath } from "../../pages/send";
import {
  estimateUnitOfTime,
  getPrettyEtherValue,
} from "../../utils/tokenUtils";
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
  const router = useRouter();
  const { chain: activeChain } = useNetwork();

  const modifyStream = useCallback(() => {
    const unitOfTime = estimateUnitOfTime(stream.currentFlowRate);

    const amountEther = getPrettyEtherValue(
      BigNumber.from(stream.currentFlowRate)
        .mul(BigNumber.from(unitOfTime))
        .toString()
    );

    router.push(
      getSendPagePath({
        token: stream.token,
        receiver: stream.receiver,
        flowRate: {
          amountEther,
          unitOfTime,
        },
      })
    );
  }, [stream, router]);

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
        <IconButton
          color="primary"
          onClick={modifyStream}
          disabled={network.id !== activeChain?.id}
          {...IconButtonProps}
        >
          <EditRoundedIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default ModifyStreamButton;
