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
import {
  enableMainnetFeature,
  enableVestingFeature,
  Flag,
} from "../flags/flags.slice";
import { useHasFlag } from "../flags/flagsHooks";
import { useAppDispatch } from "../redux/store";

const FeatureFlagContext = createContext<FeatureFlagContextValue>(null!);

interface FeatureFlagContextValue {
  isVestingEnabled: boolean;
  isMainnetEnabled: boolean;
}

const MAINNET_FEATURE_CODE = "724ZX_ENS";

export const FeatureFlagProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isVestingEnabled = useHasFlag({
    id: Flag.VestingFeature,
    type: Flag.VestingFeature,
  });

  const isMainnetEnabled = useHasFlag({
    type: Flag.MainnetFeature,
  });

  useEffect(() => {
    if (router.isReady) {
      const { enable_experimental_vesting_feature, code, ...query } =
        router.query;

      const enableVesting =
        !isUndefined(enable_experimental_vesting_feature) && !isVestingEnabled;

      const enableMainnet = code === MAINNET_FEATURE_CODE && !isMainnetEnabled;

      if (enableVesting) dispatch(enableVestingFeature());
      if (enableMainnet) dispatch(enableMainnetFeature());

      if (enableVesting || enableMainnet) {
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
      isMainnetEnabled,
    }),
    [isVestingEnabled, isMainnetEnabled]
  );

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);
