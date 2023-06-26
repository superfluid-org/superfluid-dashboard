import { useMediaQuery, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import {
  FC,
  MutableRefObject,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const LayoutContext = createContext<{
  transactionDrawerOpen: boolean;
  setTransactionDrawerOpen: (open: boolean) => void;
  navigationDrawerOpen: boolean;
  setNavigationDrawerOpen: (open: boolean) => void;
  previousRouterPathRef: MutableRefObject<string | null>;
}>(undefined!);

export const LayoutContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const router = useRouter();
  const previousRouterPathRef = useRef<string | null>(null);

  // When user navigates to a new page then enable automatic switching to user wallet's network again.
  useEffect(() => {
    const onRouteChange = (
      _fullPath: string,
      { shallow }: { shallow: boolean }
    ) => {
      if (!shallow) {
        previousRouterPathRef.current = router.asPath;
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
        previousRouterPathRef,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => useContext(LayoutContext);
