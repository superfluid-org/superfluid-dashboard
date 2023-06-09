import { GetWrapScheduleQuery } from "../../auto-wrap-subgraph/.graphclient";

export interface WrapSchedule {
  id: string;
  wrapScheduleId: string;
  account: string;
  superToken: string;
  manager: string;
  strategy: string;
  liquidityToken: string;
  amount: string;
  createdAt: number;
  createdBlockNumber: number;
  deletedAt: number | undefined;
  expiredAt: number;
  lastExecutedAt: number | undefined;
  lowerLimit: number;
  updatedAt: number;
  updatedBlockNumber: number;
  upperLimit: number;
}

export type SubgraphWrapSchedule = NonNullable<
  Required<GetWrapScheduleQuery>["wrapSchedule"]
>;

export const mapSubgraphWrapSchedule = (
  wrapSchedule: SubgraphWrapSchedule
): WrapSchedule => {
  const mappedWrapSchedule = {
    ...wrapSchedule,
    amount: wrapSchedule.amount as string,
    createdAt: Number(wrapSchedule.createdAt),
    createdBlockNumber: Number(wrapSchedule.createdBlockNumber),
    deletedAt: wrapSchedule.deletedAt? Number(wrapSchedule.deletedAt): undefined,
    expiredAt: Number(wrapSchedule.expiredAt),
    lastExecutedAt:wrapSchedule.lastExecutedAt?  Number(wrapSchedule.lastExecutedAt): undefined,
    lowerLimit: Number(wrapSchedule.lowerLimit),
    upperLimit: Number(wrapSchedule.upperLimit),
    updatedBlockNumber: Number(wrapSchedule.updatedBlockNumber),
    updatedAt: Number(wrapSchedule.updatedAt),
  };
  return mappedWrapSchedule;
};
