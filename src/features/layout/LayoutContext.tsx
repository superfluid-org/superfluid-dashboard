import { useMediaQuery, useTheme } from "@mui/material";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

const LayoutContext = createContext<{
  transactionDrawerOpen: boolean;
  setTransactionDrawerOpen: (open: boolean) => void;
  navigationDrawerOpen: boolean;
  setNavigationDrawerOpen: (open: boolean) => void;
}>(undefined!);

export const LayoutContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

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
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => useContext(LayoutContext);
