import { TableRow, TableCell, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FC } from "react";
import NetworkIcon from "../../features/network/NetworkIcon";
import { Network } from "../../features/network/networks";

interface NetworkHeadingRowProps {
  network: Network;
  colSpan: number;
}

const NetworkHeadingRow: FC<NetworkHeadingRowProps> = ({
  network,
  colSpan,
}) => {
  const theme = useTheme();

  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{
          p: 0,
          [theme.breakpoints.up("md")]: { border: "none" },
          [theme.breakpoints.down("md")]: { p: 0 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={2}
          sx={{ py: 2, px: 4, [theme.breakpoints.down("md")]: { p: 2 } }}
        >
          <NetworkIcon network={network} />
          <Typography
            data-cy="network-name"
            variant="h5"
            color="text.primary"
            translate="no"
          >
            {network.name}
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

export default NetworkHeadingRow;
