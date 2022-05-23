import { Box, styled, Toolbar, useTheme } from "@mui/material";
import { FC } from "react";
import TransactionDrawer, {
  transactionDrawerWidth,
} from "../transactionDrawer/TransactionDrawer";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import NavigationDrawer from "./NavigationDrawer";
import TopBar from "./TopBar";
// import TransactionSnackbar from "../transactions/TransactionSnackbar";

const DarkGlow = styled("div")({
  position: "fixed",
  top: "50%",
  left: "50%",
  width: "200px",
  height: "80vh",
  zIndex: -1,
  background: `linear-gradient(180deg, rgba(16, 187, 53, 0.4) 0%, rgba(16, 187, 53, 0.2) 100%)`,
  filter: "blur(500px)",
  transform: "translate(-50%, -50%) rotate(30deg)",
  transformOrigin: "center",
});

const Main = styled("main")<{
  open: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: `${theme.spacing(5)} ${theme.spacing(8)}`,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  ...(open && {
    marginRight: transactionDrawerWidth,
  }),
}));

const Layout: FC = ({ children }) => {
  const theme = useTheme();
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", scrollY: "auto" }}>
      <TopBar />
      <NavigationDrawer />
      <Main open={transactionDrawerOpen}>
        {theme.palette.mode === "dark" && <DarkGlow />}
        <Toolbar />
        {/* <TransactionSnackbar /> */}
        {children}
      </Main>
      <TransactionDrawer />
    </Box>
  );
};

export default Layout;
