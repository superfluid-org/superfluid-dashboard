import { Chip, ChipProps } from "@mui/material";
import { FC } from "react";
import shortenAddress from "../../utils/shortenAddress";
import { useImpersonation } from "./ImpersonationContext";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

const ImpersonationChip: FC<ChipProps> = ({ ...props }) => {
  const { isImpersonated, impersonatedAddress, stopImpersonation: stopImpersonation } =
    useImpersonation();

  return isImpersonated ? (
    <Chip
      data-cy={"view-mode-chip"}
      color="warning"
      size="medium"
      icon={<PersonSearchIcon />}
      label={"Viewing " + shortenAddress(impersonatedAddress!)}
      onDelete={stopImpersonation}
      {...props}
    />
  ) : null;
};

export default ImpersonationChip; 