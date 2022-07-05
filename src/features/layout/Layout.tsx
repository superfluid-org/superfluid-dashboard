import { Box, styled, Toolbar, useTheme } from "@mui/material";
import { FC } from "react";
import IntercomButton from "../intercom/IntercomButton";
import TransactionDrawer, {
  transactionDrawerWidth,
} from "../transactionDrawer/TransactionDrawer";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import NavigationDrawer from "./NavigationDrawer";
import TopBar from "./TopBar";

// import TransactionSnackbar from "../transactions/TransactionSnackbar";

const DarkGlow = styled("div")({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  zIndex: -1,
  background: `radial-gradient(ellipse at 55% 40%, rgba(16, 187, 53, 0.1) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 100%) `,
  transform: "rotate(-30deg)",
  transformOrigin: "center center",
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
      <IntercomButton />
      <TransactionDrawer />
    </Box>
  );
};

export default Layout;
