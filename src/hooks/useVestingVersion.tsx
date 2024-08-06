import { Address, useAccount } from "wagmi";
import { useHasFlag } from "../features/flags/flagsHooks";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { Flag, setVestingSchedulerFlag } from "../features/flags/flags.slice";
import { getAddress } from "../utils/memoizedEthersUtils";
import { useCallback, useMemo } from "react";
import { Network } from "../features/network/networks";
import { useDispatch } from "react-redux";

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

    const dispatch = useDispatch();
    const setVestingVersion = useCallback((input:
        {
            chainId: number,
            version: "v1" | "v2"
        }
    ) => {
        if (accountAddress) {
            dispatch(setVestingSchedulerFlag({
                account: getAddress(accountAddress),
                chainId: input.chainId,
                version: input.version
            }));
        }
    }, [dispatch, accountAddress]);

    return useMemo(() => ({
        vestingVersion: hasVestingV2Enabled ? "v2" : "v1",
        setVestingVersion,
    } as const), [hasVestingV2Enabled]);
}