import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  SxProps,
  Table,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { FC } from "react";
import { ELEVATION1_BG } from "../theme/theme";

const PlaceholderActivityRow = () => (
  <TableRow sx={{ td: { backgroundImage: ELEVATION1_BG } }}>
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

interface PlaceholderActivityTableProps {
  sx?: SxProps;
}

const PlaceholderActivityTable: FC<PlaceholderActivityTableProps> = ({
  sx = {},
}) => (
  <TableContainer sx={sx}>
    <Table>
      <PlaceholderActivityRow />
    </Table>
  </TableContainer>
);

export default PlaceholderActivityTable;
