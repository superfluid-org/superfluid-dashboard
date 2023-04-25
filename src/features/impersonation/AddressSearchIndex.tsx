import { List, ListSubheader } from "@mui/material";
import { memo } from "react";
import { useAppSelector } from "../redux/store";
import { impersonationSelectors } from "./impersonation.slice";
import {
  AddressListItem,
  AddressSearchDialogProps,
} from "../../components/AddressSearchDialog/AddressSearchDialog";

export default memo(function AddressSearchIndex({
  onSelectAddress,
}: Pick<AddressSearchDialogProps, "onSelectAddress">) {
  const recentImpersonations = useAppSelector((state) =>
    impersonationSelectors.selectAll(state.impersonations)
  );

  if (!recentImpersonations.length) {
    return null;
  }

  return (
    <List>
      <ListSubheader>Recently Viewed</ListSubheader>
      {recentImpersonations.map((impersonation) => (
        <AddressListItem
          key={impersonation.address}
          address={impersonation.address}
          onClick={() => onSelectAddress({ address: impersonation.address })}
        />
      ))}
    </List>
  );
});
