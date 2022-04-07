import { List } from "@mui/material";
import { transactionSelectors } from "@superfluid-finance/sdk-redux";
import { FC } from "react";
import { useWalletContext } from "../../contexts/WalletContext";
import { useAppSelector } from "../../redux/store";
import TransactionListItem from "./TransactionListItem";

const TransactionList: FC = () => {
  const { walletAddress } = useWalletContext();

  const transactions = useAppSelector((state) =>
    transactionSelectors.selectAll(state.superfluid_transactions).filter(x => x.from === walletAddress)
  );

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {transactions.map((transaction) => (
        <TransactionListItem
          key={transaction.hash}
          transaction={transaction}
        ></TransactionListItem>
      ))}
    </List>
  );
};

export default TransactionList;
