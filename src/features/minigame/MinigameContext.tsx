import { PropsWithChildren, useEffect } from "react";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
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

/**
 * What the server renders. Must match `appSettings.slice`'s initialState, since
 * that is what the store holds before redux-persist rehydrates from
 * localStorage. Kept as a literal rather than imported to avoid a cycle —
 * the slice imports `MinigameCosmetics` from here.
 */
const SSR_COSMETICS: MinigameCosmetics = 1;

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

  // The URL is personalised from client-only state (persisted cosmetics, the
  // connected wallet), so rendering it directly makes the first client render
  // disagree with the server HTML and React logs a hydration mismatch on the
  // nav link's href. Render the server's values until after mount, then apply
  // the real ones.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const getUrl = useCallback(() => {
    const url = new URL(atob(G_A_M_E__U_R_L__B_A_S_E_6_4));

    url.searchParams.set(
      "level",
      (isMounted ? cosmetics : SSR_COSMETICS).toString()
    );

    if (isMounted && connectedAccountAddress) {
      url.searchParams.set("address", connectedAccountAddress.toString());
    }

    return url;
  }, [isMounted, cosmetics, connectedAccountAddress]);

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
