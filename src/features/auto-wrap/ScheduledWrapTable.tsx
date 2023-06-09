import {
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    colors,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { ChangeEvent, FC, memo, useEffect, useMemo, useState } from "react";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";
import { Network } from "../network/networks";
import { FetchingStatus } from "../tokenSnapshotTable/TokenSnapshotTables";
import { autoWrapSubgraphApi } from "../../auto-wrap-subgraph/autoWrapSubgraphApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import ScheduledWrapRow from "./ScheduledWrapRow";
import TooltipWithIcon from "../common/TooltipWithIcon";

interface TokenSnapshotTableProps {
    address: Address;
    network: Network;
    fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
}

const ScheduledWrapTable: FC<TokenSnapshotTableProps> = ({
    address,
    network,
    fetchingCallback,
}) => {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

    const [page, setPage] = useState({ wallet: 0, contract: 0 });
    const [rowsPerPage, setRowsPerPage] = useState({ wallet: 25, contract: 25 });

    const {
        wrapSchedules,
        isLoading,
    } = autoWrapSubgraphApi.useGetWrapSchedulesQuery(
        address
            ? {
                chainId: network.id,
                where: { account: address?.toLowerCase(), deletedAt: undefined },
                orderBy: "createdAt",
                orderDirection: "desc",
            }
            : skipToken,
        {
            refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
            selectFromResult: (result) => ({
                ...result,
                wrapSchedules: result.data?.wrapSchedules ?? [],
            }),
        }
    );

    const memonizedWrapSchedules = useMemo(
        () =>
            wrapSchedules,
        [wrapSchedules]
    );

    const paginatedWrapSchedules = useMemo(
        () =>
            memonizedWrapSchedules.slice(
                page.contract * rowsPerPage.contract,
                (page.contract + 1) * rowsPerPage.contract
            ),
        [page.contract, rowsPerPage, memonizedWrapSchedules]
    );


    useEffect(() => {
        fetchingCallback(network.id, {
            isLoading: isLoading,
            hasContent: !!wrapSchedules.length,
        });

    }, [
        network.id,
        isLoading,
        wrapSchedules.length,
        fetchingCallback,
    ]);


    const handleChangePage =
        (table: "schedules") => (_e: unknown, newPage: number) => {
            setPage((page) => ({ ...page, [table]: newPage }));
        };

    const handleChangeRowsPerPage =
        (table: "schedules") =>
            (event: ChangeEvent<HTMLInputElement>) => {
                setRowsPerPage((rowsPerPage) => ({
                    ...rowsPerPage,
                    [table]: parseInt(event.target.value, 10),
                }));
                setPage((page) => ({ ...page, address: 0 }));
            };

    if (
        !isLoading && wrapSchedules.length === 0
    )
        return null;

    return (
        <TableContainer
            data-cy={network.slugName + "-token-snapshot-table"}
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
                    <NetworkHeadingRow colSpan={5} network={network} />
                    {!isBelowMd && (
                        <TableRow>
                            <TableCell width="200">
                                <Stack
                                    direction="row"
                                    gap={0.5}
                                    alignItems="center"
                                >
                                    Asset
                                    <TooltipWithIcon title="No Info available." IconProps={
                                        {
                                            sx:{
                                                fontSize: "16px",
                                                color: colors.grey[700]
                                            }
                                        }
                                    } />
                                </Stack>
                            </TableCell>
                            <TableCell width="300">
                                <Stack
                                    direction="row"
                                    gap={0.5}
                                    alignItems="center"
                                >
                                    ERC-20 Allowance 
                                    <TooltipWithIcon title="No Info available." IconProps={
                                        {
                                            sx:{
                                                fontSize: "16px",
                                                color: colors.grey[700]
                                            }
                                        }
                                    }/>
                                </Stack></TableCell>
                            <TableCell width="300">
                            <Stack
                                direction="row"
                                gap={0.5}
                                alignItems="center"
                            >
                               Lower Limit
                                <TooltipWithIcon title="No Info available." IconProps={
                                        {
                                            sx:{
                                                fontSize: "16px",
                                                color: colors.grey[700]
                                            }
                                        }
                                    }/>
                            </Stack></TableCell>
                            <TableCell width="300">
                                <Stack
                                    direction="row"
                                    gap={0.5}
                                    alignItems="center"
                                >
                                    Upper Limit
                                    <TooltipWithIcon title="No Info available." IconProps={
                                        {
                                            sx:{
                                                fontSize: "16px",
                                                color: colors.grey[700]
                                            }
                                        }
                                    } />
                                </Stack>

                            </TableCell>
                            <TableCell width="200" align="center">Actions</TableCell>
                        </TableRow>
                    )}
                </TableHead>
                <TableBody>
                    {paginatedWrapSchedules.map((schedule, index) => (
                        <ScheduledWrapRow
                            key={schedule.id}
                            network={network}
                            schedule={schedule}
                            lastElement={memonizedWrapSchedules.length <= index + 1}
                        />
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={memonizedWrapSchedules.length}
                rowsPerPage={rowsPerPage.wallet}
                page={page.wallet}
                onPageChange={handleChangePage("schedules")}
                onRowsPerPageChange={handleChangeRowsPerPage("schedules")}
                sx={{
                    "> *": {
                        visibility:
                            memonizedWrapSchedules.length <= rowsPerPage.wallet
                                ? "hidden"
                                : "visible",
                    },
                }}
            />
        </TableContainer>
    );
};

export default memo(ScheduledWrapTable);
