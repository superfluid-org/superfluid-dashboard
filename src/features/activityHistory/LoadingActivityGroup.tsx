import {
  Box,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import { FC, memo } from "react";

const LoadingActivityRow = () => (
  <TableRow>
    <TableCell>
      <ListItem sx={{ p: 0 }}>
        <ListItemAvatar>
          <Skeleton variant="circular" sx={{ width: "40px", height: "40px" }} />
        </ListItemAvatar>
        <ListItemText
          primary={<Skeleton width="120px" />}
          secondary={<Skeleton width="60px" />}
        />
      </ListItem>
    </TableCell>
    <TableCell>
      <ListItem sx={{ p: 0 }}>
        <ListItemAvatar>
          <Skeleton variant="circular" sx={{ width: "36px", height: "36px" }} />
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
  </TableRow>
);

interface LoadingActivityGroupProps {}

const LoadingActivityGroup: FC<LoadingActivityGroupProps> = ({}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        <Skeleton width="120px" />
      </Typography>
      <TableContainer>
        <Table>
          <TableBody>
            <LoadingActivityRow />
            <LoadingActivityRow />
            <LoadingActivityRow />
            <LoadingActivityRow />
            <LoadingActivityRow />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default memo(LoadingActivityGroup);
