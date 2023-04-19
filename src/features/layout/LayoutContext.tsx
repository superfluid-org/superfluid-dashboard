import { useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const LayoutContext = createContext<{
  transactionDrawerOpen: boolean;
  setTransactionDrawerOpen: (open: boolean) => void;
  navigationDrawerOpen: boolean;
  setNavigationDrawerOpen: (open: boolean) => void;
  previousRouterPath: string | null;
}>(undefined!);

export const LayoutContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const router = useRouter();
  const [previousRouterPath, setPreviousRouterPath] = useState<string | null>(
    null
  );

  // When user navigates to a new page then enable automatic switching to user wallet's network again.
  useEffect(() => {
    const onRouteChange = (
      _fullPath: string,
      { shallow }: { shallow: boolean }
    ) => {
      if (!shallow) {
        setPreviousRouterPath(router.asPath);
      }
    };
    router.events.on("routeChangeStart", onRouteChange);
    return () => router.events.off("routeChangeStart", onRouteChange);
  }, [router]);

  const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);
  const [navigationDrawerOpen, setNavigationDrawerOpen] = useState(
    !isSmallScreen
  );

  useEffect(() => {
    setNavigationDrawerOpen(!isSmallScreen);
  }, [isSmallScreen]);

  return (
    <LayoutContext.Provider
      value={{
        transactionDrawerOpen,
        setTransactionDrawerOpen,
        navigationDrawerOpen,
        setNavigationDrawerOpen,
        previousRouterPath,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => useContext(LayoutContext);
