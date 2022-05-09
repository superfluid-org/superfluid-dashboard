import { Box, styled, Toolbar } from "@mui/material";
import { FC } from "react";
import TransactionDrawer, {
  transactionDrawerWidth,
} from "../transactionDrawer/TransactionDrawer";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import NavigationDrawer from "./NavigationDrawer";
import TopBar from "./TopBar";
// import TransactionSnackbar from "../transactions/TransactionSnackbar";

const Main = styled("main")<{
  open: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: `${theme.spacing(5)} ${theme.spacing(8)}`,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // marginRight: open ? -transactionDrawerWidth : 0,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: transactionDrawerWidth,
  }),
}));

const Layout: FC = ({ children }) => {
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", scrollY: "auto" }}>
      <TopBar />
      <NavigationDrawer />
      <Main open={transactionDrawerOpen}>
        <Toolbar />
        {/* <TransactionSnackbar /> */}
        {children}
      </Main>
      <TransactionDrawer />
    </Box>
  );
};

export default Layout;
