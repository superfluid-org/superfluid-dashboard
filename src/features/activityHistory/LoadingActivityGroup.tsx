import {
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, memo } from "react";

export const LoadingActivityRow = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow data-cy={"skeleton-row"}>
      <TableCell>
        <ListItem sx={{ p: 0 }}>
          <ListItemAvatar>
            <Skeleton
              variant="circular"
              sx={{ width: "40px", height: "40px" }}
            />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton width={isBelowMd ? "60px" : "120px"} />}
            secondary={<Skeleton width={isBelowMd ? "30px" : "60px"} />}
            primaryTypographyProps={{ variant: isBelowMd ? "h7" : "h6" }}
          />
        </ListItem>
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <Skeleton
                  variant="circular"
                  sx={{ width: "36px", height: "36px" }}
                />
              </ListItemAvatar>
              <ListItemText primary={<Skeleton width="100px" />} />
            </ListItem>
          </TableCell>
          <TableCell>
            <ListItem sx={{ p: 0 }}>
              <ListItemAvatar>
                <Skeleton
                  variant="rectangular"
                  sx={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton width="34px" />}
                secondary={<Skeleton width="120px" />}
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "h6" }}
              />
            </ListItem>
          </TableCell>
          <TableCell>
            <Skeleton
              variant="circular"
              sx={{
                width: "24px",
                height: "24px",
              }}
            />
          </TableCell>
        </>
      ) : (
        <TableCell align="right">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="end"
            gap={2}
          >
            <ListItemText
              primary={<Skeleton width="60px" />}
              secondary={<Skeleton width="40px" />}
              primaryTypographyProps={{ variant: "h7" }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "end",
              }}
            />
            <Skeleton
              variant="circular"
              sx={{
                width: "36px",
                height: "36px",
              }}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

interface LoadingActivityGroupProps {}

const LoadingActivityGroup: FC<LoadingActivityGroupProps> = ({}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box>
      <Typography variant={"h6"} sx={{ mb: 2 }}>
        <Skeleton width="120px" />
      </Typography>
      <TableContainer
        sx={{
          [theme.breakpoints.down("md")]: {
            mx: -2,
            width: "auto",
            borderRadius: 0,
            border: "none",
            borderBottom: `1px solid ${theme.palette.divider}`,
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
          },
        }}
      >
        <Table>
          <TableBody>
            <LoadingActivityRow />
            <LoadingActivityRow />
            <LoadingActivityRow />
            {!isBelowMd && (
              <>
                <LoadingActivityRow />
                <LoadingActivityRow />
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default memo(LoadingActivityGroup);
