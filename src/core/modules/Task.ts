/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Interface representing the Task object.
 *
 * This interface defines the structure for task-related data,
 * including the results of the task execution and any potential errors that occur.
 */
export interface ITask {
  /**
   * The data returned by the last executed task.
   *
   * This could be any object structure depending on the nature of the task,
   * such as the results of a computation, user data, or processed information.
   *
   * @type {object}
   */
  data: object;

  /**
   * The error object returned in case the task encounters an error during execution.
   *
   * It should conform to the ITaskError interface, detailing the nature of the error,
   * including its status, name, and message.
   *
   * @type {ITaskError}
   */
  error: ITaskError;

  /**
   * The ID of the current task being executed.
   *
   * This unique identifier helps track the specific task instance,
   * facilitating task management and troubleshooting.
   *
   * @type {number}
   */
  taskId: number;
}

/**
 * Interface representing the error object associated with a task.
 *
 * This interface defines the structure for handling errors that may arise during
 * task execution, providing details necessary for debugging and error management.
 */
export interface ITaskError {
  /**
   * The status code for the error, indicating the type of error encountered.
   *
   * A default value of 400 is suggested, representing a Bad Request,
   * but it can be set to other HTTP status codes as well, depending on the error context.
   *
   * @type {number}
   */
  status: number;

  /**
   * The name or type of the error.
   *
   * This is a brief string that classifies the error, such as "ValidationError",
   * "NotFoundError", or any other relevant categorization.
   *
   * @type {string}
   */
  name: string;

  /**
   * A detailed message describing the error.
   *
   * This provides more context about what caused the error and can assist in debugging.
   * It should be human-readable to effectively inform users or developers about the issue.
   *
   * @type {string}
   */
  message: string;
}

export interface IObjectMap<T extends NonNullable<unknown>> {
  [key: string]: T;
}

/**
 * Class representing a Task.
 *
 * This class implements the ITask interface, managing task-related data,
 * errors, and task identifiers. It provides methods for setting data,
 * updating error information, and retrieving task responses.
 */
export class Task implements ITask {
  /**
   * The data returned by the last task execution.
   *
   * @type {any}
   */
  data: any;

  /**
   * The error object associated with the task, if any.
   *
   * @type {ITaskError}
   */
  error: ITaskError;

  /**
   * The unique identifier for the task being executed.
   *
   * @type {number}
   */
  taskId: number;

  /**
   * Creates an instance of the Task class.
   *
   * @param {ITask} [taskHandler] - An optional object that initializes the task properties.
   */
  constructor(taskHandler?: ITask) {
    this.data = taskHandler?.data ?? {};
    this.error = taskHandler?.error ?? {
      status: 0,
      name: "",
      message: "",
    };
    this.taskId = taskHandler?.taskId ?? 0;
  }

  /**
   * Sets the data for the task.
   *
   * @param {any} data - The data to be set for this task.
   */
  setData = (data: any) => {
    this.data = data;
  };

  /**
   * Sets the error information associated with the task.
   *
   * @param {ITaskError} error - An error object containing status, name, and message.
   */
  setError = (error: ITaskError) => {
    this.error = error;
  };

  /**
   * Sets the unique identifier for the task.
   *
   * @param {number} taskId - The ID to assign to this task.
   */
  setTaskId = (taskId: number) => {
    this.taskId = taskId;
  };

  /**
   * Returns the task's response including data, error, and task ID.
   *
   * @returns {ITask} An object containing data, error information, and task ID.
   */
  getResponse = () => {
    const taskHandlerResponse: ITask = {
      data: this.data,
      error: this.error,
      taskId: this.taskId,
    };

    return taskHandlerResponse;
  };

  /**
   * Retrieves the current task ID.
   *
   * @returns {number} The ID of the current task.
   */
  getTaskId = () => this.taskId;

  /**
   * Logs the task ID to the console.
   */
  logTaskId = () => {
    console.log(this.taskId);
  };
}
