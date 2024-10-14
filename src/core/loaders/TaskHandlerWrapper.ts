import { Response } from "express";

import { IObjectMap, ITask } from "../modules/Task";
import {
  remapObj,
  TaskHandler,
  TaskHandlerWrapper,
  TaskRequestArgs,
} from "../modules/TaskHandler";
import { ITaskHandlerSpecs } from "../modules/TaskHandlerSpecs";

export const taskHandlerWrapper: TaskHandlerWrapper = async (
  taskHandler: TaskHandler,
  requestArgs: object,
  tasksSpecsList: Array<ITaskHandlerSpecs>
) => {
  const genericParamsObj: object = {
    ...requestArgs,
  };

  const taskRequestArgs: TaskRequestArgs = remapObj(
    genericParamsObj
  ) as IObjectMap<object>;

  const response = await taskHandler(taskRequestArgs, tasksSpecsList);

  return response;
};

/**
 * Helper function to handle the response from taskHandler
 *
 * @param result
 * @param res
 * @returns
 */
export const handleResponse = (result: ITask | undefined, res: Response) => {
  // Check if the result is defined
  if (result) {
    // Destructure the result for convenient access
    const { error } = result;

    // Handle the scenario where there is an error present in the response
    if (error && error.status > 0) {
      return res.status(error.status).json(error);
    } else {
      // Handle the scenario where there is no error present in the response
      return res.status(200).json(result);
    }
  }
};
