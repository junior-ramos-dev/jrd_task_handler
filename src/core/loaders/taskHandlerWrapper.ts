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

export const handleResponse = (result: ITask | undefined, res: Response) => {
  if (result) {
    const response: ITask = result;
    if (response && !response.data && "taskId" in response) {
      res.status(200).json(response);
    } else if (response?.error && response?.error.status > 0) {
      res.status(response.error.status).json(response.error);
    } else if (response?.data) {
      res.status(200).json(response);
    }
  }
};
