import {
  Drawer,
  styled,
} from "@mui/material";
import { memo } from "react";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import { useTransactionDrawerContext } from "./TransactionDrawerContext";
import TransactionList from "./TransactionList";

export const transactionDrawerWidth = 420;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

export default memo(function TransactionDrawer() {
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <Drawer
      sx={{
        width: transactionDrawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: transactionDrawerWidth,
        },
      }}
      variant="persistent"
      anchor="right"
      open={transactionDrawerOpen}
    >
      <DrawerHeader>
        {/* <Typography variant="body1" sx={{ m: 1 }}>
          Notifications
        </Typography> */}
      </DrawerHeader>
      {/* <Divider /> */}
      <ReduxPersistGate>
        <TransactionList></TransactionList>
      </ReduxPersistGate>
    </Drawer>
  );
})
