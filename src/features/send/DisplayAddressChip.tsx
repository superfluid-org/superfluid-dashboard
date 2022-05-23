import {
  Avatar,
  Chip,
  ChipProps,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import Blockies from "react-blockies";
import shortenAddress from "../../utils/shortenAddress";
import { ensApi } from "../ens/ensApi.slice";

export type DisplayAddress = {
  hash: string;
  name?: string;
};

// TODO(KK): memo
const DisplayAddressChip: FC<{
  hash: string;
  name?: string;
  tryGetEns: boolean;
  ChipProps?: ChipProps;
}> = ({ hash, name: initialName, tryGetEns, ChipProps = {} }) => {
  // TOOD(KK): getAddress for nice hash?

  const ensQuery = ensApi.useLookupAddressQuery(tryGetEns ? hash : skipToken);

  const name = ensQuery.data?.name || initialName;

  const { sx: ChipSx = {} } = ChipProps;

  return (
    <Chip
      label={
        <Stack direction="row">
          {/* Read about the Blockies API here: https://github.com/stephensprinkle-zz/react-blockies */}
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar>
              <Avatar variant="rounded">
                <Blockies seed={hash} size={12} scale={3} />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={name || shortenAddress(hash)}
              secondary={name && shortenAddress(hash)}
              primaryTypographyProps={{ variant: "body1" }}
              secondaryTypographyProps={{ variant: "body2" }}
            />
          </ListItem>
        </Stack>
      }
      {...ChipProps}
      sx={{
        ".MuiChip-label": {
          flex: 1,
        },
        cursor: "pointer",
        ...ChipSx,
      }}
    ></Chip>
  );
};

export default DisplayAddressChip;
