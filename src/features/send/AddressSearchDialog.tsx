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
import { subgraphApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";

export type AddressSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectAddress: (address: { hash: string }) => void;
  ResponsiveDialogProps?: ResponsiveDialogProps;
};

const AddressSearchDialog: FC<AddressSearchDialogProps> = ({
  open,
  onSelectAddress,
  onClose,
  ...ResponsiveDialogProps
}) => {
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

  useEffect(() => {
    if (ethers.utils.isAddress(searchTermDebounced)) {
      onSelectAddress({ hash: searchTermDebounced });
    }
  }, [searchTermDebounced]);

  const ensQuery = subgraphApi.useEns1Query(
    searchTermDebounced
      ? {
          name: searchTermDebounced,
        }
      : skipToken
  );

  // useEffect(() => {
  //   if (ensQuery.data?.hash) {
  //     onSelectAddress({ hash: ensQuery.data.hash });
  //   }
  // }, [ensQuery]);

  const showEns =
    (ensQuery.isSuccess && !!ensQuery.data?.hash) || ensQuery.isLoading;

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
        <TextField autoFocus onChange={(e) => setSearchTerm(e.target.value)} placeholder="Address or ENS" />
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
                {!!ensQuery.data?.hash && (
                  <ListItem>
                    <ListItemButton onClick={() => onSelectAddress({
                      hash: ensQuery.data.hash
                    })}>
                      <ListItemText
                        primary={ensQuery.data.hash}
                        secondary={searchTermDebounced.toLowerCase()}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </>
            )}
          </List>
        ) : (
          <List>
            <ListItem>Index</ListItem>
          </List>
        )}
      </DialogContent>
    </ResponsiveDialog>
  );
};

export default AddressSearchDialog;
