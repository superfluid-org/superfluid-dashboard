import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format } from "date-fns";
import { FC, memo } from "react";
import { BurnedActivity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import ActivityIcon from "./ActivityIcon";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface BurnActivityProps extends BurnedActivity {
  dateFormat?: string;
}

const BurnActivity: FC<BurnActivityProps> = ({
  keyEvent,
  transferEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { amount, transactionHash, timestamp, token } = keyEvent;
  const { token: superTokenAddress } = transferEvent || {};

  const tokenPrice = useTokenPrice(network.id, token);

  const { data: superToken } = useTokenQuery(
    superTokenAddress
      ? {
          id: superTokenAddress,
          chainId: network.id,
          onlySuperToken: true
        }
      : skipToken
  );

  const { data: underlyingToken }  = useTokenQuery(
    superToken?.underlyingAddress
      ? {
          chainId: network.id,
          id: superToken.underlyingAddress,
        }
      : skipToken
  );

  return (
    <TableRow data-cy={`${network.slugName}-row`}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={SwapVertIcon} />
          <ListItemText
            data-cy={"activity"}
            primary={"Unwrap"}
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
            {superToken && (
              <ListItem sx={{ p: 0 }}>
                <ListItemAvatar>
                  <TokenIcon
                    isSuper
                    chainId={network.id}
                    tokenAddress={superToken.address}
                    isUnlisted={!superToken.isListed}
                  />
                </ListItemAvatar>
                <ListItemText
                  data-cy={"amount"}
                  primary={
                    <>
                      -<Amount wei={amount}> {superToken.symbol}</Amount>
                    </>
                  }
                  secondary={
                    tokenPrice && <FiatAmount price={tokenPrice} wei={amount} />
                  }
                  primaryTypographyProps={{
                    variant: "h6mono",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              </ListItem>
            )}
          </TableCell>
          <TableCell>
            {underlyingToken && (
              <ListItem sx={{ p: 0 }}>
                <ListItemAvatar>
                  <TokenIcon
                    chainId={network.id}
                    tokenAddress={underlyingToken.address}
                  />
                </ListItemAvatar>
                <ListItemText
                  data-cy={"amountToFrom"}
                  primary={
                    <>
                      +<Amount wei={amount}> {underlyingToken.symbol}</Amount>
                    </>
                  }
                  secondary={
                    tokenPrice && <FiatAmount price={tokenPrice} wei={amount} />
                  }
                  primaryTypographyProps={{
                    variant: "h6mono",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2mono",
                    color: "text.secondary",
                  }}
                />
              </ListItem>
            )}
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
          {!!(superToken && underlyingToken) && (
            <Stack direction="row" alignItems="center" gap={2}>
              <ListItemText
                data-cy={"mobile-amount"}
                primary={
                  <>
                    +<Amount wei={amount}> {underlyingToken.symbol}</Amount>
                  </>
                }
                secondary={
                  <>
                    -<Amount wei={amount}> {superToken.symbol}</Amount>
                  </>
                }
                primaryTypographyProps={{ variant: "h7mono" }}
                secondaryTypographyProps={{ variant: "body2mono" }}
              />
              <TokenIcon
                chainId={network.id}
                tokenAddress={underlyingToken.address}
              />
            </Stack>
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(BurnActivity);
