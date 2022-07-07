import {
  Divider,
  Drawer,
  IconButton,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import { memo } from "react";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import { useLayoutContext } from "../layout/LayoutContext";
import TransactionList from "./TransactionList";
import CloseIcon from "@mui/icons-material/Close";
import useMediaBreakpoints from "../../hooks/useMediaBreakpoints";
export const transactionDrawerWidth = 340;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export default memo(function TransactionDrawer() {
  const theme = useTheme();
  const { isPhone } = useMediaBreakpoints();
  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useLayoutContext();

  const closeDrawer = () => setTransactionDrawerOpen(false);

  return (
    <Drawer
      variant={isPhone ? "temporary" : "persistent"}
      anchor="right"
      open={transactionDrawerOpen}
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
    </Drawer>
  );
});
