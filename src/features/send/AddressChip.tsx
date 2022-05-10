import { Chip, ChipProps, Stack, Typography } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { ensApi } from "../ens/ensApi.slice";
import Blockies from "react-blockies";

// TODO(KK): memo
const AddressChip: FC<{
  hash: string;
  name?: string;
  tryGetEns: boolean;
  ChipProps?: ChipProps;
}> = ({ hash, name: initialName, tryGetEns, ChipProps = {} }) => {
  // TOOD(KK): getAddress for nice hash?

  const ensQuery = ensApi.useLookupAddressQuery(tryGetEns ? hash : skipToken);

  const name = ensQuery.data?.name || initialName;

  return (
    <Chip
      label={
        <Stack direction="row">
          { /* Read about the Blockies API here: https://github.com/stephensprinkle-zz/react-blockies */ }
          <Blockies seed={hash} />
          {name ? (
            <Stack direction="column">
              <Typography variant="body1">{name}</Typography>
              <Typography variant="body2">{hash}</Typography>
            </Stack>
          ) : (
            <Typography variant="body1">{hash}</Typography>
          )}
        </Stack>
      }
      {...ChipProps}
    ></Chip>
  );
};

export default AddressChip;
