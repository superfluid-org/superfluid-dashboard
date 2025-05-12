import { PropsWithChildren, useEffect } from "react";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useAccount } from "@/hooks/useAccount"
import { applySettings } from "../settings/appSettings.slice";
import { useDispatch } from "react-redux";
import {
  useAppLastSuperfluidRunnerCosmetics,
} from "../settings/appSettingsHooks";

const G_A_M_E__U_R_L__B_A_S_E_6_4 =
  "aHR0cHM6Ly9hc3Ryb2J1bm55LnN1cGVyZmx1aWQuZmluYW5jZS8=";

export type MinigameCosmetics = 1 | 2 | 3 | 4;

type MinigameContextValue = {
  cosmetics: MinigameCosmetics;
  setCosmetics: (value: MinigameCosmetics) => void;
  getUrl: () => URL;
};

const MinigameContext = createContext<MinigameContextValue>(null!);

export const MinigameProvider: FC<PropsWithChildren> = ({ children }) => {
  const cosmetics = useAppLastSuperfluidRunnerCosmetics();
  const dispatch = useDispatch();

  const { address: connectedAccountAddress } = useAccount(); // Don't use "visible address" here.

  const setCosmetics = useCallback(
    (cosmetics: MinigameCosmetics) =>
      void dispatch(
        applySettings({ lastSuperfluidRunnerCosmetics: cosmetics })
      ),
    [cosmetics, dispatch]
  );

  const getUrl = useCallback(() => {
    const url = new URL(atob(G_A_M_E__U_R_L__B_A_S_E_6_4));

    url.searchParams.set("level", cosmetics.toString());

    if (connectedAccountAddress) {
      url.searchParams.set("address", connectedAccountAddress.toString());
    }

    return url;
  }, [cosmetics, connectedAccountAddress]);

  const contextValue = useMemo<MinigameContextValue>(
    () => ({
      cosmetics,
      getUrl,
      setCosmetics,
    }),
    [cosmetics, setCosmetics, getUrl]
  );

  return (
    <MinigameContext.Provider value={contextValue}>
      {children}
    </MinigameContext.Provider>
  );
};

export const useMinigame = () => useContext(MinigameContext);
