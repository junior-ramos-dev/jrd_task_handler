/* eslint-disable @typescript-eslint/no-explicit-any */
import { IObjectMap, ITask } from "@/core/modules/Task";

import { ITaskHandlerSpecs } from "./TaskHandlerSpecs";

/**
 *
 */
export type TaskHandler = (
  taskRequestArgs: TaskRequestArgs,
  tasksSpecsList: Array<ITaskHandlerSpecs>
) => Promise<ITask | undefined>;

/**
 *
 */
export type TaskHandlerWrapper = (
  taskHandler: TaskHandler,
  requestArgs: object,
  tasksSpecsList: Array<ITaskHandlerSpecs>
) => Promise<ITask | undefined>;

/**
 *
 */
export type TaskRequestArgs = IObjectMap<any>;

/**
 *
 */
type Remap<Obj extends object> = {
  [Prop in keyof Obj as Prop]: Obj[Prop];
};

/**
 *
 * @param obj
 * @returns
 */
export const remapObj = <Obj extends object>(obj: Obj) =>
  (Object.keys(obj) as Array<keyof Obj>).reduce(
    (acc, elem) => ({
      ...acc,
      [elem]: obj[elem],
    }),
    {} as Remap<Obj>
  );
