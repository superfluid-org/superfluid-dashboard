import {
  SuperTokenMinimal,
} from "../redux/endpoints/tokenTypes";
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

export interface TransactionRestoration {
  type: RestorationType;
  version?: number;
}

interface WrappingRestoration extends TransactionRestoration {
  version: 2;
  chainId: number;
  tokenPair: {
    superTokenAddress: string;
    underlyingTokenAddress: string;
  };
  amountWei: string;
}

export interface SuperTokenDowngradeRestoration extends WrappingRestoration {
  type: RestorationType.Downgrade;
}

export interface SuperTokenUpgradeRestoration extends WrappingRestoration {
  type: RestorationType.Upgrade;
}

export interface ApproveAllowanceRestoration extends TransactionRestoration {
  type: RestorationType.Approve;
  chainId: number;
  tokenAddress: string;
  amountWei: string;
}

interface UpsertStreamRestoration extends TransactionRestoration {
  chainId: number;
  token: SuperTokenMinimal;
  receiver: string;
  flowRate: FlowRateWei;
}

export interface SendStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.SendStream;
}

export interface ModifyStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.ModifyStream;
}
