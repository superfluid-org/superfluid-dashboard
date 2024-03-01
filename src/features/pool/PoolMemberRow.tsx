import {
    IconButton,
    ListItemText,
    Skeleton,
    Stack,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { IndexSubscription, PoolMember } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { subscriptionWeiAmountReceived } from "../../utils/tokenUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { Network } from "../network/networks";
import { usePendingIndexSubscriptionApprove } from "../pendingUpdates/PendingIndexSubscriptionApprove";
import { usePendingIndexSubscriptionRevoke } from "../pendingUpdates/PendingIndexSubscriptionRevoke";
import { rpcApi, subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { PendingProgress } from "../pendingUpdates/PendingProgress";
import { useAnalytics } from "../analytics/useAnalytics";
import { usePoolMemberTotalAmountReceived } from "./usePoolMemberTotalAmountReceived";
import FlowingBalance from "../token/FlowingBalance";
import { UnitOfTime } from "../send/FlowRateInput";

type Props = {
    network: Network;
    poolMember: PoolMember;
}

const SubscriptionRow: FC<Props> = ({
    poolMember,
    network,
}) => {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
    const { txAnalytics } = useAnalytics();

    const { currentData: pool } = subgraphApi.usePoolQuery({
        chainId: network.id,
        id: poolMember.pool
    }, {})

    const totalAmountReceived = usePoolMemberTotalAmountReceived(poolMember, pool)

    // if not connected, query "claimable"

    if (!pool) {
        // todo: handle this
        return null;
    }

    return (
        <TableRow>

            {/* Pool ID (the sender, basically) */}
            <TableCell>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <AddressAvatar
                        address={pool.id}
                        AvatarProps={{
                            sx: { width: "24px", height: "24px", borderRadius: "5px" },
                        }}
                        BlockiesProps={{ size: 8, scale: 3 }}
                    />
                    <ListItemText
                        data-cy="publisher"
                        primary={
                            <AddressCopyTooltip address={pool.id}>
                                <span>
                                    <AddressName address={pool.id} />
                                </span>
                            </AddressCopyTooltip>
                        }
                        primaryTypographyProps={{ variant: "h7" }}
                    />
                </Stack>
            </TableCell>
            {/* --- */}

            <TableCell>
                {/* Use FIAT price here as well? */}
                {totalAmountReceived && <FlowingBalance balance={totalAmountReceived.memberCurrentTotalAmountReceived} balanceTimestamp={totalAmountReceived.timestamp} flowRate={totalAmountReceived.memberFlowRate} />}
            </TableCell>

            <TableCell>
                {totalAmountReceived && (
                    <Typography data-cy={"flow-rate"} variant="body2mono">
                        {/* TODO: Move this into a component */}
                        +
                        <Amount
                            wei={BigNumber.from(totalAmountReceived?.memberFlowRate).mul(UnitOfTime.Month)}
                        />
                        /mo
                    </Typography>
                )}
            </TableCell>

            <TableCell></TableCell>

        </TableRow>
    );
};

export default SubscriptionRow;
