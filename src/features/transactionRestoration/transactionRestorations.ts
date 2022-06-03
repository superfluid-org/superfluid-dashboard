import { SuperTokenPair, UnderlyingToken, SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import {DisplayAddress} from "../send/DisplayAddressChip";
import {FlowRateWithTime} from "../send/FlowRateInput";

export enum RestorationType {
  Downgrade = 1,
  Upgrade = 2,
  Approve = 3,
  SendStream = 4,
  ModifyStream = 5
}

export interface TransactionRestoration {
  type: RestorationType;
}

export interface SuperTokenDowngradeRestoration extends TransactionRestoration {
  type: RestorationType.Downgrade;
  chainId: number;
  tokenUpgrade: SuperTokenPair;
  amountWei: string;
}

export interface SuperTokenUpgradeRestoration extends TransactionRestoration {
  type: RestorationType.Upgrade;
  chainId: number;
  tokenUpgrade: SuperTokenPair;
  amountWei: string;
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
  flowRate: FlowRateWithTime;
}

export interface SendStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.SendStream;
}

export interface ModifyStreamRestoration extends UpsertStreamRestoration {
  type: RestorationType.ModifyStream;
}