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

const MINIGAME_BASE_URL =
  "https://superfluid-runner.netlify.app/";

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

    const url = new URL(MINIGAME_BASE_URL);
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
