import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Stack, styled } from "@mui/material";
import { memo, MouseEvent, useState } from "react";
import AddressSearchDialog from "./AddressSearchDialog";
import DisplayAddressChip, { DisplayAddress } from "./DisplayAddressChip";

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
}: {
  address: DisplayAddress | undefined;
  onChange: (address: DisplayAddress | undefined) => void; // TODO(KK): better name19
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onOpenDialog = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDialogOpen(true);
  };

  return (
    <>
      <AddressButton
        hasAddress={!address}
        direction="row"
        alignItems={address ? "stretch" : "center"}
        justifyContent="space-between"
        onClick={onOpenDialog}
      >
        {address ? (
          <DisplayAddressChip
            hash={address.hash}
            name={address.name}
            tryGetEns={false}
            ChipProps={{
              onDelete: () => onChange(undefined),
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelectAddress={(address) => {
          setDialogOpen(false);
          onChange(address);
        }}
      />
    </>
  );
});
