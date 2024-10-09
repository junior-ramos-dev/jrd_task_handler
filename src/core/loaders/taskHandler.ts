/* eslint-disable @typescript-eslint/no-explicit-any */
import { Task } from "@/core/modules/Task";
import {
  execTaskBySpecObject,
  getCachedData,
  getTaskSpecByIndex,
  ICacheData,
  ITaskHandlerSpecs,
  logTask,
  setCacheData,
  TASK,
} from "@/core/modules/TaskHandlerSpecs";

import { TaskHandler, TaskRequestArgs } from "../modules/TaskHandler";

const task: Task = new Task();
const cachedData: ICacheData[] = [];

// Aux vars
let taskId = 1;
let index = 0;
let runTask = 0;

/**
 *
 * @param taskRequestArgs
 * @param tasksSpecsList
 * @returns
 */
export const taskHandler: TaskHandler = async (
  taskRequestArgs: TaskRequestArgs,
  tasksSpecsList: Array<ITaskHandlerSpecs>
) => {
  const totalTasks = tasksSpecsList.length;

  try {
    const taskSpecObj = getTaskSpecByIndex(tasksSpecsList, index);
    const taskArgs = getTaskArgs(taskSpecObj, taskRequestArgs);
    console.log("taskArgs: ", taskArgs);

    if (taskId < totalTasks) {
      // Execute all tasks except the last one
      executeAllTasksButLast(taskSpecObj, taskArgs);
    } else {
      if (taskId === totalTasks && runTask) {
        logTask(taskSpecObj);
        //Execute the last task and return data
      } else if (taskId === totalTasks && !runTask) {
        runTask = 1;
        execTaskBySpecObject(taskSpecObj, TASK, ...taskArgs).then(
          (data: any) => {
            task.setData(data);
            taskId = 8;
          }
        );
      }

      // Reset the aux vars
      if (index === totalTasks - 1) {
        index = 0;
        taskId = 1;
        runTask = 0;
      }
    }

    task.setTaskId(taskId);
    return task.getResponse();
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      task.error = {
        status: 400,
        name: error.name,
        message: error.message,
      };
    }

    return task.getResponse();
  }
};

/**
 * Executes all tasks except the last one
 *
 * @param taskSpecObj
 * @param taskArgs
 */
const executeAllTasksButLast = (
  taskSpecObj: ITaskHandlerSpecs,
  taskArgs: any[]
) => {
  if (taskId === taskSpecObj.taskId && runTask) {
    logTask(taskSpecObj);
  } else if (taskId === taskSpecObj.taskId && !runTask) {
    runTask = 1;
    execTaskBySpecObject(taskSpecObj, TASK, ...taskArgs).then((data) => {
      if (taskSpecObj.taskReturnData?.cacheData) {
        setCacheData(taskSpecObj.taskId, data, cachedData);
      }

      index++;
      taskId++;
      runTask = 0;
    });
  }
};

/**
 * Get the task args checking if the current task uses request args or previous tasks args
 *
 * @param taskSpecObj
 * @param taskRequestArgs
 * @returns
 */
const getTaskArgs = (
  taskSpecObj: ITaskHandlerSpecs,
  taskRequestArgs: TaskRequestArgs
) => {
  let reqArgs: any[] = [];
  let prevTaskArgs: any[] = [];

  if (taskSpecObj.requestArgs) {
    reqArgs = getValueInObjectFromArrayKeys(
      taskRequestArgs,
      taskSpecObj.requestArgs.requestArgsKeys
    );
  }

  if (taskSpecObj.prevTaskDataAsArg) {
    const prevTaskData = getCachedData(
      taskSpecObj.prevTaskDataAsArg.prevTaskId,
      cachedData
    );
    prevTaskArgs = getValueInObjectFromArrayKeys(
      prevTaskData,
      taskSpecObj.prevTaskDataAsArg.prevTaskDataArgs
    );
  }

  const taskArgs = reqArgs.concat(prevTaskArgs);

  return taskArgs;
};

/**
 * Iterates over objects (and nested objects)
 * and return the values for the keys in array of strings
 *
 * @param obj
 * @param keys
 * @returns
 */
const getValueInObjectFromArrayKeys = (obj: object, keys: string[]) => {
  const values: any[] = [];

  const findValuesInObj = (obj: { [x: string]: any }, k: string) => {
    Object.keys(obj).forEach((key) => {
      if (key === k) {
        values.push(obj[key]);
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        findValuesInObj(obj[key], k);
      }
    });
  };

  let k;
  keys.forEach((key) => {
    if (key.indexOf(".") !== -1) {
      const keysArr = key.split(".");
      const idx = keysArr.length - 1;
      k = keysArr[idx];
    } else {
      k = key;
    }
    // console.log(keysArr[idx]);
    findValuesInObj(obj, k);
  });

  //   console.log(values);
  return values;
};
