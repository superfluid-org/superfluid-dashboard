import { useAccount } from "wagmi";
import { useHasFlag } from "../features/flags/flagsHooks";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { Flag, setVestingSchedulerFlag } from "../features/flags/flags.slice";
import { getAddress } from "../utils/memoizedEthersUtils";
import { useCallback, useMemo } from "react";
import { Network } from "../features/network/networks";
import { useDispatch } from "react-redux";
import { VestingVersion } from "../features/network/networkConstants";

export const useVestingVersion = (props?: { network?: Network }) => {
    const { network: expectedNetwork } = useExpectedNetwork();
    const network = props?.network ?? expectedNetwork;

    const { address: accountAddress } = useAccount();

    const flagAddress = getAddress(accountAddress ?? "0x0000000000000000000000000000000000000000") // Use zero address as key when wallet not connected.

    const hasVestingV2Enabled = useHasFlag({
        type: Flag.VestingScheduler,
        chainId: network.id,
        account: flagAddress,
        version: "v2"
    });

    const hasVestingV3Enabled = useHasFlag({
        type: Flag.VestingScheduler,
        chainId: network.id,
        account: flagAddress,
        version: "v3"
    });
    
    const dispatch = useDispatch();
    const setVestingVersion = useCallback((input:
        {
            chainId: number,
            version: VestingVersion
        }
    ) => {
        dispatch(setVestingSchedulerFlag({
            account: getAddress(flagAddress),
            chainId: input.chainId,
            version: input.version
        }));
    }, [dispatch, flagAddress]);

    return useMemo(() => ({
        vestingVersion: hasVestingV3Enabled ? "v3" : hasVestingV2Enabled ? "v2" : "v1",
        setVestingVersion,
    } as const), [hasVestingV2Enabled, hasVestingV3Enabled, setVestingVersion]);
}