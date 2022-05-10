import {
  debounce,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import ResponsiveDialog, {
  ResponsiveDialogProps,
} from "../common/ResponsiveDialog";
import CloseIcon from "@mui/icons-material/Close";
import { ethers } from "ethers";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { ensApi } from "../ens/ensApi.slice";
import { subgraphApi } from "../redux/store";
import { useWalletContext } from "../wallet/WalletContext";
import { useNetworkContext } from "../network/NetworkContext";
import {DisplayAddress} from "./DisplayAddressChip";

export type AddressSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectAddress: (address: DisplayAddress) => void;
  ResponsiveDialogProps?: ResponsiveDialogProps;
};

const AddressSearchDialog: FC<AddressSearchDialogProps> = ({
  open,
  onSelectAddress,
  onClose,
  ...ResponsiveDialogProps
}) => {
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
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
    if (ethers.utils.isAddress(searchTermDebounced)) {
      onSelectAddress({ hash: ethers.utils.getAddress(searchTermDebounced) });
    }
  }, [searchTermDebounced]);

  const ensQuery = ensApi.useResolveNameQuery(
    searchTermDebounced ? searchTermDebounced : skipToken
  );
  const ensData = ensQuery.data; // Put into separate variable because TS couldn't infer in the render function that `!!ensQuery.data` means that the data is not undefined nor null.
  const showEns = (ensQuery.isSuccess && !!ensQuery.data) || ensQuery.isLoading;

  const recentsQuery = subgraphApi.useRecentsQuery(
    walletAddress
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
        }
      : skipToken
  );
  const recentsData = recentsQuery.data; // Put into separate variable because TS couldn't infer in the render function that `!!ensQuery.data` means that the data is not undefined nor null.
  const showRecents =
    (walletAddress && recentsQuery.isSuccess && recentsQuery.data?.length) ||
    recentsQuery.isLoading;

  return (
    <ResponsiveDialog
      open={open}
      onClose={() => onClose()}
      {...(ResponsiveDialogProps ?? {})}
    >
      <DialogTitle>
        <Typography>Receiver</Typography>
        <IconButton
          aria-label="close"
          onClick={() => onClose()}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (t) => t.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          fullWidth
          autoFocus
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Address or ENS"
          value={searchTermVisible}
        />
      </DialogTitle>
      <DialogContent dividers>
        {searchTermDebounced ? (
          <List>
            {showEns && (
              <>
                <ListSubheader>ENS</ListSubheader>
                {ensQuery.isLoading && (
                  <ListItem>
                    <ListItemButton>
                      <ListItemText primary="Loading..." />
                    </ListItemButton>
                  </ListItem>
                )}
                {ensQuery.isError && (
                  <ListItem>
                    <ListItemButton>
                      <ListItemText primary="Error" />
                    </ListItemButton>
                  </ListItem>
                )}
                {!!ensData && (
                  <ListItem>
                    <ListItemButton
                      onClick={() =>
                        onSelectAddress({
                          hash: ensData.address,
                          name: ensData.name,
                        })
                      }
                    >
                      <ListItemText
                        primary={ensData.address}
                        secondary={ensData.name}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </>
            )}
          </List>
        ) : showRecents ? (
          <>
            <ListSubheader>Recents</ListSubheader>
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
            {!!recentsData &&
              recentsData.map((addressHash) => (
                <ListItem key={addressHash}>
                  <ListItemButton
                    onClick={() =>
                      onSelectAddress({
                        hash: addressHash,
                      })
                    }
                  >
                    <ListItemText primary={addressHash} />
                  </ListItemButton>
                </ListItem>
              ))}
          </>
        ) : null}
      </DialogContent>
    </ResponsiveDialog>
  );
};

export default AddressSearchDialog;
