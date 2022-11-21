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
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address, Stream } from "@superfluid-finance/sdk-core";
import {
  ChangeEvent,
  FC,
  FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useAccount } from "wagmi";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import useAddressName from "../../hooks/useAddressName";
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
  streamsLoading?: boolean;
  onSelect: (isSelected: boolean) => void;
}

const AddressBookRow: FC<AddressBookRowProps> = ({
  address,
  name = "",
  selected,
  selectable,
  streams,
  streamsLoading,
  onSelect,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();

  const { address: currentAccountAddress } = useAccount();

  const [editableName, setEditableName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { ensName } = useAddressName(address);

  const trimmedName = useMemo(() => editableName.trim(), [editableName]);

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditableName(event.target.value);
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

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    saveName();
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
            <AddressAvatar
              address={address}
              AvatarProps={{
                sx: { width: "27px", height: "27px" },
              }}
              BlockiesProps={{ size: 9, scale: 3 }}
            />

            {isEditing ? (
              <Box component="form" onSubmit={onFormSubmit}>
                <Input
                  data-cy={"edit-input"}
                  fullWidth
                  disableUnderline
                  autoFocus
                  value={editableName}
                  onChange={onNameChange}
                  sx={{ fontWeight: 500 }}
                  inputProps={{ sx: { p: 0 } }}
                />
              </Box>
            ) : (
              <Typography data-cy={"address-name"} variant="h6">
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
                      data-cy={"edit-button"}
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
                      data-cy={"cancel-editing-button"}
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
      <TableCell data-cy={"ens-name"}>{ensName || "-"}</TableCell>
      <TableCell data-cy={"actual-address"}>
        <AddressCopyTooltip address={address}>
          <span>{shortenHex(address, 6)}</span>
        </AddressCopyTooltip>
      </TableCell>
      <TableCell data-cy={"active-streams"}>
        {!!currentAccountAddress ? (
          <>
            {streamsLoading ? <Skeleton width="30px" /> : activeStreams.length}
          </>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        {selectable && (
          <Checkbox
            data-cy={"delete-name-checkbox"}
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
