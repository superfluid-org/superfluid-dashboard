import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address, Token } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import AddressName from "../../components/AddressName/AddressName";
import useNavigateBack from "../../hooks/useNavigateBack";
import { CopyIconBtn } from "../common/CopyIconBtn";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import TokenIcon from "../token/TokenIcon";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { DeleteVestingTransactionButton } from "./transactionButtons/DeleteVestingTransactionButton";
import { VestingSchedule } from "./types";
import Link from "next/link";
import { ClaimVestingScheduleTransactionButton } from "./transactionButtons/ClaimVestingScheduleTransactionButton";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

interface CounterpartyAddressProps {
  title: string;
  address: Address;
}

const CounterpartyAddress: FC<CounterpartyAddressProps> = ({
  title,
  address,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack
      direction={isBelowMd ? "column" : "row"}
      alignItems={isBelowMd ? "start" : "center"}
      gap={isBelowMd ? 0 : 1}
    >
      <Typography
        variant={isBelowMd ? "body2" : "body1"}
        color="text.secondary"
        translate="yes"
      >
        {title}
      </Typography>
      <Stack direction="row" alignItems="center">
        <Typography
          data-cy={`${title.replace(":", "")}-address`}
          variant={isBelowMd ? "h7" : "h6"}
          color="text.secondary"
        >
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
};

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
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();
  const navigateBack = useNavigateBack("/vesting");

  const { deletedAt, endExecutedAt, superToken, sender, receiver, status, version } =
    vestingSchedule;

  const canDelete = !!visibleAddress && !deletedAt && !endExecutedAt;

  const isIncoming = visibleAddress?.toLowerCase() === receiver.toLowerCase();
  const isSenderOrReceiver = visibleAddress?.toLowerCase() === receiver.toLowerCase() || visibleAddress?.toLowerCase() === sender.toLowerCase();

  const showUnwrap = (status.isStreaming || status.isFinished) && isIncoming;

  const showClaim = isSenderOrReceiver && !!vestingSchedule.claimValidityDate && !vestingSchedule.cliffAndFlowExecutedAt;
  const isClaimEnabled = showClaim && status.canClaim;

  return (
    <ConnectionBoundary expectedNetwork={network}>
      <Stack gap={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 0 }}
        >
          <Stack direction="row" alignItems="center" gap={2}>
            <IconButton color="inherit" onClick={navigateBack}>
              <ArrowBackRoundedIcon />
            </IconButton>
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
                  avatar={
                    <NetworkIcon network={network} size={18} fontSize={14} />
                  }
                />
              </Stack>
            </Stack>
          </Stack>
          {(canDelete || showClaim) && !isBelowMd && (
            <Stack direction="row" alignItems="center" gap={1}>
              {showClaim && (
                <ClaimVestingScheduleTransactionButton
                  superTokenAddress={superToken}
                  senderAddress={sender}
                  receiverAddress={receiver}
                  version={version}
                  TransactionButtonProps={{
                    disabled: !isClaimEnabled,
                  }}
                />
              )}

              {canDelete && (
                <DeleteVestingTransactionButton
                  superTokenAddress={superToken}
                  senderAddress={sender}
                  receiverAddress={receiver}
                  version={version}
                />
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        gap={isBelowMd ? 1 : 2}
        sx={{
          mt: 1.5,
          mb: 3.5,
          ml: 6,
          [theme.breakpoints.down("md")]: {
            ml: 0,
          },
        }}
      >
        <CounterpartyAddress title="Sender:" address={sender} />
        <CounterpartyAddress title="Receiver:" address={receiver} />

        <Stack direction="row" justifyContent="end" flex={1}>
          {isBelowMd && (
            <>
              {showClaim && (
                <ClaimVestingScheduleTransactionButton
                  superTokenAddress={superToken}
                  senderAddress={sender}
                  receiverAddress={receiver}
                  version={version}
                  TransactionButtonProps={{ ButtonProps: { size: "small" } }}
                />
              )}

              {canDelete && (
                <DeleteVestingTransactionButton
                  superTokenAddress={superToken}
                  senderAddress={sender}
                  receiverAddress={receiver}
                  version={version}
                  TransactionButtonProps={{ ButtonProps: { size: "small" } }}
                />
              )}
            </>
          )}

          {showUnwrap && (
            <Link
              href={`/wrap?downgrade&token=${superToken}&network=${network.slugName}`}
            >
              <Button variant="outlined" color="primary">
                Unwrap
              </Button>
            </Link>
          )}

        </Stack>
      </Stack>
    </ConnectionBoundary>
  );
};

export default VestingDetailsHeader;
