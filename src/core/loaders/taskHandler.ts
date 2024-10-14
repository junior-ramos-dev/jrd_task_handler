/* eslint-disable @typescript-eslint/no-explicit-any */
import { Task } from "../modules/Task";
import { TaskHandler, TaskRequestArgs } from "../modules/TaskHandler";
import {
  execTaskBySpecObject,
  getCachedData,
  getTaskSpecByIndex,
  ICacheData,
  ITaskHandlerSpecs,
  setCacheData,
  TASK,
} from "../modules/TaskHandlerSpecs";

const task: Task = new Task();
const cachedData: ICacheData[] = [];

// Aux vars
let taskId = 1;
let index = 0;
let runTask = 0;

/**
 * Reset the aux vars
 */
const clearAuxVars = () => {
  index = 0;
  taskId = 1;
  runTask = 0;
  cachedData.length = 0;
};

/**
 * Execute the list of tasks defined in tasksSpecsList
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

    if (taskId < totalTasks) {
      // Execute all tasks except the last one
      await executeAllTasksButLast(taskSpecObj, taskArgs);
    } else {
      // Execute the last task and return data
      if (taskId === totalTasks && runTask) {
        // Wait the current task finish
      } else if (taskId === totalTasks && !runTask) {
        runTask = 1;
        const data = await execTaskBySpecObject(taskSpecObj, TASK, ...taskArgs);
        task.setData(data);
        taskId = totalTasks + 1;
      } else if (taskId === totalTasks + 1 && runTask) {
        // Reset the aux vars
        if (index === totalTasks - 1) {
          clearAuxVars();
        }
      }
    }

    task.setTaskId(taskId);
    return task.getResponse();
  } catch (error) {
    console.log(error);
    const errorInstance = error as Error;
    task.error = {
      status: 400,
      name: errorInstance.name,
      message: errorInstance.message,
    };

    clearAuxVars();

    return task.getResponse();
  }
};

/**
 * Executes all tasks except the last one
 *
 * @param taskSpecObj
 * @param taskArgs
 */
const executeAllTasksButLast = async (
  taskSpecObj: ITaskHandlerSpecs,
  taskArgs: any[]
) => {
  try {
    if (taskId === taskSpecObj.taskId && runTask) {
      // Wait the current task finish
    } else if (taskId === taskSpecObj.taskId && !runTask) {
      runTask = 1;
      const data = await execTaskBySpecObject(taskSpecObj, TASK, ...taskArgs);
      if (taskSpecObj.taskReturnData?.cacheData) {
        setCacheData(taskSpecObj.taskId, data, cachedData);
      }

      index++;
      taskId++;
      runTask = 0;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
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
    reqArgs = findPropertiesByPaths(
      taskRequestArgs,
      taskSpecObj.requestArgs.requestArgsKeys
    );
  }

  if (taskSpecObj.prevTaskDataAsArg) {
    const prevTaskData = getCachedData(
      taskSpecObj.prevTaskDataAsArg.prevTaskId,
      cachedData
    );
    prevTaskArgs = findPropertiesByPaths(
      prevTaskData,
      taskSpecObj.prevTaskDataAsArg.prevTaskDataArgs
    );
  }

  const taskArgs = reqArgs.concat(prevTaskArgs);

  return taskArgs;
};

/**
 * Traverses an object based on an array of paths and returns the values of the specified properties.
 *
 * @param obj - The root object in which to search for the properties.
 * @param propertyPaths - An array of strings, each representing a path to a desired property (e.g., ["property1.property2", "property3"]).
 * @returns An array containing the values at the specified paths. If a path can't be resolved, its corresponding value will be undefined.
 *
 * Example usage:
 * const myObject = { a: { b: { c: 42 } }, d: 10, e: { f: 50 } };
 * const paths = ['a.b.c', 'd', 'e.f', 'g.h'];
 * const values = findPropertiesByPaths(myObject, paths);
 * console.log('Found Values:', values); // Output: [42, 10, 50, undefined]
 */
const findPropertiesByPaths = (
  obj: Record<string, any>,
  propertyPaths: string[]
): any[] => {
  const results = propertyPaths.map((propertyPath) => {
    const pathSegments = propertyPath.split(".");
    let currentValue: any = obj;

    for (const segment of pathSegments) {
      if (
        currentValue &&
        typeof currentValue === "object" &&
        segment in currentValue
      ) {
        currentValue = currentValue[segment]; // Navigate to the next level in the object structure.
      } else {
        // console.log(
        //   `Property path "${propertyPath}" could not be fully resolved.`
        // );
        return undefined; // Return undefined if the path can't be fully resolved.
      }
    }

    // console.log(
    //   `Found property at path "${propertyPath}", Value: ${currentValue}`
    // );
    return currentValue;
  });

  return results;
};
