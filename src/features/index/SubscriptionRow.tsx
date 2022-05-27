import {
  Avatar,
  Button,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { IndexSubscription } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC } from "react";
import Blockies from "react-blockies";
import shortenAddress from "../../utils/shortenAddress";
import { subscriptionWeiAmountReceived } from "../../utils/tokenUtils";
import EtherFormatted from "../token/EtherFormatted";

export const SubscriptionLoadingRow = () => (
  <TableRow>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={{ borderRadius: "10px" }}
        />
        <Typography variant="h6">
          <Skeleton width={100} />
        </Typography>
      </Stack>
    </TableCell>
    <TableCell>
      <Typography variant="body2mono">
        <Skeleton width={150} />
      </Typography>
    </TableCell>
    <TableCell>
      <Skeleton width={150} />
    </TableCell>
    <TableCell>
      <Skeleton width={100} />
    </TableCell>
    <TableCell>
      <Skeleton width={60} />
    </TableCell>
  </TableRow>
);

interface SubscriptionRowProps {
  subscription: IndexSubscription;
}

const SubscriptionRow: FC<SubscriptionRowProps> = ({ subscription }) => {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar variant="rounded">
            <Blockies seed={subscription.publisher} size={12} scale={3} />
          </Avatar>
          <Typography variant="h6">
            {shortenAddress(subscription.publisher)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="h7mono">
          <EtherFormatted
            wei={subscriptionWeiAmountReceived(
              BigNumber.from(subscription.indexValueCurrent),
              BigNumber.from(subscription.totalAmountReceivedUntilUpdatedAt),
              BigNumber.from(subscription.indexValueUntilUpdatedAt),
              BigNumber.from(subscription.units)
            )}
            etherDecimalPlaces={8}
            disableRoundingIndicator
          />
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          variant="body2"
          color={subscription.approved ? "primary" : "warning.main"}
        >
          {subscription.approved ? "Approved" : "Awaiting Approval"}
        </Typography>
      </TableCell>
      <TableCell>
        {format(subscription.updatedAtTimestamp * 1000, "d MMM. yyyy")}
      </TableCell>
      <TableCell>
        {!subscription.approved && (
          <Button variant="textContained" color="primary" size="small">
            Approve
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default SubscriptionRow;
