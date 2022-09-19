import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
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
import { IndexUpdatedEvent } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import { Activity } from "../../utils/activityUtils";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

const IndexUpdatedActivityRow: FC<Activity<IndexUpdatedEvent>> = ({
  keyEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { visibleAddress } = useVisibleAddress();

  const {
    timestamp,
    token,
    publisher,
    oldIndexValue,
    newIndexValue,
    totalUnitsApproved,
    totalUnitsPending,
    transactionHash,
  } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const isPublisher = visibleAddress?.toLowerCase() === publisher.toLowerCase();

  const { totalDistributed, distributedApproved, distributedPending } =
    useMemo(() => {
      const distributedAmount = BigNumber.from(newIndexValue).sub(
        BigNumber.from(oldIndexValue)
      );

      const distributedApproved =
        BigNumber.from(totalUnitsApproved).mul(distributedAmount);
      const distributedPending =
        BigNumber.from(totalUnitsPending).mul(distributedAmount);

      return {
        totalDistributed: distributedApproved
          .add(distributedPending)
          .toString(),
        distributedApproved: distributedApproved.toString(),
        distributedPending: distributedPending.toString(),
      };
    }, [oldIndexValue, newIndexValue, totalUnitsApproved, totalUnitsPending]);

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon
            icon={CallSplitRoundedIcon}
            IconProps={{
              sx: { transform: `rotate(${isPublisher ? "" : "-"}90deg)` },
            }}
          />
          <ListItemText
            primary="Send Distribution"
            secondary={format(timestamp * 1000, "HH:mm")}
            primaryTypographyProps={{
              variant: isBelowMd ? "h7" : "h6",
              translate: "yes",
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
                  tokenSymbol={tokenQuery.data?.symbol}
                  isUnlisted={!tokenQuery.data?.isListed}
                  isLoading={tokenQuery.isLoading}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <>
                    -
                    <Amount wei={totalDistributed} />
                    {` `}
                    {tokenQuery.data?.symbol}
                  </>
                }
                primaryTypographyProps={{
                  variant: "h6mono",
                  color: "error",
                }}
                secondaryTypographyProps={{
                  variant: "body2mono",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          </TableCell>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemText
                primary={
                  <>
                    <span translate="yes">Approved: </span>
                    <Amount wei={distributedApproved} />
                    {` `}
                    {tokenQuery.data?.symbol}
                  </>
                }
                secondary={
                  <>
                    <span translate="yes">Pending: </span>
                    <Amount wei={distributedPending} />
                    {` `}
                    {tokenQuery.data?.symbol}
                  </>
                }
                primaryTypographyProps={{
                  variant: "h6",
                  color: "text.primary",
                }}
                secondaryTypographyProps={{
                  variant: "body2",
                  color: "text.secondary",
                }}
                sx={{ ml: 6.5 }}
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
          <Stack direction="row" alignItems="center" gap={1}>
            <ListItemText
              primary={
                <>
                  -
                  <Amount wei={totalDistributed} />
                </>
              }
              secondary={tokenQuery.data?.symbol || ""}
              primaryTypographyProps={{
                variant: "h6mono",
                color: "error",
              }}
              secondaryTypographyProps={{
                variant: "body2mono",
                color: "text.secondary",
              }}
            />
            <TokenIcon
              isSuper
              tokenSymbol={tokenQuery.data?.symbol}
              isUnlisted={!tokenQuery.data?.isListed}
              isLoading={tokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default IndexUpdatedActivityRow;
