import { Divider, Drawer, IconButton, styled, Typography } from "@mui/material";
import { memo } from "react";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import { useTransactionDrawerContext } from "./TransactionDrawerContext";
import TransactionList from "./TransactionList";
import CloseIcon from "@mui/icons-material/Close";
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
  const { transactionDrawerOpen, setTransactionDrawerOpen } =
    useTransactionDrawerContext();

  const closeDrawer = () => setTransactionDrawerOpen(false);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={transactionDrawerOpen}
      PaperProps={{ sx: { width: transactionDrawerWidth } }}
    >
      <DrawerHeader>
        <IconButton onClick={closeDrawer}>
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
