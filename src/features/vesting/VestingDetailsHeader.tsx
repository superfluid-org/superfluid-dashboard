import { Chip, Stack, Typography } from "@mui/material";
import { Token } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import { useAccount } from "wagmi";
import useNavigateBack from "../../hooks/useNavigateBack";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import TokenIcon from "../token/TokenIcon";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { DeleteVestingTransactionButton } from "./DeleteVestingTransactionButton";
import { VestingSchedule } from "./types";
import VestingHeader from "./VestingHeader";

interface VestingDetailsHeaderProps {
  network: Network;
  vestingSchedule: VestingSchedule;
  token: Token;
}

const VestingDetailsHeader: FC<VestingDetailsHeaderProps> = ({
  network,
  vestingSchedule,
  token,
}) => {
  const { address: accountAddress } = useAccount();
  const navigateBack = useNavigateBack("/vesting");

  const { deletedAt, endExecutedAt, superToken, sender, receiver } =
    vestingSchedule;

  const canDelete = !!accountAddress && !deletedAt && !endExecutedAt;

  return (
    <VestingHeader
      onBack={navigateBack}
      actions={
        canDelete && (
          <ConnectionBoundary expectedNetwork={network}>
            <DeleteVestingTransactionButton
              superTokenAddress={superToken}
              senderAddress={sender}
              receiverAddress={receiver}
            />
          </ConnectionBoundary>
        )
      }
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <TokenIcon isSuper tokenSymbol={token.symbol} />
        <Typography component="h1" variant="h4">
          Vesting {token.symbol}
        </Typography>
        <Chip
          size="small"
          label={network.name}
          translate="no"
          avatar={<NetworkIcon network={network} size={18} fontSize={14} />}
        />
      </Stack>
    </VestingHeader>
  );
};

export default VestingDetailsHeader;
