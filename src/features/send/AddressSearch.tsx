import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Stack,
  styled,
} from "@mui/material";
import { memo, MouseEvent, useState } from "react";
import AddressSearchDialog from "../../components/AddressSearchDialog/AddressSearchDialog";
import AddressSearchIndex from "./AddressSearchIndex";
import DisplayAddressChip from "./DisplayAddressChip";

interface AddressButtonProps {
  hasAddress?: boolean;
}

const AddressButton = styled(Stack)<AddressButtonProps>(
  ({ hasAddress, theme }) => ({
    minHeight: 54,
    border: `1px solid ${theme.palette.other.outline}`,
    borderRadius: "10px",
    padding: `0 ${hasAddress ? theme.spacing(1.75) : 0}`,
    lineHeight: "54px",
    cursor: "pointer",
    color: hasAddress
      ? theme.palette.text.secondary
      : theme.palette.text.primary,
  })
);

export default memo(function AddressSearch({
  onChange,
  address,
  onBlur = () => {},
}: {
  address: string | null;
  onChange: (address: string | null) => void; // TODO(KK): better name
  onBlur?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onOpenDialog = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDialogOpen(true);
  };

  const onSelectAddress = (address: string) => {
    setDialogOpen(false);
    onChange(address);
    onBlur();
  };

  return (
    <>
      <AddressButton
        data-cy={"address-button"}
        hasAddress={!address}
        direction="row"
        alignItems={address ? "stretch" : "center"}
        justifyContent="space-between"
        onClick={onOpenDialog}
      >
        {address ? (
          <DisplayAddressChip
            address={address}
            ChipProps={{
              onDelete: () => onChange(null),
              sx: { flex: 1, background: "transparent" },
            }}
          />
        ) : (
          <>
            <span>Public Address or ENS</span>
            <KeyboardArrowDownIcon />
          </>
        )}
      </AddressButton>
      <AddressSearchDialog
        title={"Select a receiver"}
        index={<AddressSearchIndex onSelectAddress={onSelectAddress} />}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          onBlur();
        }}
        onSelectAddress={onSelectAddress}
      />
    </>
  );
});