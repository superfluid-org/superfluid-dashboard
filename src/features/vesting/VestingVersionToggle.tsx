import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useVestingVersion } from "../../hooks/useVestingVersion";
import { Network } from "../network/networks";
import { VestingVersion } from "../network/networkConstants";

export function VestingVersionToggle(props: {
    network: Network
}) {
    const { network } = props;
    const { vestingVersion, setVestingVersion } = useVestingVersion();

    return (
        <ToggleButtonGroup
        size="small"
        color="primary"
        value={vestingVersion}
        exclusive
        onChange={(_e, value: VestingVersion) => {
          setVestingVersion({
            chainId: network.id,
            version: value
          });
        }}
      >
        <ToggleButton value="v1" data-cy="version-v1">&nbsp;V1&nbsp;</ToggleButton>
        {
          !!network.vestingContractAddress.v2 && (<ToggleButton value="v2" data-cy="version-v2">&nbsp;V2&nbsp;</ToggleButton>)
        }
        {
          !!network.vestingContractAddress.v3 && (<ToggleButton value="v3" data-cy="version-v3">&nbsp;V3&nbsp;</ToggleButton>)
        }
      </ToggleButtonGroup>
    )
}
