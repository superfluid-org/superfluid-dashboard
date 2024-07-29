import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Stack, Typography } from "@mui/material";
import { useAccount } from "wagmi";

import { FC } from "react";
import Link from "../common/Link";

const SimpleVestingHeader: FC = () => {
  const { address: accountAddress } = useAccount();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 4.5 }}
    >
      <Typography component="h1" variant="h4">
        Vesting
      </Typography>

      {accountAddress && (
        <Button
          LinkComponent={Link}
          href="/vesting/create"
          data-cy="create-schedule-button"
          color="primary"
          variant="contained"
          endIcon={<AddRoundedIcon />}
        >
          Create Vesting Schedule
        </Button>
      )}
    </Stack>
  );
};

export default SimpleVestingHeader;
