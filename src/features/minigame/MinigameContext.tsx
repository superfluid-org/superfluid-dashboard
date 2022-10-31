import { PropsWithChildren, useEffect } from "react";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAccount } from "wagmi";
import { useImpersonation } from "../impersonation/ImpersonationContext";

const G_A_M_E__U_R_L__B_A_S_E_6_4 =
  "aHR0cHM6Ly9hc3Ryb2J1bm55LnN1cGVyZmx1aWQuZmluYW5jZS8=";

type MinigameCosmetics = 0 | 1 | 2 | 3 | 4;
type MinigameContextValue = {
  setCosmetics: (value: MinigameCosmetics) => void;
  isAllowedToPlay: boolean;
  getUrl: () => URL;
};

const MinigameContext = createContext<MinigameContextValue>(null!);

export const MinigameProvider: FC<PropsWithChildren> = ({ children }) => {
  const [cosmetics, setCosmetics] = useState<MinigameCosmetics>(0);
  const { isImpersonated } = useImpersonation();

  const { isConnected, address: connectedAccountAddress } = useAccount();
  useEffect(() => {
    setCosmetics(0); // Reset level.
  }, [connectedAccountAddress]);

  const isAllowedToPlay = cosmetics >= 1 && !isImpersonated && isConnected;
  const getUrl = useCallback(() => {
    if (!isAllowedToPlay) {
      throw new Error("Player does not meet the requirements to play.");
    }

    const url = new URL(atob(G_A_M_E__U_R_L__B_A_S_E_6_4));
    if (cosmetics > 1 && cosmetics <= 4) {
      url.searchParams.set("level", cosmetics.toString());
    } else {
      url.searchParams.set("level", "1"); // Default to 1.
    }

    if (connectedAccountAddress) {
      url.searchParams.set("address", connectedAccountAddress.toString());
    }

    return url;
  }, [isAllowedToPlay, cosmetics, connectedAccountAddress]);

  const contextValue = useMemo<MinigameContextValue>(
    () => ({
      cosmetics,
      isAllowedToPlay,
      getUrl,
      setCosmetics: (value: MinigameCosmetics) =>
        value > cosmetics ? setCosmetics(value) : void 0,
    }),
    [cosmetics, setCosmetics, isAllowedToPlay, getUrl]
  );

  return (
    <MinigameContext.Provider value={contextValue}>
      {children}
    </MinigameContext.Provider>
  );
};

export const useMinigame = () => useContext(MinigameContext);
