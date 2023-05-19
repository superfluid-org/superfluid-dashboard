import { ChangeEvent, FC, useMemo, useState } from "react";
import { useAccount } from "wagmi";
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
import { AccountAccessSettingsRecords } from "./DummyData";
import PermissionAndAllowancesRow from "./PermissionAndAllowancesRow";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";


const PermissionAndAllowances: FC = () => {
    const theme = useTheme();

    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const { address } = useAccount();

    const handleChangePage = () => (_e: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = () => (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(rowsPerPage);
        setPage(page);
    };

    if (!address) {
        return <NoWalletConnected />;
    }

    const paginatedRecords = useMemo(
        () =>
            AccountAccessSettingsRecords.slice(
                page * rowsPerPage,
                (page + 1) * rowsPerPage
            ),
        [page, rowsPerPage, AccountAccessSettingsRecords]
    );

    return (
        <ConnectionBoundary>
            <Paper>
                <Stack p={4} justifyContent="space-between">
                    <Stack>
                        <Stack direction="column" gap={1}>
                            <Typography component="h1" variant="h5">
                                Permissions & Allowances
                            </Typography>
                            <Typography variant="body1" color="secondary">
                                Manage your Permissions and Allowances in one place.
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
                <Divider />
                <TableContainer
                    // component={Paper}
                    sx={{
                        [theme.breakpoints.down("md")]: {
                            borderLeft: 0,
                            borderRight: 0,
                            borderRadius: 0,
                            boxShadow: "none",
                            mx: -2,
                            width: "auto",
                        },
                    }}
                >
                    <Table sx={{ tableLayout: "fixed" }}>
                        {!isBelowMd && (
                            <TableHead>
                                <TableRow>
                                    <TableCell width="120px" sx={{ pl: 5 }}>
                                        Asset
                                    </TableCell>
                                    <TableCell width="160px">Address</TableCell>
                                    <TableCell width="159px">ERC-20 Allowance</TableCell>
                                    <TableCell width="170px">Stream Permissions</TableCell>
                                    <TableCell width="240px">Stream Allowance</TableCell>
                                    <TableCell width="148px">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                        )}
                        <TableBody>
                            {paginatedRecords.map(
                                ({ id, flowOperator, allowance, permissions, flowRateAllowanceRemaining, token }) =>
                                    <PermissionAndAllowancesRow
                                        key={id}
                                        address={flowOperator}
                                        accessSettingsLoading={false}
                                        token={{
                                            address: token.id,
                                        }}
                                        tokenAllowance={allowance}
                                        flowOperatorPermissions={permissions}
                                        flowRateAllowance={flowRateAllowanceRemaining}
                                    />
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        style={{
                            borderBottomLeftRadius: 50,
                            borderBottomRightRadius: 50
                        }}
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={AccountAccessSettingsRecords.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage()}
                        onRowsPerPageChange={handleChangeRowsPerPage()}
                        sx={{
                            "> *": {
                                visibility:
                                    AccountAccessSettingsRecords.length <= rowsPerPage
                                        ? "hidden"
                                        : "visible",
                            },
                        }}
                    />
                </TableContainer>
            </Paper>
        </ConnectionBoundary>
    );
};

export default PermissionAndAllowances;
