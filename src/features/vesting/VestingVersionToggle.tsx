import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useVestingVersion } from "../../hooks/useVestingVersion";
import { Network } from "../network/networks";

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
        onChange={(_e, value: "v1" | "v2") => {
          setVestingVersion({
            chainId: network.id,
            version: value
          });
        }}
      >
        <ToggleButton value="v1" data-cy="version-v1">&nbsp;V1&nbsp;</ToggleButton>
        <ToggleButton value="v2" data-cy="version-v2">&nbsp;V2&nbsp;</ToggleButton>
      </ToggleButtonGroup>
    )
}
