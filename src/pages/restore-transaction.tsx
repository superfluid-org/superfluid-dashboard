import { transactionTrackerSelectors } from "@superfluid-finance/sdk-redux";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { useAppSelector } from "../features/redux/store";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import {
  TransactionRestoration,
  RestorationType,
} from "../features/transactionRestoration/transactionRestorations";

const RestoreTransaction: NextPage = () => {
  const { network, setExpectedNetwork } = useExpectedNetwork();
  const router = useRouter();
  const { hash } = router.query;

  const transaction = useAppSelector((state) =>
    isString(hash)
      ? transactionTrackerSelectors.selectById(state, hash as string)
      : undefined
  );
  const { restore } = useTransactionRestorationContext();

  useEffect(() => {
    if (transaction && transaction.chainId !== network.id) {
      setExpectedNetwork(transaction.chainId);
    }

    const transactionRestoration = transaction?.extraData
      ?.restoration as TransactionRestoration;

    if (transactionRestoration) {
      switch (transactionRestoration.type) {
        case RestorationType.Upgrade:
          router.replace("/wrap?upgrade");
          restore(transactionRestoration);
          break;
        case RestorationType.Downgrade:
          restore(transactionRestoration);
          router.replace("/wrap?downgrade");
          break;
        case RestorationType.SendStream:
          restore(transactionRestoration);
          router.replace("/send");
          break;
        default:
          router.replace("/");
      }
    }
  }, [transaction, setExpectedNetwork, network, router, restore]);

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default RestoreTransaction;
