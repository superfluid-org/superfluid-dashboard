import { Box, styled, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { FC } from "react";
import TransactionDrawer, {
  transactionDrawerWidth,
} from "../transactionDrawer/TransactionDrawer";
import { useLayoutContext } from "./LayoutContext";
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
  maxWidth: "100vw",
  padding: `${theme.spacing(5)} 0`,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  [theme.breakpoints.up("md")]: {
    ...(open && {
      marginRight: transactionDrawerWidth,
    }),
  },
  [theme.breakpoints.down("md")]: {
    padding: `${theme.spacing(3.5)} 0`,
  },
}));

const Layout: FC = ({ children }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { transactionDrawerOpen } = useLayoutContext();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", scrollY: "auto" }}>
      <TopBar />
      <NavigationDrawer />
      <Main open={transactionDrawerOpen}>
        {!isBelowMd && theme.palette.mode === "dark" && <DarkGlow />}
        <Toolbar />
        {/* <TransactionSnackbar /> */}
        {children}
      </Main>
      <TransactionDrawer />
    </Box>
  );
};

export default Layout;
