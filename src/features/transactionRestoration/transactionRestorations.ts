import {  SuperTokenPair, UnderlyingToken, SuperTokenMinimal } from '../redux/endpoints/adHocSubgraphEndpoints';
import {DisplayAddress} from "../send/DisplayAddressChip";
import {FlowRateWithTime} from "../send/FlowRateInput";

export enum RestorationType {
  Downgrade = 1,
  Upgrade = 2,
  Approve = 3,
  SendStream = 4
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

export interface SendStreamRestoration extends TransactionRestoration {
  type: RestorationType.SendStream;
  chainId: number;
  token: SuperTokenMinimal;
  receiver: DisplayAddress;
  flowRate: FlowRateWithTime;
}