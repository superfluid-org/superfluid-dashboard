import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useAccount } from "wagmi";

import { FC } from "react";
import Link from "../common/Link";
import { useHasFlag } from "../flags/flagsHooks";
import { Flag, setVestingSchedulerFlag } from "../flags/flags.slice";
import { networkDefinition } from "../network/networks";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { useDispatch } from "react-redux";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

const SimpleVestingHeader: FC = () => {
  const { address: accountAddress } = useAccount();
  const { network } = useExpectedNetwork();
  const dispatch = useDispatch();

  const hasVestingV2Enabled = useHasFlag(
    accountAddress
      ? {
        type: Flag.VestingScheduler,
        chainId: network.id,
        account: getAddress(accountAddress),
        version: "v2"
      }
      : undefined
  );

  const showVestingToggle = !!accountAddress && !!network.vestingContractAddress_v2;

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

      <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={3}>
        {
          showVestingToggle && (
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={hasVestingV2Enabled ? "v2" : "v1"}
              exclusive
              onChange={(_e, value) => {
                dispatch(setVestingSchedulerFlag({
                  account: getAddress(accountAddress),
                  chainId: network.id,
                  version: value
                }));
              }}
            >
              <ToggleButton value="v1">&nbsp;V1&nbsp;</ToggleButton>
              <ToggleButton value="v2">V2 (BETA)</ToggleButton>
            </ToggleButtonGroup>
          )
        }

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
    </Stack>
  );
};

export default SimpleVestingHeader;
