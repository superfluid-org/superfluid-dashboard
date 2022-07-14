import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { Chip, ChipProps, useMediaQuery, useTheme } from "@mui/material";
import { FC } from "react";
import AddressName from "../../components/AddressName/AddressName";
import { useImpersonation } from "./ImpersonationContext";

const ImpersonationChip: FC<ChipProps> = ({ ...props }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { isImpersonated, impersonatedAddress, stopImpersonation } =
    useImpersonation();

  return isImpersonated ? (
    <Chip
      data-cy={"view-mode-chip"}
      color="warning"
      size={isBelowMd ? "small" : "medium"}
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
