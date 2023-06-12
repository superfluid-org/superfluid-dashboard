import { useMemo } from "react";
import {
  CreateTask,
  DeleteTask,
  GetCreateTasksQuery,
  GetDeleteTasksQuery,
} from "../../scheduling-subgraph/.graphclient";
import { useAppSelector } from "../redux/store";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";

type CreateTaskItem = GetCreateTasksQuery["createTasks"][0];
type DeleteTaskItem = GetDeleteTasksQuery["deleteTasks"][0];

export interface PendingDeleteTask extends PendingUpdate, DeleteTaskItem {
  __typename: "DeleteTask";
  pendingType: "DeleteTaskCreate";
}

export interface PendingCreateTask extends PendingUpdate, CreateTaskItem {
  __typename: "CreateTask";
  pendingType: "CreateTaskCreate";
}

export const isPendingTask = (
  x: PendingUpdate
): x is PendingDeleteTask | PendingCreateTask =>
  ["CreateTaskCreate", "DeleteTaskCreate"].includes(x.pendingType);

export const useAddressPendingOutgoingTasks = (
  address: string | undefined,
  token: string
): Array<PendingDeleteTask | PendingCreateTask> => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  return useMemo(
    () =>
      address
        ? allPendingUpdates
            .filter(isPendingTask)
            .filter(
              (x) =>
                x.sender.toLowerCase() === address.toLowerCase() &&
                x.superToken.toLowerCase() === token.toLowerCase()
            )
        : [],
    [address, token, allPendingUpdates]
  );
};
