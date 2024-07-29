import { useAccount } from "wagmi";
import { useHasFlag } from "../features/flags/flagsHooks";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { Flag } from "../features/flags/flags.slice";
import { getAddress } from "../utils/memoizedEthersUtils";
import { useMemo } from "react";
import { Network } from "../features/network/networks";

export const useVestingVersion = (props?: { network?: Network }) => {
    const { network: expectedNetwork } = useExpectedNetwork();
    const network = props?.network ?? expectedNetwork;

    const { address: accountAddress } = useAccount();
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

    return useMemo(() => ({
        vestingVersion: hasVestingV2Enabled ? "v2" : "v1",
    } as const), [hasVestingV2Enabled]);
}