import { FlowRateWei } from "../send/FlowRateInput";

export enum RestorationType {
  Unwrap = 1,
  Wrap = 2,
  Approve = 3,
  SendStream = 4,
  ModifyStream = 5,
  SendTransfer = 6,
}

export const formRestorationOptions = {
  shouldValidate: false,
  shouldDirty: false,
  shouldTouch: true,
};

export interface TransactionRestorationBase {
  type: RestorationType;
  version?: number;
}

interface WrappingRestoration extends TransactionRestorationBase {
  version: 2;
  chainId: number;
  tokenPair: {
    superTokenAddress: string;
    underlyingTokenAddress: string;
  };
  amountWei: string;
}

export interface ApproveAllowanceRestoration
  extends TransactionRestorationBase {
  type: RestorationType.Approve;
  chainId: number;
  tokenAddress: string;
  amountWei: string;
}

export interface SuperTokenUpgradeRestoration extends WrappingRestoration {
  type: RestorationType.Wrap;
}

export interface SuperTokenDowngradeRestoration extends WrappingRestoration {
  type: RestorationType.Unwrap;
}

interface UpsertStreamRestoration extends TransactionRestorationBase {
  version: 2;
  chainId: number;
  tokenAddress: string;
  receiverAddress: string;
  flowRate: FlowRateWei;
  endTimestamp?: number;
}

export interface SendStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.SendStream;
}

export interface ModifyStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.ModifyStream;
}

export interface SendTransferRestoration extends TransactionRestorationBase {
  type: RestorationType.SendTransfer;
  chainId: number;
  tokenAddress: string;
  receiverAddress: string;
  amountEther: string;
}

export type TransactionRestorations =
  | ApproveAllowanceRestoration
  | SuperTokenDowngradeRestoration
  | SuperTokenUpgradeRestoration
  | SendStreamRestoration
  | ModifyStreamRestoration
  | SendTransferRestoration;
