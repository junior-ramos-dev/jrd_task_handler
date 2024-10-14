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
    const { data, error, taskId } = result;

    // Handle the scenario where the taskId is defined but no data is available
    if (!data && taskId) {
      // Log the condition and send a successful response with the result object
      // console.log(
      //   `Task ${taskId} executed successfully, but no data was returned.`
      // );
      return res.status(200).json(result);
    }

    // Handle the scenario where there is an error present in the response
    if (error && error.status > 0) {
      // console.error(`Error occurred while processing task: ${error.message}`);
      // Send response status as per the error object
      return res.status(error.status).json(error);
    }

    // Handle case when data is present
    if (data) {
      // console.log(`Task ${taskId} executed successfully.`);
      return res.status(200).json(result);
    }
  }
};
