import { Chip, ChipProps } from "@mui/material";
import { FC } from "react";
import { useImpersonation } from "./ImpersonationContext";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import AddressName from "../../components/AddressName/AddressName";

const ImpersonationChip: FC<ChipProps> = ({ ...props }) => {
  const {
    isImpersonated,
    impersonatedAddress,
    stopImpersonation,
  } = useImpersonation();

  return isImpersonated ? (
    <Chip
      data-cy={"view-mode-chip"}
      color="warning"
      size="medium"
      icon={<PersonSearchIcon />}
      label={
        <>
          Viewing <AddressName address={impersonatedAddress!} />
        </>
      }
      onDelete={stopImpersonation}
      {...props}
    />
  ) : null;
};

export default ImpersonationChip;
