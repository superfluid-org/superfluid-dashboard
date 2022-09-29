import { Address } from "@superfluid-finance/sdk-core";
import { useMemo } from "react";
import { useAppSelector } from "../redux/store";
import { accountFlagSelectors, Flag } from "./accountFlags.slice";

export const useAccountHasFlag = (flag: Flag, account?: Address) => {
  const accountFlags = useAppSelector((state) =>
    accountFlagSelectors.selectAll(state)
  );

  return useMemo(
    () =>
      Boolean(
        accountFlags.find(
          (accountFlag) =>
            account &&
            accountFlag.account === account &&
            accountFlag.flag === flag
        )
      ),
    [accountFlags, account, flag]
  );
};

export const useAccountHasChainFlag = (
  flag: Flag,
  chainId: number,
  account?: Address
) => {
  const accountFlags = useAppSelector((state) =>
    accountFlagSelectors.selectAll(state)
  );

  return useMemo(
    () =>
      Boolean(
        accountFlags.find(
          (accountFlag) =>
            account &&
            accountFlag.flag === flag &&
            accountFlag.chainId === chainId &&
            accountFlag.account.toLowerCase() === account.toLowerCase()
        )
      ),
    [accountFlags, flag, chainId, account]
  );
};
