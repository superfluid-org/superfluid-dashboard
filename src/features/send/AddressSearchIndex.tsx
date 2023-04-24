import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { memo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import {
  AddressListItem,
  AddressSearchDialogProps,
} from "../../components/AddressSearchDialog/AddressSearchDialog";
import { subgraphApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address } from "@superfluid-finance/sdk-core";

interface AddressSearchIndexProps {
  addresses?: Address[];
  onSelectAddress: AddressSearchDialogProps["onSelectAddress"];
  disabledAddresses?: Address[];
}

export default memo(function AddressSearchIndex({
  addresses = [],
  onSelectAddress,
  disabledAddresses = [],
}: AddressSearchIndexProps) {
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
            selected={addresses.includes(address)}
            key={address}
            address={address}
            onClick={() => onSelectAddress({ address })}
            disabled={disabledAddresses.includes(address)}
          />
        ))}
    </List>
  );
});
