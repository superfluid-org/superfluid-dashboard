import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
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
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { IndexUnitsUpdatedActivity } from "../../utils/activityUtils";
import { BIG_NUMBER_ZERO } from "../../utils/tokenUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TxHashLink from "../common/TxHashLink";
import NetworkBadge from "../network/NetworkBadge";
import { subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ActivityIcon from "./ActivityIcon";

interface IndexUnitsUpdatedActivityRowProps extends IndexUnitsUpdatedActivity {
  dateFormat?: string;
}

const IndexUnitsUpdatedActivityRow: FC<IndexUnitsUpdatedActivityRowProps> = ({
  keyEvent,
  subscriptionUnitsUpdatedEvent,
  network,
  dateFormat = "HH:mm",
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();

  const {
    indexId,
    timestamp,
    publisher,
    subscriber,
    token,
    units,
    oldUnits,
    transactionHash,
    blockNumber,
  } = keyEvent;

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token,
  });

  const indexQuery = subgraphApi.useIndexQuery({
    chainId: network.id,
    id: `${publisher}-${token}-${indexId}`,
    block: {
      number: blockNumber,
    },
  });

  const getUnitsLabel = (units: string) =>
    BigNumber.from(units).eq(BigNumber.from(1)) ? "unit" : "units";

  const unitsDiffString = useMemo(() => {
    const unitsDiff = BigNumber.from(units).sub(BigNumber.from(oldUnits));
    const sign = unitsDiff.gte(BIG_NUMBER_ZERO) ? "+" : "";
    return `${sign}${unitsDiff} ${getUnitsLabel(unitsDiff.toString())}`;
  }, [units, oldUnits]);

  const unitsPercentageString = useMemo(() => {
    if (!indexQuery.data) return undefined;

    const unitsBN = BigNumber.from(units);
    if (unitsBN.eq(0)) return `0%`;

    const percentage = unitsBN
      .mul(100)
      .div(BigNumber.from(indexQuery.data.totalUnits))
      .toNumber()
      .toFixed(2);

    return `${percentage}%`;
  }, [indexQuery.data, units]);

  const isPublisher = visibleAddress?.toLowerCase() === publisher.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ActivityIcon icon={PercentRoundedIcon} />
          <ListItemText
            data-cy={"activity"}
            primary="Subscription Updated"
            secondary={format(timestamp * 1000, dateFormat)}
            primaryTypographyProps={{
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
                  tokenSymbol={tokenQuery.data?.symbol}
                  isUnlisted={!tokenQuery.data?.isListed}
                  isLoading={tokenQuery.isLoading}
                />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amount"}
                primary={unitsPercentageString}
                secondary={unitsDiffString}
                primaryTypographyProps={{
                  variant: "h6mono",
                }}
                secondaryTypographyProps={{
                  variant: "body2mono",
                  color: "text.secondary",
                  translate: "yes",
                }}
              />
            </ListItem>
          </TableCell>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <AddressAvatar address={isPublisher ? subscriber : publisher} />
              </ListItemAvatar>
              <ListItemText
                data-cy={"amountToFrom"}
                primary={isPublisher ? "Subscriber" : "Publisher"}
                secondary={
                  <AddressCopyTooltip
                    address={isPublisher ? subscriber : publisher}
                  >
                    <Typography
                      variant="h6"
                      color="text.primary"
                      component="span"
                    >
                      <AddressName
                        address={isPublisher ? subscriber : publisher}
                      />
                    </Typography>
                  </AddressCopyTooltip>
                }
                primaryTypographyProps={{
                  variant: "body2",
                  color: "text.secondary",
                  translate: "yes",
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
          <Stack direction="row" alignItems="center" gap={1}>
            <ListItemText
              primary={unitsPercentageString}
              secondary={unitsDiffString}
              primaryTypographyProps={{
                variant: "h6mono",
              }}
              secondaryTypographyProps={{
                variant: "body2mono",
                color: "text.secondary",
                translate: "yes",
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

export default IndexUnitsUpdatedActivityRow;
