import { isUndefined } from "lodash";
import { useRouter } from "next/router";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { enableVestingFeature, Flag } from "../flags/flags.slice";
import { useHasFlag } from "../flags/flagsHooks";
import { useAppDispatch } from "../redux/store";

const FeatureFlagContext = createContext<FeatureFlagContextValue>(null!);

interface FeatureFlagContextValue {
  isVestingEnabled: boolean;
}

export const FeatureFlagProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isVestingEnabled = useHasFlag({
    id: Flag.VestingFeature,
    type: Flag.VestingFeature,
  });

  useEffect(() => {
    if (router.isReady) {
      const { enable_experimental_vesting_feature, ...query } = router.query;

      if (!isUndefined(enable_experimental_vesting_feature)) {
        if (!isVestingEnabled) {
          dispatch(enableVestingFeature());
        }
        router.replace(
          {
            query,
          },
          undefined,
          {
            shallow: true,
          }
        );
      }
    }
  }, [router.isReady]);

  const contextValue = useMemo<FeatureFlagContextValue>(
    () => ({
      isVestingEnabled,
    }),
    [isVestingEnabled]
  );

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);
