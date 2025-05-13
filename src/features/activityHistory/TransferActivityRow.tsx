import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { TransferEvent } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import { Activity } from "../../utils/activityUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface TransferActivityRowProps extends Activity<TransferEvent> {
  dateFormat?: string;
}

const TransferActivityRow: FC<TransferActivityRowProps> = ({
  keyEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const { from, to, token, value, timestamp, transactionHash } = keyEvent;

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();

  const tokenPrice = useTokenPrice(network.id, token);

  const tokenQuery = useTokenQuery(
    token
      ? {
          chainId: network.id,
          id: token,
          onlySuperToken: true,
        }
      : skipToken
  );

  const isOutgoing = useMemo(
    () => visibleAddress?.toLowerCase() === from.toLowerCase(),
    [visibleAddress, from]
  );

  return (
    <TableRow data-cy={`${network.slugName}-row`}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={isOutgoing ? ArrowForwardRoundedIcon : ArrowBackRoundedIcon} />
          <ListItemText
            data-cy={"activity"}
            primary={isOutgoing ? "Send Transfer" : "Receive Transfer"}
            secondary={format(timestamp * 1000, dateFormat)}
            primaryTypographyProps={{
              translate: "yes",
              variant: isBelowMd ? "h7" : "h6",
            }}
            secondaryTypographyProps={{
              variant: "body2mono",
              color: "text.secondary",
            }}
          />
        </ListItem>
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <TokenIcon
                  isSuper
                  chainId={network.id}
                  tokenAddress={token}
                  isUnlisted={!tokenQuery.data?.isListed}
                  isLoading={tokenQuery.isLoading}
                />
              </ListItemAvatar>
              {tokenQuery.data && (
                <ListItemText
                  data-cy={"amount"}
                  primary={
                    <Amount wei={value} decimals={tokenQuery.data.decimals}>
                      {" "}
                      {tokenQuery.data.symbol}
                    </Amount>
                  }
                  secondary={
                    tokenPrice && <FiatAmount price={tokenPrice} wei={value} />
                  }
                  primaryTypographyProps={{
                    variant: "h6mono",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              )}
            </ListItem>
          </TableCell>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <AddressAvatar address={isOutgoing ? to : from} />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amountToFrom"}
                primary={isOutgoing ? "To" : "From"}
                secondary={
                  <AddressCopyTooltip address={isOutgoing ? to : from}>
                    <Typography
                      variant="h6"
                      color="text.primary"
                      component="span"
                    >
                      <AddressName address={isOutgoing ? to : from} />
                    </Typography>
                  </AddressCopyTooltip>
                }
                primaryTypographyProps={{
                  translate: "yes",
                  variant: "body2",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          </TableCell>
          <TableCell sx={{ position: "relative" }}>
            <TxHashLink txHash={transactionHash} network={network} />
            <NetworkBadge
              network={network}
              sx={{ position: "absolute", top: "0px", right: "16px" }}
            />
          </TableCell>
        </>
      ) : (
        <TableCell align="right">
          <Stack direction="row" alignItems="center" gap={2}>
            {tokenQuery.data && (
              <ListItemText
                data-cy={"mobile-amount"}
                primary={
                  <Amount wei={value} decimals={tokenQuery.data.decimals}>
                    {" "}
                    {tokenQuery.data.symbol}
                  </Amount>
                }
                primaryTypographyProps={{ variant: "h7mono" }}
                secondaryTypographyProps={{ variant: "body2mono" }}
              />
            )}
            <TokenIcon
              isSuper
              chainId={network.id}
              tokenAddress={token}
              isUnlisted={!tokenQuery.data?.isListed}
              isLoading={tokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(TransferActivityRow);
