import { DEFAULT_OPTIONS } from "./constants";
import { Address, BatchFile, BatchTransaction, Options } from "./types";
import { addChecksum } from "./utils";

export default class TxBuilder {

  // TODO: Do I need the safe address?
  static batch = (
    safe: Address | undefined,
    transactions_: BatchTransaction[],
    options: Options = {}
  ): BatchFile =>
    {
      const transactions = transactions_.map(tx => ({
        ...tx,
        value: tx.value ?? "0",
        data: tx.data ?? null,
      }));

      return addChecksum({
        version: "1.0",
        chainId: options.chainId?.toString() ?? "1",
        createdAt: options.createdAt ?? Date.now(),
        meta: {
          name: options.name ?? DEFAULT_OPTIONS.name,
          description: options.description ?? DEFAULT_OPTIONS.description,
          txBuilderVersion: options.txBuilderVersion ?? DEFAULT_OPTIONS.txBuilderVersion,
          ...(safe ? { createdFromSafeAddress: safe, createdFromOwnerAddress: "" } : {}),
        },
        transactions,
      });
    };
}
