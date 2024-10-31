import { Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, useTheme } from "@mui/material";
import { memo, useMemo, useState } from "react";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import AddressName from "../../../components/AddressName/AddressName";
import AddressAvatar from "../../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../../common/AddressCopyTooltip";

export const BatchReceiversTable = memo(function ReceiversTable(props: {
    token: SuperTokenMinimal | null | undefined,
    schedules: {
        receiverAddress: string;
        totalAmountEther: string;
    }[];
}) {
    const { schedules, token } = props;

    const theme = useTheme();

    // # Paging stuff
    // TODO: We copy-paste the pagination logic around a lot...
    const minPageLength = 5;
    const [rowsPerPage, setRowsPerPage] = useState(minPageLength);
    const [page, setPage] = useState(0);
    const schedulesPage = useMemo(() =>
        schedules.slice(page * rowsPerPage, (page + 1) * rowsPerPage), [schedules, page, rowsPerPage]);

    const handleChangePage = (_e: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newRowsPerPage = rowsPerPage === -1 ? schedules.length : parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };
    // ---

    return (
        <TableContainer
            component={Paper}
            sx={{
                    mx: -1,
                    width: "auto",
                    borderRadius: 0,
                    border: "none",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    boxShadow: "none",
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell width="64px">Nr</TableCell>
                        <TableCell>Receiver</TableCell>
                        <TableCell>Allocation</TableCell>
                    </TableRow>
                </TableHead>

                {/* The Meaty Part */}
                <TableBody>
                    {schedulesPage.map((schedule, index) => (
                        <TableRow key={index}>
                            <TableCell width="64px">{index + 1}</TableCell>
                            <TableCell>
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <AddressAvatar
                                        address={schedule.receiverAddress}
                                        AvatarProps={{
                                            sx: { width: "24px", height: "24px", borderRadius: "5px" },
                                        }}
                                        BlockiesProps={{ size: 8, scale: 3 }}
                                    />
                                    <AddressCopyTooltip address={schedule.receiverAddress}>
                                        <Typography data-cy={"sender-receiver-address"} variant="h7">
                                            <AddressName address={schedule.receiverAddress} />
                                        </Typography>
                                    </AddressCopyTooltip>
                                </Stack>
                            </TableCell>
                            <TableCell>{schedule.totalAmountEther}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                {/* --- */}
            </Table>

            {/*  # Pagination */}
            {schedules.length > minPageLength && (
                <TablePagination
                    rowsPerPageOptions={[minPageLength, 10, 25, { value: schedules.length, label: 'All' }]}
                    component="div"
                    count={schedules.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        "> *": {
                            visibility:
                                schedules.length <= minPageLength ? "hidden" : "visible",
                        },
                    }}
                />
            )}
            {/* --- */}

        </TableContainer>
    )
});