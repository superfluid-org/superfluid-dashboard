import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { useAccount } from "wagmi";

import { FC } from "react";

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
        <NextLink href="/vesting/create" passHref>
          <Button
            data-cy="create-schedule-button"
            color="primary"
            variant="contained"
            endIcon={<AddRoundedIcon />}
          >
            Create Vesting Schedule
          </Button>
        </NextLink>
      )}
    </Stack>
  );
};

export default SimpleVestingHeader;
