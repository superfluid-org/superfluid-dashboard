import { Box, styled, Toolbar } from "@mui/material";
import { FC } from "react";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import NavigationDrawer from "./NavigationDrawer";
import TransactionDrawer, {
  transactionDrawerWidth,
} from "../transactionDrawer/TransactionDrawer";
import TopBar from "./TopBar";
// import TransactionSnackbar from "../transactions/TransactionSnackbar";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -transactionDrawerWidth,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}));

const Layout: FC = ({ children }) => {
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <Box sx={{ display: "flex" }}>
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
