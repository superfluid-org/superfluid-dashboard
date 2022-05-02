import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useNetworkContext } from "../features/network/NetworkContext";
import { useAppSelector } from "../features/redux/store";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { TransactionRestorations, RestorationType } from "../features/transactionRestoration/transactionRestorations";

const RestoreTransaction: NextPage = () => {
  const { network, setNetwork } = useNetworkContext();
  const router = useRouter();
  const { hash } = router.query;

  const transaction = useAppSelector((state) =>
    isString(hash)
      ? transactionTrackerSelectors.selectById(state, hash as string)
      : undefined
  );
  const { restore } = useTransactionRestorationContext();

  useEffect(() => {
    if (transaction && transaction.chainId !== network.chainId) {
      setNetwork(transaction.chainId);
    }

    const transactionRestoration = transaction?.extraData
      ?.restoration as TransactionRestorations;

    if (transactionRestoration) {
      switch (transactionRestoration.type) {
        case RestorationType.Upgrade:
          router
            .replace("/wrap?upgrade")
            .then(() => restore(transactionRestoration));
          break;
        case RestorationType.Downgrade:
          router
            .replace("/wrap?downgrade")
            .then(() => restore(transactionRestoration));
          break;
        default:
          router.replace("/");
      }
    }
  }, [transaction]);

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default RestoreTransaction;
