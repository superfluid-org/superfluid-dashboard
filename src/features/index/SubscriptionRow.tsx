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
import { FC, useMemo } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { subscriptionWeiAmountReceived } from "../../utils/tokenUtils";
import Ether from "../token/Ether";

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
    {/* <TableCell>
      <Skeleton width={60} />
    </TableCell> */}
  </TableRow>
);

interface SubscriptionRowProps {
  subscription: IndexSubscription;
}

const SubscriptionRow: FC<SubscriptionRowProps> = ({ subscription }) => {
  const {
    indexValueCurrent,
    totalAmountReceivedUntilUpdatedAt,
    indexValueUntilUpdatedAt,
    units,
  } = subscription;

  const amountReceived = useMemo(
    () =>
      subscriptionWeiAmountReceived(
        BigNumber.from(indexValueCurrent),
        BigNumber.from(totalAmountReceivedUntilUpdatedAt),
        BigNumber.from(indexValueUntilUpdatedAt),
        BigNumber.from(units)
      ),
    [
      indexValueCurrent,
      totalAmountReceivedUntilUpdatedAt,
      indexValueUntilUpdatedAt,
      units,
    ]
  );

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <AddressAvatar
            address={subscription.publisher}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <Typography variant="h7">
            <AddressName address={subscription.publisher} />
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="h7mono">
          <Ether wei={amountReceived} />
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
      {/* <TableCell>
        {!subscription.approved && (
          <Button variant="textContained" color="primary" size="small">
            Approve
          </Button>
        )}
      </TableCell> */}
    </TableRow>
  );
};

export default SubscriptionRow;
