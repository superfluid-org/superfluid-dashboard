import { useCallback } from "react";
import { OPERATION_TYPE } from "@sfpro/sdk/constant";
import { cfaAbi, cfaAddress } from "@sfpro/sdk/abi/core";
import { superTokenAbi } from "@sfpro/sdk/abi";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { Address, encodeFunctionData } from "viem";
import { ViemFeeOverrides } from "../../utils/ethersOverridesToViem";
import {
  SubOperation,
  agreementCallSubOperation,
  contractCallSubOperation,
  getContractAddress,
  subOperationsWriteFragment,
} from "../transactions/operations";
import { useSuperfluidWriteContract } from "../transactions/useSuperfluidWriteContract";

type TokenAccess = {
  flowRateAllowanceWei: string;
  flowOperatorPermissions: number;
  tokenAllowanceWei: string; // Note: no need to account for decimals because 18 always for Super Tokens.
};

interface UpdateAccessArgs {
  chainId: number;
  superTokenAddress: string;
  operatorAddress: string;
  initialAccess: TokenAccess;
  editedAccess: TokenAccess;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

interface RevokeAccessArgs {
  chainId: number;
  superTokenAddress: string;
  operatorAddress: string;
  initialAccess: TokenAccess;
  transactionExtraData?: Record<string, unknown>;
  overrides?: ViemFeeOverrides;
  simulate?: boolean;
}

const tokenAllowanceSubOperation = (
  superTokenAddress: string,
  operatorAddress: string,
  amountWei: string,
  title: TransactionTitle
): SubOperation =>
  contractCallSubOperation({
    operationType: OPERATION_TYPE.ERC20_APPROVE,
    target: superTokenAddress as Address,
    abi: superTokenAbi,
    functionName: "approve",
    args: [operatorAddress as Address, BigInt(amountWei)],
    title,
  });

/**
 * Update flow operator permissions / flow-rate allowance and the ERC-20 ("token") allowance
 * of an operator for a super token. Drop-in replacement for
 * `rpcApi.useUpdateAccessMutation()` — returns `[trigger, result]`.
 */
export function useUpdateAccess() {
  const { write, result } = useSuperfluidWriteContract();

  const updateAccess = useCallback(
    (arg: UpdateAccessArgs) =>
      // Op-building runs inside the builder so failures (e.g. no changes,
      // unsupported chain) surface through `result` (dialog).
      write(() => {
      const subOperations: SubOperation[] = [];

      const flowRateAllowanceChanged =
        BigInt(arg.initialAccess.flowRateAllowanceWei) !==
        BigInt(arg.editedAccess.flowRateAllowanceWei);
      const permissionsChanged =
        arg.editedAccess.flowOperatorPermissions !==
        arg.initialAccess.flowOperatorPermissions;

      if (flowRateAllowanceChanged || permissionsChanged) {
        subOperations.push(
          agreementCallSubOperation({
            chainId: arg.chainId,
            agreementAddress: getContractAddress(
              cfaAddress,
              arg.chainId,
              "CFAv1"
            ),
            callData: encodeFunctionData({
              abi: cfaAbi,
              functionName: "updateFlowOperatorPermissions",
              args: [
                arg.superTokenAddress as Address,
                arg.operatorAddress as Address,
                arg.editedAccess.flowOperatorPermissions,
                BigInt(arg.editedAccess.flowRateAllowanceWei),
                "0x",
              ],
            }),
            title: "Update Flow Operator Permissions",
          })
        );
      }

      const tokenAllowanceChanged =
        BigInt(arg.initialAccess.tokenAllowanceWei) !==
        BigInt(arg.editedAccess.tokenAllowanceWei);

      if (tokenAllowanceChanged) {
        subOperations.push(
          tokenAllowanceSubOperation(
            arg.superTokenAddress,
            arg.operatorAddress,
            arg.editedAccess.tokenAllowanceWei,
            "Update Token Allowance"
          )
        );
      }

      return {
        chainId: arg.chainId,
        ...subOperationsWriteFragment(arg.chainId, subOperations),
        title: "Modify Permissions & Allowances" as const,
        subTransactionTitles: subOperations.map((x) => x.title),
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
      };
      }),
    [write]
  );

  return [updateAccess, result] as const;
}

/**
 * Revoke all permissions and allowances of an operator for a super token. Drop-in
 * replacement for `rpcApi.useRevokeAccessMutation()` — returns `[trigger, result]`.
 */
export function useRevokeAccess() {
  const { write, result } = useSuperfluidWriteContract();

  const revokeAccess = useCallback(
    (arg: RevokeAccessArgs) =>
      write(() => {
      const subOperations: SubOperation[] = [];

      if (
        BigInt(arg.initialAccess.flowRateAllowanceWei) !== 0n ||
        arg.initialAccess.flowOperatorPermissions > 0
      ) {
        subOperations.push(
          agreementCallSubOperation({
            chainId: arg.chainId,
            agreementAddress: getContractAddress(
              cfaAddress,
              arg.chainId,
              "CFAv1"
            ),
            callData: encodeFunctionData({
              abi: cfaAbi,
              functionName: "revokeFlowOperatorWithFullControl",
              args: [
                arg.superTokenAddress as Address,
                arg.operatorAddress as Address,
                "0x",
              ],
            }),
            title: "Revoke Flow Operator",
          })
        );
      }

      if (BigInt(arg.initialAccess.tokenAllowanceWei) !== 0n) {
        subOperations.push(
          tokenAllowanceSubOperation(
            arg.superTokenAddress,
            arg.operatorAddress,
            "0",
            "Revoke Token Allowance"
          )
        );
      }

      return {
        chainId: arg.chainId,
        ...subOperationsWriteFragment(arg.chainId, subOperations),
        title: "Revoke Access" as const,
        subTransactionTitles: subOperations.map((x) => x.title),
        extraData: arg.transactionExtraData,
        overrides: arg.overrides,
        simulate: arg.simulate,
      };
      }),
    [write]
  );

  return [revokeAccess, result] as const;
}
