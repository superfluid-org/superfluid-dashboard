import {
    ListItemText,
    Skeleton,
    Stack,
    TableCell,
    TableRow,
    Typography,
    useTheme,
} from "@mui/material";
import { PoolMember } from "@superfluid-finance/sdk-core";
import { BigNumber } from "ethers";
import { FC } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import Amount from "../token/Amount";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { useTotalAmountReceivedFromPoolMember } from "./usePoolMemberTotalAmountReceived";
import FlowingBalance from "../token/FlowingBalance";
import { UnitOfTime } from "../send/FlowRateInput";
import { ConnectToPoolButton } from "./ConnectToPoolButton";
import { PoolMemberStatus } from "./PoolMemberStatus";
import { DisconnectFromPoolButton } from "./DisconnectFromPoolButton";

type Props = {
    network: Network;
    poolMember: PoolMember;
}

const PoolMemberRow: FC<Props> = ({
    poolMember,
    network,
}) => {
    const theme = useTheme();

    const { currentData: pool } = subgraphApi.usePoolQuery({
        chainId: network.id,
        id: poolMember.pool
    }, {})

    const totalAmountReceived = useTotalAmountReceivedFromPoolMember(network.id, poolMember.account, poolMember.pool)
    const isReceivingFlow = totalAmountReceived?.memberFlowRate?.gt(0);

    // if not connected, query "claimable"

    return (
        <TableRow>

            {/* Pool ID (the sender, basically) */}
            <TableCell>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    {pool ? (
                        <>
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
                        </>
                    ) : (<>
                    <Skeleton variant="rounded" width="24px" />
                    <Skeleton width="100px" />
                    </>)}

                </Stack>
            </TableCell>
            {/* --- */}

            <TableCell>
                {/* Use FIAT price here as well? */}
                {totalAmountReceived && (
                    <Typography variant="h7mono">
                        <FlowingBalance balance={totalAmountReceived.memberCurrentTotalAmountReceived} balanceTimestamp={totalAmountReceived.timestamp} flowRate={totalAmountReceived.memberFlowRate} />
                    </Typography>
                )}
            </TableCell>

            <TableCell>
                {totalAmountReceived && (
                    <Typography data-cy={"flow-rate"} variant="body2mono">
                        {/* TODO: Move this into a component */}
                        {isReceivingFlow ? <>+<Amount
                            wei={BigNumber.from(totalAmountReceived.memberFlowRate).mul(UnitOfTime.Month)}
                        />/mo</> : "-"}
                    </Typography>
                )}
            </TableCell>

            <TableCell><PoolMemberStatus poolMember={poolMember} /></TableCell>

            <TableCell>
                <ConnectionBoundary expectedNetwork={network}>
                    {() => (
                        <>
                            <ConnectToPoolButton network={network} poolMember={poolMember} />
                            <DisconnectFromPoolButton network={network} poolMember={poolMember} />
                        </>
                    )}
                </ConnectionBoundary>
            </TableCell>

        </TableRow>
    );
};

export default PoolMemberRow;
