import { Chip, Stack, Typography } from "@mui/material";
import { Address, Token } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import { useAccount } from "wagmi";
import AddressName from "../../components/AddressName/AddressName";
import useNavigateBack from "../../hooks/useNavigateBack";
import { CopyIconBtn } from "../common/CopyIconBtn";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import TokenIcon from "../token/TokenIcon";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { DeleteVestingTransactionButton } from "./DeleteVestingTransactionButton";
import { VestingSchedule } from "./types";
import VestingHeader from "./VestingHeader";

interface CounterpartyAddressProps {
  title: string;
  address: Address;
}

const CounterpartyAddress: FC<CounterpartyAddressProps> = ({
  title,
  address,
}) => (
  <Stack direction="row" alignItems="center" gap={1}>
    <Typography variant="body1" color="text.secondary" translate="yes">
      {title}
    </Typography>
    <Stack direction="row" alignItems="center">
      <Typography variant="h6" color="text.secondary">
        <AddressName address={address} />
      </Typography>
      <CopyIconBtn
        description="Copy address to clipboard"
        IconButtonProps={{ size: "small" }}
        TooltipProps={{
          arrow: true,
          placement: "top",
        }}
        copyText={address}
      />
    </Stack>
  </Stack>
);

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
    <>
      <VestingHeader
        onBack={navigateBack}
        sx={{ mb: 0 }}
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
        <Stack direction="column">
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
        </Stack>
      </VestingHeader>
      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        sx={{ mt: 1.5, mb: 3.5, ml: 6 }}
      >
        <CounterpartyAddress title="Sender:" address={sender} />
        <CounterpartyAddress title="Receiver:" address={receiver} />
      </Stack>
    </>
  );
};

export default VestingDetailsHeader;
