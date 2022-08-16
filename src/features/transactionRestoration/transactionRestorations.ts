import { FlowRateWei } from "../send/FlowRateInput";

export enum RestorationType {
  Downgrade = 1,
  Upgrade = 2,
  Approve = 3,
  SendStream = 4,
  ModifyStream = 5,
}

export const formRestorationOptions = {
  shouldValidate: false,
  shouldDirty: true,
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
  type: RestorationType.Upgrade;
}

export interface SuperTokenDowngradeRestoration extends WrappingRestoration {
  type: RestorationType.Downgrade;
}

interface UpsertStreamRestoration extends TransactionRestorationBase {
  version: 2;
  chainId: number;
  tokenAddress: string;
  receiverAddress: string;
  flowRate: FlowRateWei;
}

export interface SendStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.SendStream;
}

export interface ModifyStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.ModifyStream;
}

export type TransactionRestorations =
  | ApproveAllowanceRestoration
  | SuperTokenDowngradeRestoration
  | SuperTokenUpgradeRestoration
  | SendStreamRestoration
  | ModifyStreamRestoration;
