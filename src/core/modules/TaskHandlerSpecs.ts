/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Interface with the task specifications
 */
export interface ITaskHandlerSpecs {
  // Define the task id
  taskId: number;
  // Define the task name
  taskName: string;
  // Define the task function
  task: AsyncTask;
  // Define if the task use args from the initial request
  requestArgs?: IRequestArgs;
  // Define if current task uses data returned from the previous task as args
  prevTaskDataAsArg?: IPreviousTaskDataArgs;
  // Define if current task return data;
  taskReturnData?: ITaskReturnData;
}

/**
 * Define the task function type
 */
export type AsyncTask = (...args: any) => Promise<any>;

/**
 * Define if the task use args from the initial request
 */
interface IRequestArgs {
  // Define the args keys from initial request
  requestArgsKeys: string[];
}

/**
 * Define if current task uses data returned from the previous task as args
 */
interface IPreviousTaskDataArgs {
  // Define the id from which previous task data is used by current task
  prevTaskId: number;
  // Define the args keys from previous task data
  prevTaskDataArgs: string[];
}

/**
 * Define if task return data;
 */
interface ITaskReturnData {
  // Define if the returned data must be cached to use by next tasks;
  cacheData: boolean;
}

/**
 * Cache the tasks data
 */
export interface ICacheData {
  // Define if task return data;
  taskId: number;
  // Define if the returned data must be cached to use in next steps;
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
export const execTaskBySpecObject: ExecFunction = <
  T extends ITaskHandlerSpecs,
  K extends keyof ItemSpecTaskKey
>(
  obj: T,
  key: K,
  ...args: Parameters<GetFunction<T, K>>
) => {
  const func = obj[key];
  const value = func(...args);
  return value;
};
