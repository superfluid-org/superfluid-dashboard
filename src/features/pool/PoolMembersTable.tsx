import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useMemo, useState } from "react";
import { EmptyRow } from "../common/EmptyRow";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { PoolMemberRowLoading } from "./PoolMemberRowLoading";
import PoolMemberRow from "./PoolMemberRow";
import _ from "lodash";

type Props = {
    tokenAddress: Address;
    network: Network;
}

const PoolMembersTable: FC<Props> = ({
    tokenAddress,
    network,
}) => {
    const theme = useTheme();

    const { visibleAddress } = useVisibleAddress();

    const { poolMembers, isPoolMemberLoading } = subgraphApi.usePoolMembersQuery({
        chainId: network.id,
        filter: {
            pool_: {
                token: tokenAddress
            },
            account: visibleAddress,
        },
        order: {
            orderBy: "updatedAtTimestamp",
            orderDirection: "desc"
        },
        pagination: {
            take: Infinity
        },
    }, {
        selectFromResult: (result) => {
            return ({
                poolMembers: (result.currentData?.items || []),
                isPoolMemberLoading: result.isLoading || result.isUninitialized
            });
        },
        refetchOnFocus: true // Re-fetch list view more often where there might be something incoming.
    })
    const isPoolMembersEmpty = poolMembers.length === 0;

    // TODO: Need to order by flow rate first somewhere!

    // # Paging stuff
    // TODO: We copy-paste the pagination logic around a lot...
    const minPageLength = 5;
    const [rowsPerPage, setRowsPerPage] = useState(minPageLength);
    const [page, setPage] = useState(0);
    const poolMembersPage = useMemo(() =>
        poolMembers.slice(page * rowsPerPage, (page + 1) * rowsPerPage), [poolMembers, page, rowsPerPage]);

    const handleChangePage = (_e: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newRowsPerPage = rowsPerPage === -1 ? poolMembers.length : parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };
    // ---

    return (
        <TableContainer
            component={Paper}
            sx={{
                [theme.breakpoints.down("md")]: {
                    mx: -2,
                    width: "auto",
                    borderRadius: 0,
                    border: "none",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    boxShadow: "none",
                },
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Pool</TableCell>
                        <TableCell>Amount Received</TableCell>
                        <TableCell>Flow Rate</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell width="100"></TableCell>
                    </TableRow>
                </TableHead>

                {/* The Meaty Part */}
                <TableBody>
                    {isPoolMemberLoading ? (
                        <PoolMemberRowLoading />
                    ) : isPoolMembersEmpty ? (
                        <EmptyRow span={5} />
                    ) : (
                        poolMembersPage
                            .map((poolMember) => (
                                <PoolMemberRow
                                    key={poolMember.id}
                                    network={network}
                                    poolMember={poolMember}
                                />
                            ))
                    )}
                </TableBody>
                {/* --- */}
            </Table>

            {/*  # Pagination */}
            {poolMembers.length > minPageLength && (
                <TablePagination
                    rowsPerPageOptions={[minPageLength, 10, 25, { value: poolMembers.length, label: 'All' }]}
                    component="div"
                    count={poolMembers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        "> *": {
                            visibility:
                                poolMembers.length <= 5 ? "hidden" : "visible",
                        },
                    }}
                />
            )}
            {/* --- */}

        </TableContainer>
    );
};

export default PoolMembersTable;