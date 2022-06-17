import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
  styled,
} from "@mui/material";
import { FC, memo, MouseEvent, useState } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AddressSearchDialog, {
  AddressListItem,
  AddressSearchDialogProps,
} from "../../components/AddressSearchDialog/AddressSearchDialog";
import DisplayAddressChip from "./DisplayAddressChip";
import { subgraphApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";

export default memo(function AddressSearchIndex({
  onSelectAddress,
}: Pick<AddressSearchDialogProps, "onSelectAddress">) {
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const {
    currentData: recents,
    data: _discard,
    ...recentsQuery
  } = subgraphApi.useRecentsQuery(
    visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
        }
      : skipToken
  );

  const showRecents =
    (visibleAddress && recentsQuery.isSuccess && recents?.length) ||
    recentsQuery.isLoading;

  if (!showRecents) {
    return null;
  }

  return (
    <List>
      <ListSubheader sx={{ px: 3 }}>Recents</ListSubheader>
      {recentsQuery.isLoading && (
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Loading..." />
          </ListItemButton>
        </ListItem>
      )}
      {recentsQuery.isError && (
        <ListItem>
          <ListItemButton>
            <ListItemText primary="Error" />
          </ListItemButton>
        </ListItem>
      )}
      {!!recents &&
        recents.map((address) => (
          <AddressListItem
            dataCy={"recents-entry"}
            key={address}
            address={address}
            onClick={() => onSelectAddress(address)}
          />
        ))}
    </List>
  );
});
