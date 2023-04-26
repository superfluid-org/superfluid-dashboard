import {PropsWithChildren, useEffect} from "react";
import {
    createContext,
    FC,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import {useAccount} from "wagmi";
import {applySettings} from "../settings/appSettings.slice";
import {useDispatch} from "react-redux";
import {useAppLastSuperfluidRunnerCosmetics, useSetting} from "../settings/appSettingsHooks";

const G_A_M_E__U_R_L__B_A_S_E_6_4 =
    "aHR0cHM6Ly9hc3Ryb2J1bm55LnN1cGVyZmx1aWQuZmluYW5jZS8=";

type MinigameCosmetics = 1 | 2 | 3 | 4;

type MinigameContextValue = {
    setCosmetics: (value: MinigameCosmetics) => void;
    getUrl: () => URL;
};

const MinigameContext = createContext<MinigameContextValue>(null!);

export const MinigameProvider: FC<PropsWithChildren> = ({children}) => {
    const lastSuperfluidRunnerCosmetics = useAppLastSuperfluidRunnerCosmetics();
    const dispatch = useDispatch();

    const [cosmetics, setCosmetics] = useState<MinigameCosmetics>(lastSuperfluidRunnerCosmetics as MinigameCosmetics);

    const {address: connectedAccountAddress} = useAccount(); // Don't use "visible address" here.

    useEffect(() => {
        dispatch(applySettings({lastSuperfluidRunnerCosmetics: cosmetics}));
    }, [cosmetics])

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
            setCosmetics: (value: MinigameCosmetics) =>
                value > cosmetics ? setCosmetics(value) : void 0,
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
