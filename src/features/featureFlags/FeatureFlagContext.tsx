import { isString, isUndefined } from "lodash";
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
} from "../flags/flags.slice";
import { useMainnetEnabled, useVestingEnabled } from "../flags/flagsHooks";
import { useAppDispatch } from "../redux/store";

const FeatureFlagContext = createContext<FeatureFlagContextValue>(null!);

interface FeatureFlagContextValue {
  isVestingEnabled: boolean;
  isMainnetEnabled: boolean;
}

export const VESTING_FEATURE_CODES = [
  "98S_VEST",
  "V923_TokenOps",
  "V754_Seliqui",
  "V910_Bertrand",
  "162VM_Aragon",
  "7L5G_Ricochet",
  "727TH_GRAPH",
];

export const MAINNET_FEATURE_CODES = [
  "AHR2_MAINNET",
  "724ZX_ENS",
  "462T_MINERVA",
  "916G_TOKENOPS",
  "162VM_Aragon",
  "727TH_GRAPH",
];

// TODO: (M) IMO we do not need a separate provider for this, just a features selector hook for flags feature.
// We could just create a HOC component to manage "code" query params.
export const FeatureFlagProvider: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isVestingEnabled = useVestingEnabled();
  const isMainnetEnabled = useMainnetEnabled();

  useEffect(() => {
    if (router.isReady) {
      const { code, ...query } = router.query;

      if (isString(code)) {
        const enableVesting =
          !isVestingEnabled && VESTING_FEATURE_CODES.includes(code);

        const enableMainnet =
          !isMainnetEnabled && MAINNET_FEATURE_CODES.includes(code);

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
