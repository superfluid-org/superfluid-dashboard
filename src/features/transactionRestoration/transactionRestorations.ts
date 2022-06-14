import { SuperTokenPair, UnderlyingToken, SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import {DisplayAddress} from "../send/DisplayAddressChip";
import {FlowRateWei} from "../send/FlowRateInput";

export enum RestorationType {
  Downgrade = 1,
  Upgrade = 2,
  Approve = 3,
  SendStream = 4,
  ModifyStream = 5
}

export const formRestorationOptions = {
  shouldValidate: false,
  shouldDirty: true,
  shouldTouch: true,
}

export interface TransactionRestoration {
  type: RestorationType;
}

interface WrappingRestoration extends TransactionRestoration{
  chainId: number;
  tokenUpgrade: SuperTokenPair;
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
  token: UnderlyingToken;
  amountWei: string;
}

interface UpsertStreamRestoration extends TransactionRestoration {
  chainId: number;
  token: SuperTokenMinimal;
  receiver: DisplayAddress;
  flowRate: FlowRateWei;
}

export interface SendStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.SendStream;
}

export interface ModifyStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.ModifyStream;
}