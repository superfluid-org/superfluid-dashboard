import CancelIcon from "@mui/icons-material/Cancel";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditIcon from "@mui/icons-material/Edit";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import {
  Box,
  Checkbox,
  IconButton,
  Input,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Address, Stream } from "@superfluid-finance/sdk-core";
import { ChangeEvent, FC, useCallback, useMemo, useState } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import shortenHex from "../../utils/shortenHex";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { useAppDispatch } from "../redux/store";
import { updateAddressBookEntry } from "./addressBook.slice";

interface AddressBookRowProps {
  address: Address;
  name?: string;
  selected?: boolean;
  selectable?: boolean;
  streams: Stream[];
  onSelect: (isSelected: boolean) => void;
}

const AddressBookRow: FC<AddressBookRowProps> = ({
  address,
  name = "",
  selected,
  selectable,
  streams,
  onSelect,
}) => {
  const dispatch = useAppDispatch();

  const [editableName, setEditableName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const trimmedName = useMemo(() => editableName.trim(), [editableName]);

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditableName(event.target.value.replace(".eth", ""));
  };

  const saveName = useCallback(() => {
    dispatch(
      updateAddressBookEntry({ id: address, changes: { name: trimmedName } })
    );

    setIsEditing(false);
  }, [trimmedName, address, dispatch]);

  const startEditing = () => setIsEditing(true);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditableName(name);
  }, [name]);

  const onMouseEnter = () => setIsHovering(true);
  const onMouseLeave = () => setIsHovering(false);

  const onSelectedChange = (_event: unknown, selected: boolean) => {
    onSelect(selected);
  };

  const activeStreams = useMemo(
    () => streams.filter((stream) => stream.currentFlowRate !== "0"),
    [streams]
  );

  return (
    <TableRow onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <TableCell>
        <Stack direction="row">
          <Stack direction="row" alignItems="center" gap={1.5}>
            <AddressAvatar address={address} />

            {isEditing ? (
              <Input
                fullWidth
                disableUnderline
                autoFocus
                value={editableName}
                onChange={onNameChange}
                sx={{ fontWeight: 500 }}
                inputProps={{ sx: { p: 0 }, maxLength: 24 }}
              />
            ) : (
              <Typography variant="h6">
                <AddressName address={address} />
              </Typography>
            )}

            {(isEditing || isHovering) && (
              <>
                <Tooltip
                  placement="top"
                  disableInteractive
                  title={isEditing ? "Save new name" : "Update name"}
                >
                  <Box sx={{ ...(!isEditing && { mr: "38px" }) }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={isEditing ? saveName : startEditing}
                    >
                      {isEditing ? <CheckRoundedIcon /> : <EditIcon />}
                    </IconButton>
                  </Box>
                </Tooltip>

                {isEditing && (
                  <Tooltip
                    placement="top"
                    disableInteractive
                    title={"Cancel editing"}
                  >
                    <IconButton
                      size="small"
                      color="error"
                      onClick={cancelEditing}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </TableCell>
      <TableCell>
        <AddressCopyTooltip address={address}>
          <span>{shortenHex(address, 8)}</span>
        </AddressCopyTooltip>
      </TableCell>
      <TableCell>{activeStreams.length}</TableCell>
      <TableCell>
        {selectable && (
          <Checkbox
            checked={selected}
            color="error"
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<IndeterminateCheckBoxIcon />}
            onChange={onSelectedChange}
            sx={{ p: 1, m: -1 }}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export default AddressBookRow;
