/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ITask {
  data: object;
  error: ITaskError;
  taskId: number;
}
export interface ITaskError {
  status: number;
  name: string;
  message: string;
}

export interface IObjectMap<T extends NonNullable<unknown>> {
  [key: string]: T;
}

export class Task implements ITask {
  data: any;
  error: ITaskError;
  taskId: number;

  constructor(taskHandler?: ITask) {
    this.data = taskHandler?.data ?? {};
    this.error = taskHandler?.error ?? {
      status: 0,
      name: "",
      message: "",
    };
    this.taskId = taskHandler?.taskId ?? 0;
  }

  setData = (data: any) => {
    this.data = data;
  };

  setError = (error: ITaskError) => {
    this.error = error;
  };

  setTaskId = (taskId: number) => {
    this.taskId = taskId;
  };

  getResponse = () => {
    const taskHandlerResponse: ITask = {
      data: this.data,
      error: this.error,
      taskId: this.taskId,
    };

    return taskHandlerResponse;
  };

  getTaskId = () => this.taskId;

  logTaskId = () => {
    console.log(this.taskId);
  };
}
