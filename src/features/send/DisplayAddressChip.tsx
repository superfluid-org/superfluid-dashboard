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
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import shortenHex from "../../utils/shortenHex";
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
  const name = ensQuery.currentData?.name || initialName;

  const { sx: ChipSx = {} } = ChipProps;

  return (
    <Chip
      label={
        <Stack direction="row">
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar>
              <AddressAvatar address={hash} />
            </ListItemAvatar>
            <ListItemText
              primary={name || shortenHex(hash)}
              secondary={name && shortenHex(hash)}
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
