import {
  Avatar,
  Chip,
  ChipProps,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";
import { FC } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import useAddressName from "../../hooks/useAddressName";
import shortenHex from "../../utils/shortenHex";

// TODO(KK): memo
const DisplayAddressChip: FC<{
  address: string;
  ChipProps?: ChipProps;
}> = ({ address, ChipProps = {} }) => {
  const addressName = useAddressName(address);
  const { sx: ChipSx = {} } = ChipProps;

  return (
    <Chip
      label={
        <Stack direction="row">
          <ListItem sx={{ p: 0 }}>
            <ListItemAvatar>
              <AddressAvatar address={addressName.addressChecksummed} />
            </ListItemAvatar>
            <ListItemText
              primary={addressName.name || shortenHex(addressName.addressChecksummed)}
              secondary={
                addressName.name && shortenHex(addressName.addressChecksummed)
              }
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
