import { useMediaQuery, TableRow, TableCell, Stack, Skeleton, Typography, useTheme } from "@mui/material";

export const PoolMemberRowLoading = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    if (isMobile) {
        return (
            <TableRow>
                <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Skeleton
                            variant="circular"
                            width={24}
                            height={24}
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
            </TableRow>
        )
    } else {
        return (
            <TableRow>
                <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Skeleton
                            variant="circular"
                            width={24}
                            height={24}
                            sx={{ borderRadius: "10px" }}
                        />
                    </Stack>
                </TableCell>
                <TableCell>
                    <Stack>
                        <Skeleton />
                    </Stack>
                </TableCell>
                <TableCell>
                    <Stack>
                        <Skeleton />
                    </Stack>
                </TableCell>
                <TableCell>
                    <Stack>
                        <Skeleton />
                    </Stack>
                </TableCell>
                <TableCell></TableCell>
            </TableRow>
        )
    }
};