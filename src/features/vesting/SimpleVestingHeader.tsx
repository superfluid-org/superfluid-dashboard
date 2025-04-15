import { Button, Stack, Typography } from "@mui/material";
import { useAccount } from "wagmi";

import { FC } from "react";
import Link from "../common/Link";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

const SimpleVestingHeader: FC = () => {
  const { address: accountAddress } = useAccount();
  const { network } = useExpectedNetwork();

  const doesNetworkSupportBatchVesting = !!network.vestingContractAddress.v2;

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

      <Stack direction="row" gap={1}>
        <Button
          LinkComponent={Link}
          href="/vesting/agora"
          data-cy="agora-link-button"
          color="primary"
          variant="outlined"
        >
          Agora
        </Button>

        {accountAddress && (
          <Button
            LinkComponent={Link}
            href="/vesting/create"
            data-cy="create-schedule-button"
            color="primary"
            variant="contained"
          >
            Create Vesting Schedule
          </Button>
        )}

        {
          accountAddress && doesNetworkSupportBatchVesting && (
            <Button
              LinkComponent={Link}
              href="/vesting/batch-create"
              data-cy="create-batch-schedule-button"
              color="primary"
              variant="contained"
            >
              Create Batch of Vesting Schedules
            </Button>
          )
        }
      </Stack>
    </Stack>
  );
};

export default SimpleVestingHeader;
