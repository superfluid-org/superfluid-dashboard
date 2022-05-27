import { Alert, Snackbar, SnackbarContent, Stack } from "@mui/material";
import Grow from "@mui/material/Grow";
import { TrackedTransaction } from "@superfluid-finance/sdk-redux";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useAppSelector } from "../redux/store";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import useAccountTransactions from "../wallet/useAccountTransactions";

export default function TransactionSnackbar() {
  const { transactionDrawerOpen } = useTransactionDrawerContext();

  const walletTransactions = useAccountTransactions();

  console.log({
    walletTransactions,
  });

  // const [newTransactions, setNewTransactions] = useState<TrackedTransaction[]>(
  //   []
  // );

  // const [processedTransactions, setProcessedTransactions] = useState<
  //   TrackedTransaction[]
  // >([]);

  // // eslint-disable-next-line
  // const addNewTransactions = (newTransactions: TrackedTransaction[]) => {
  //   setNewTransactions(newTransactions);
  //   setProcessedTransactions([...newTransactions, ...processedTransactions]);
  // };

  // // eslint-disable-next-line
  // const getDifferenceInTransactions = () => {
  //   return _.differenceWith(allTransactions, processedTransactions, _.isEqual);
  // };

  // useEffect(() => {
  //   addNewTransactions(getDifferenceInTransactions());
  // }, [allTransactions]); // eslint-disable-line

  // console.log({
  //   newTransactions,
  // });

  return (
    <>
      {/* {newTransactions
        .filter((tx) => tx.status === "Succeeded" || tx.status === "Failed")
        .map((tx) => (
          <Snackbar
            open={!transactionDrawerOpen}
            autoHideDuration={6000}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            TransitionComponent={Grow}
            sx={{
              "&.MuiSnackbar-root": {
                top: "80px",
              },
            }}
          >
            {tx.status === "Succeeded" ? (
              <Alert severity="success">Succeeded</Alert>
            ) : (
              <Alert severity="error">Failed</Alert>
            )}
          </Snackbar>
        ))} */}
    </>
  );
}
