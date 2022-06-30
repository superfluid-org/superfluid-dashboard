import { useMediaQuery, useTheme } from "@mui/material";
import { createContext, FC, useContext, useEffect, useState } from "react";

const LayoutContext = createContext<{
  transactionDrawerOpen: boolean;
  setTransactionDrawerOpen: (open: boolean) => void;
  navigationDrawerOpen: boolean;
  setNavigationDrawerOpen: (open: boolean) => void;
}>(undefined!);

export const LayoutContextProvider: FC = ({ children }) => {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("md"));

  const [transactionDrawerOpen, setTransactionDrawerOpen] = useState(false);
  const [navigationDrawerOpen, setNavigationDrawerOpen] = useState(!isPhone);

  useEffect(() => {
    setNavigationDrawerOpen(!isPhone);
  }, [isPhone]);

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
