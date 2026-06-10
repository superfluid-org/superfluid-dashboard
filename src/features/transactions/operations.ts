import { Abi, Address, Hex, encodeFunctionData } from "viem";
import {
  OPERATION_TYPE,
  Operation,
  OperationType,
  prepareOperation,
} from "@sfpro/sdk/constant";
import { hostAbi, hostAddress } from "@sfpro/sdk/abi/core";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";

/**
 * Resolves a contract address from an sfpro-style `Record<chainId, address>` map,
 * with a runtime guard for chains the contract isn't deployed on (instead of a
 * blind `chainId as SupportedChainId` cast that would yield `undefined`).
 */
export function getContractAddress(
  addressMap: Partial<Record<number, Address>>,
  chainId: number,
  contractName: string
): Address {
  const address = addressMap[chainId];
  if (!address) {
    throw new Error(
      `No ${contractName} deployment for chain ${chainId}. The operation is not supported on this network.`
    );
  }
  return address;
}

/**
 * The contract-call fragment `useSuperfluidWriteContract` consumes
 * (spread into the write params alongside title/pendings).
 */
export interface WriteFragment {
  abi: Abi;
  address: Address;
  functionName: string;
  args: readonly unknown[];
}

/**
 * A batchable sub-operation paired with both its Host `batchCall` `Operation` encoding and
 * the standalone write it maps to. Mirrors the legacy sdk-core endpoints' behavior: a lone
 * operation executes directly (`host.callAgreement` / `host.callAppAction` / a plain call on
 * the target), and only >1 operations batch via Host `batchCall`.
 */
export interface SubOperation {
  title: TransactionTitle;
  operation: Operation;
  direct: WriteFragment;
}

/** Superfluid agreement call (CFA/GDA/IDA) — `SUPERFLUID_CALL_AGREEMENT` op. */
export function agreementCallSubOperation(params: {
  chainId: number;
  agreementAddress: Address;
  callData: Hex;
  userData?: Hex;
  title: TransactionTitle;
}): SubOperation {
  const userData = params.userData ?? "0x";
  return {
    title: params.title,
    operation: prepareOperation({
      operationType: OPERATION_TYPE.SUPERFLUID_CALL_AGREEMENT,
      target: params.agreementAddress,
      data: params.callData,
      userData,
    }),
    direct: {
      abi: hostAbi,
      address: getContractAddress(hostAddress, params.chainId, "Superfluid Host"),
      functionName: "callAgreement",
      args: [params.agreementAddress, params.callData, userData],
    },
  };
}

/** Super App action call (e.g. flow scheduler) — `CALL_APP_ACTION` op. */
export function appActionSubOperation(params: {
  chainId: number;
  appAddress: Address;
  callData: Hex;
  title: TransactionTitle;
}): SubOperation {
  return {
    title: params.title,
    operation: prepareOperation({
      operationType: OPERATION_TYPE.CALL_APP_ACTION,
      target: params.appAddress,
      data: params.callData,
    }),
    direct: {
      abi: hostAbi,
      address: getContractAddress(hostAddress, params.chainId, "Superfluid Host"),
      functionName: "callAppAction",
      args: [params.appAddress, params.callData],
    },
  };
}

/**
 * An operation whose standalone execution is a plain call on the target contract —
 * ERC20 approve/increaseAllowance ops (on super tokens) and ERC2771 forward calls
 * (e.g. vesting scheduler). `prepareOperation` strips the ERC20 selector for batching.
 */
export function contractCallSubOperation(params: {
  operationType: OperationType;
  target: Address;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
  title: TransactionTitle;
}): SubOperation {
  const callData = encodeFunctionData({
    abi: params.abi,
    functionName: params.functionName,
    args: params.args,
  } as Parameters<typeof encodeFunctionData>[0]);
  return {
    title: params.title,
    operation: prepareOperation({
      operationType: params.operationType,
      target: params.target,
      data: callData,
    }),
    direct: {
      abi: params.abi,
      address: params.target,
      functionName: params.functionName,
      args: params.args,
    },
  };
}

/**
 * Collapse sub-operations into the final write: a lone operation executes via its direct
 * call, multiple batch through Host `batchCall`. `forceBatch` routes even a lone operation
 * through `batchCall` (matching endpoints that always batched, e.g. vesting creation).
 */
export function subOperationsWriteFragment(
  chainId: number,
  subOperations: SubOperation[],
  options?: { forceBatch?: boolean }
): WriteFragment {
  if (subOperations.length === 0) {
    throw new Error("No operations to execute.");
  }
  if (subOperations.length === 1 && !options?.forceBatch) {
    return subOperations[0].direct;
  }
  return {
    abi: hostAbi,
    address: getContractAddress(hostAddress, chainId, "Superfluid Host"),
    functionName: "batchCall",
    args: [subOperations.map((x) => x.operation)],
  };
}
