import {
  Divider,
  Drawer,
  IconButton,
  styled,
  SwipeableDrawer,
  Typography,
  useTheme,
} from "@mui/material";
import { memo, useCallback } from "react";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import { useLayoutContext } from "../layout/LayoutContext";
import TransactionList from "./TransactionList";
import CloseIcon from "@mui/icons-material/Close";
import useMediaBreakpoints from "../../hooks/useMediaBreakpoints";
import { useAccount } from "wagmi";
export const transactionDrawerWidth = 340;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  justifyContent: "flex-start",
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export default memo(function TransactionDrawer() {
  const theme = useTheme();
  const { isPhone } = useMediaBreakpoints();
  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useLayoutContext();

  const openDrawer = () => setTransactionDrawerOpen(true);
  const closeDrawer = () => setTransactionDrawerOpen(false);

  return (
    <SwipeableDrawer
      variant={isPhone ? "temporary" : "persistent"}
      anchor="right"
      open={transactionDrawerOpen}
      disableDiscovery={true}
      disableSwipeToOpen={true}
      transitionDuration={theme.transitions.duration.standard}
      SlideProps={{
        easing: theme.transitions.easing.easeInOut,
      }}
      PaperProps={{
        sx: {
          width: transactionDrawerWidth,
          borderRight: 0,
          borderTop: 0,
          borderBottom: 0,
        },
      }}
      onOpen={openDrawer}
      onClose={closeDrawer}
    >
      <DrawerHeader>
        <IconButton color="inherit" onClick={closeDrawer}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" sx={{ m: 1 }}>
          Activity
        </Typography>
      </DrawerHeader>

      <Divider />

      <ReduxPersistGate>
        <TransactionList />
      </ReduxPersistGate>
    </SwipeableDrawer>
  );
});
