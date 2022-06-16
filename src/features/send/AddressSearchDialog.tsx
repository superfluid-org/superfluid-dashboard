import CloseIcon from "@mui/icons-material/Close";
import {
  debounce,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { ethers } from "ethers";
import { FC, useEffect, useState } from "react";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { ensApi } from "../ens/ensApi.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import useSearchAddress from "../../hooks/useSearchAddress";
import { getAddress, isAddress } from "../../utils/memoizedEthersUtils";
import useAddressName from "../../hooks/useAddressName";

const LIST_ITEM_STYLE = { px: 3, minHeight: 68 };

interface AddressListItemProps {
  address: string;
  name?: string;
  dataCy: string;
  onClick: () => void;
}

const AddressListItem: FC<AddressListItemProps> = ({
  address,
  dataCy,
  onClick,
}) => {
  const { name, checksumHex } = useAddressName(address);
  return (
    <ListItemButton onClick={onClick} sx={LIST_ITEM_STYLE}>
      <ListItemAvatar>
        <AddressAvatar address={address} />
      </ListItemAvatar>
      <ListItemText
        data-cy={dataCy}
        primary={name || address}
        secondary={name && address}
      />
    </ListItemButton>
  );
};

export type AddressSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectAddress: (address: string) => void;
};

const AddressSearchDialog: FC<AddressSearchDialogProps> = ({
  open,
  onSelectAddress,
  onClose,
}) => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const [searchTermVisible, setSearchTermVisible] = useState("");
  const [searchTermDebounced, _setSearchTermDebounced] =
    useState(searchTermVisible);

  const [setSearchTermDebounced] = useState(() =>
    debounce((searchTerm) => {
      _setSearchTermDebounced(searchTerm);
    }, 250)
  );

  const setSearchTerm = (searchTerm: string) => {
    setSearchTermVisible(searchTerm);
    setSearchTermDebounced(searchTerm.trim());
  };

  const [openCounter, setOpenCounter] = useState(0);
  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTermVisible(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
      setSearchTermDebounced(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (isAddress(searchTermDebounced)) {
      onSelectAddress(getAddress(searchTermDebounced));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTermDebounced]);

  const { ensQuery } = useSearchAddress(searchTermDebounced);
  const ensData = ensQuery.data; // Put into separate variable because TS couldn't infer in the render function that `!!ensQuery.data` means that the data is not undefined nor null.
  const showEns = !!searchTermDebounced && !isAddress(searchTermDebounced);

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

  const searchSynced = searchTermDebounced === searchTermVisible;

  return (
    <ResponsiveDialog
      open={open}
      onClose={() => onClose()}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 500 } }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Select a recipient
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: theme.spacing(3),
            top: theme.spacing(3),
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          data-cy={"address-dialog-input"}
          fullWidth
          autoFocus
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Address or ENS"
          value={searchTermVisible}
        />
      </DialogTitle>

      <DialogContent dividers={!!showEns || !!showRecents} sx={{ p: 0 }}>
        <List sx={{ pt: 0 }}>
          {showEns ? (
            <>
              <ListSubheader sx={{ px: 3 }}>ENS</ListSubheader>
              {(ensQuery.isFetching || !searchSynced) && (
                <ListItem sx={LIST_ITEM_STYLE}>
                  <ListItemText primary="Loading..." />
                </ListItem>
              )}
              {ensQuery.isError && (
                <ListItem sx={LIST_ITEM_STYLE}>
                  <ListItemText primary="Error" />
                </ListItem>
              )}

              {!ensQuery.isLoading && !ensQuery.isFetching && searchSynced && (
                <>
                  {!!ensData ? (
                    <AddressListItem
                      dataCy={"ens-entry"}
                      address={ensData.address}
                      onClick={() => onSelectAddress(ensData.address)}
                    />
                  ) : (
                    <ListItem sx={LIST_ITEM_STYLE}>
                      <ListItemText primary="No results" />
                    </ListItem>
                  )}
                </>
              )}
            </>
          ) : showRecents ? (
            <>
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
            </>
          ) : null}
        </List>
      </DialogContent>
    </ResponsiveDialog>
  );
};

export default AddressSearchDialog;
