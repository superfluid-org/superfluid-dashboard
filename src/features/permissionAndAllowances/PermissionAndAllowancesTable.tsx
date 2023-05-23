import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "@superfluid-finance/sdk-core";
import {
    Divider,
    Paper,
    Stack,
    TableContainer,
    Typography,
    useMediaQuery,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
} from "@mui/material";
import NoWalletConnected from "../../components/NoWalletConnected/NoWalletConnected";
import PermissionAndAllowancesRow from "./PermissionAndAllowancesRow";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { FetchingStatus } from "./PermissionAndAllowancesTables";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";

interface PermissionAndAllowancesTableProps {
    address: Address;
    network: Network;
    fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
}

const PermissionAndAllowancesTable: FC<PermissionAndAllowancesTableProps> = ({
    address,
    network,
    fetchingCallback,
}) => {
    const theme = useTheme();

    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const flowOperatorsQuery = subgraphApi.useFlowOperatorsQuery(
        {
            chainId: network.id,
            filter: {
                sender: address,
            },
            pagination: {
                take: Infinity,
                skip: 0,
            },
        },
        {
            refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
            selectFromResult: (result) => ({
                ...result,
                flowOperators:
                    result.data?.data
                        .map((snapshot) => ({
                            ...snapshot,
                        })) || [],
            }),
        }
    )


    const permissionAndAllowancesList = useMemo(
        () =>
            flowOperatorsQuery.flowOperators,
        [flowOperatorsQuery]
    );

    useEffect(() => {
        fetchingCallback(network.id, {
            isLoading:
                flowOperatorsQuery.isLoading,
            hasContent: !!permissionAndAllowancesList.length,
        });
    }, [
        network.id,
        flowOperatorsQuery.isLoading,
        permissionAndAllowancesList.length,
        fetchingCallback,
    ]);

    const handleChangePage = () => (_e: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = () => (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(rowsPerPage);
        setPage(page);
    };

    const paginatedRecords = useMemo(
        () =>
            permissionAndAllowancesList.slice(
                page * rowsPerPage,
                (page + 1) * rowsPerPage
            ),
        [page, rowsPerPage, permissionAndAllowancesList]
    );


    if (
        flowOperatorsQuery.isLoading ||
        permissionAndAllowancesList.length === 0
    )
        return null;

    return (
            <TableContainer
                data-cy={network.slugName + "-permission-and-allowances-table"}
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
                <Table sx={{ tableLayout: "fixed" }}>

                    <TableHead>
                        <NetworkHeadingRow colSpan={5} network={network} />
                        {!isBelowMd && <TableRow>
                            <TableCell width="136px" sx={{ pl: 5 }}>
                                Asset
                            </TableCell>
                            <TableCell width="183px">Address</TableCell>
                            <TableCell width="186px">ERC-20 Allowance</TableCell>
                            <TableCell width="183px">Stream Permissions</TableCell>
                            <TableCell width="232px">Stream Allowance</TableCell>
                            <TableCell width="148px">Actions</TableCell>
                        </TableRow>
                        }
                    </TableHead>
                    <TableBody>
                    <ConnectionBoundary expectedNetwork={network}>
                        {paginatedRecords.map(
                            ({ id, flowOperator, allowance, permissions, flowRateAllowanceRemaining, token }) =>
                                <PermissionAndAllowancesRow
                                    key={id}
                                    network={network}
                                    address={flowOperator}
                                    token={token}
                                    tokenAllowance={allowance}
                                    flowOperatorPermissions={permissions}
                                    flowRateAllowance={flowRateAllowanceRemaining}
                                />
                        )}
                    </ConnectionBoundary>
                    </TableBody>
                </Table>
                <TablePagination
                    style={{
                        borderBottomLeftRadius: 50,
                        borderBottomRightRadius: 50
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={permissionAndAllowancesList.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage()}
                    onRowsPerPageChange={handleChangeRowsPerPage()}
                    sx={{
                        "> *": {
                            visibility:
                                permissionAndAllowancesList.length <= rowsPerPage
                                    ? "hidden"
                                    : "visible",
                        },
                    }}
                />
            </TableContainer>
    );
};

export default PermissionAndAllowancesTable;
