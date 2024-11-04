import { SHA3 } from "sha3";
import { AbiFunction, Address } from "viem";
import { Network } from "../../network/networks";

export type Transaction = {
  to: Address;
  value: string;
  data: unknown;
  contractMethod: AbiFunction;
  contractInputsValues: {
    [key: string]: string;
  };
};

export type SafeTxBuilderInput = {
  version: string;
  chainId: string;
  createdAt: string;
  meta: {
    name: string;
    description: string;
    txBuilderVersion: "1.16.1";
    createdFromSafeAddress: Address | "";
    createdFromOwnerAddress: Address | "";
    checksum: string;
  };
  transactions: Transaction[];
};

const serializeJSONObject = (json: unknown): string => {
  const stringifyReplacer = (_: string, value: any) =>
    value === undefined ? null : value;

  if (Array.isArray(json)) {
    return `[${json.map((el) => serializeJSONObject(el)).join(",")}]`;
  }

  if (typeof json === "object" && json !== null) {
    let acc = "";
    const keys = Object.keys(json).sort();
    acc += `{${JSON.stringify(keys, stringifyReplacer)}`;

    for (let i = 0; i < keys.length; i++) {
      acc += `${serializeJSONObject((json as Record<string, unknown>)[keys[i]])},`;
    }

    return `${acc}}`;
  }

  return `${JSON.stringify(json, stringifyReplacer)}`;
};

export const calculateChecksum = (batchFile: SafeTxBuilderInput): string => {
  const serialized = serializeJSONObject({
    ...batchFile,
    meta: { ...batchFile.meta, name: null },
  });
  const sha = `0x${new SHA3(256).update(serialized).digest("hex")}`;

  return sha;
};

export const getDefaultSafeTxBuilderInput = (
  network: Network
): SafeTxBuilderInput => ({
  version: "1.0",
  chainId: network.id.toString(),
  createdAt: Date.now().toString(),
  meta: {
    name: "Superfluid VestingScheduler Transactions Batch",
    description: "Batch of transactions to create Superfluid VestingSchedules",
    txBuilderVersion: "1.16.1",
    createdFromSafeAddress: "",
    createdFromOwnerAddress: "",
    checksum: "",
  },
  transactions: [],
});

export const pipe = <T extends any[], R>(
    fn1: (...args: T) => R,
    ...fns: Array<(a: R) => R>
  ) => {
    const piped = fns.reduce(
      (prevFn, nextFn) => (value: R) => nextFn(prevFn(value)),
      (value) => value
    );
    return (...args: T) => piped(fn1(...args));
  };