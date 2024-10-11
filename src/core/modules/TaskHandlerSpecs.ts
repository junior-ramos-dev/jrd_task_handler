/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Interface representing the specifications of a task.
 */
export interface ITaskHandlerSpecs {
  /**
   * A unique identifier for the task.
   * @type {number}
   */
  taskId: number;

  /**
   * The name of the task for reference and logging purposes.
   * @type {string}
   */
  taskName: string;

  /**
   * An asynchronous function representing the task execution.
   * The function returns a promise, reflecting async operations.
   * @type {AsyncTask}
   */
  task: AsyncTask;

  /**
   * Optional. Contains the specification for using arguments from the initial request.
   * @type {IRequestArgs | undefined}
   */
  requestArgs?: IRequestArgs;

  /**
   * Optional. Defines usage of data returned from a previous task as arguments for the current task.
   * @type {IPreviousTaskDataArgs | undefined}
   */
  prevTaskDataAsArg?: IPreviousTaskDataArgs;

  /**
   * Optional. Specifies whether the task's return data should be cached for future use.
   * @type {ITaskReturnData | undefined}
   */
  taskReturnData?: ITaskReturnData;
}

/**
 * Type defining a task function that is asynchronous and returns a promise.
 * @typedef {(...args: any) => Promise<any>} AsyncTask
 */
export type AsyncTask = (...args: any) => Promise<any>;

/**
 * Interface defining the structure for task input arguments extracted from the initial request.
 */
export interface IRequestArgs {
  /**
   * An array of keys used to extract arguments from the initial request object.
   * @type {string[]}
   */
  requestArgsKeys: string[];
}

/**
 * Interface defining the structure for using data from a previous task as arguments in the current task.
 */
export interface IPreviousTaskDataArgs {
  /**
   * The ID of the previous task whose data will be used as input for the current task.
   * @type {number}
   */
  prevTaskId: number;

  /**
   * An array of keys specifying which data from the previous task is used as arguments for the current task.
   * @type {string[]}
   */
  prevTaskDataArgs: string[];
}

/**
 * Interface specifying whether a task's return data should be cached for later use by other tasks.
 */
export interface ITaskReturnData {
  /**
   * A boolean indicating if the task's return data should be cached.
   * @type {boolean}
   */
  cacheData: boolean;
}

/**
 * Interface representing the cached data from tasks, meant to be accessible for future tasks.
 */
export interface ICacheData {
  /**
   * The ID of the task whose data is being cached.
   * @type {number}
   */
  taskId: number;

  /**
   * The actual data to be cached from the task execution, which can be of any type.
   * @type {any}
   */
  data: any;
}

/**
 * Get the the task specs by index from task specs list
 *
 * @param taskHandlerItemSpecsList
 * @param index
 * @returns
 */
export const getTaskSpecByIndex = (
  taskHandlerItemSpecsList: ITaskHandlerSpecs[],
  index: number
) => {
  return taskHandlerItemSpecsList[index];
};

/**
 *
 * @param taskId
 * @param cachedData
 * @returns
 */
export const getCachedData = (taskId: number, cachedData: ICacheData[]) => {
  for (const item of cachedData) {
    if (item.taskId === taskId) return item.data;
  }
};

/**
 *
 * @param taskId
 * @param taskData
 * @param cacheData
 */
export const setCacheData = (
  taskId: number,
  taskData: any,
  cacheData: ICacheData[]
) => {
  const cacheObj: ICacheData = {
    taskId: taskId,
    data: taskData,
  };

  cacheData.push(cacheObj);
};

/**
 *
 * @param taskSpec
 */
export const logTask = (taskSpec: ITaskHandlerSpecs) => {
  console.log(`Running Task ${taskSpec.taskId} - ${taskSpec.taskName}`);
};

//================================================================

export const TASK = "task";

/**
 * Type that picks the property 'task' from ITaskHandlerSpecs
 */
type ItemSpecTaskKey = Pick<ITaskHandlerSpecs, "task">;

/**
 * Generic type to get the function defined in the property 'task' from ITaskHandlerSpecs
 */
type GetFunction<
  T extends ITaskHandlerSpecs,
  K extends keyof ItemSpecTaskKey
> = T[K] extends AsyncTask ? T[K] : any;

/**
 * Generic type to execute the function defined in the property 'task' from ITaskHandlerSpecs
 */
type ExecFunction = <
  T extends ITaskHandlerSpecs,
  K extends keyof ItemSpecTaskKey
>(
  obj: T,
  key: K,
  ...args: Parameters<GetFunction<T, K>>
) => Promise<ReturnType<GetFunction<T, K>>>;

/**
 * Implements a wrapper function to execute the function defined in an object of type interface ITaskHandlerSpecs
 *
 * @param obj
 * @param key
 * @param args
 * @returns
 */
export const execTaskBySpecObject: ExecFunction = async <
  T extends ITaskHandlerSpecs,
  K extends keyof ItemSpecTaskKey
>(
  obj: T,
  key: K,
  ...args: Parameters<GetFunction<T, K>>
) => {
  const func = obj[key];
  const value = await func(...args);
  return value;
};
