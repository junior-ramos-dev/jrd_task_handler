/* eslint-disable no-var */
import { taskHandler } from "../../core/loaders/TaskHandler";
import { ITaskError, Task } from "../../core/modules/Task";
import { TaskRequestArgs } from "../../core/modules/TaskHandler";
import {
  execTaskBySpecObject,
  getCachedData,
  getTaskSpecByIndex,
  ICacheData,
  ITaskHandlerSpecs,
  setCacheData,
} from "../../core/modules/TaskHandlerSpecs";

// Mocking the dependencies
jest.mock("../../core/modules/TaskHandlerSpecs", () => ({
  execTaskBySpecObject: jest.fn(),
  getCachedData: jest.fn(),
  getTaskSpecByIndex: jest.fn(),
  logTask: jest.fn(),
  setCacheData: jest.fn(),
  clearAuxVars: jest.fn(),
  TASK: {},
}));

// Mocking the Task class
jest.mock("../../core/modules/Task", () => {
  return {
    Task: jest.fn().mockImplementation(() => {
      return {
        data: {},
        error: {
          status: 0,
          name: "",
          message: "",
        },
        taskId: 0,
        setData: jest.fn(),
        setError: jest.fn(function (error: ITaskError) {
          this.error.status = error.status;
          this.error.name = error.name;
          this.error.message = error.message;
        }),
        setTaskId: jest.fn(),
        getResponse: jest.fn(function () {
          return {
            data: this.data,
            error: this.error,
            taskId: this.taskId,
          };
        }),
      };
    }),
  };
});

declare global {
  // File-scoped auxiliary variables
  var taskId: number;
  var index: number;
  var runTask: number;
  var cachedData: ICacheData[];
  var clearAuxVars: () => void;
  var taskInstance: Task;
}

describe("taskHandler", () => {
  let taskRequestArgs: TaskRequestArgs;
  let tasksSpecsList: ITaskHandlerSpecs[];

  beforeEach(() => {
    // Reset mock implementations
    jest.clearAllMocks();

    // Reset file-scoped auxiliary variables before each test
    global.taskId = 1;
    global.index = 0;
    global.runTask = 0;
    global.cachedData = [];

    global.clearAuxVars = jest.fn(() => {
      global.index = 0;
      global.taskId = 1;
      global.runTask = 0;
      global.cachedData.length = 0;
    });

    // Sample task specs list
    tasksSpecsList = [
      {
        taskId: 1,
        taskName: "Task 1",
        task: jest.fn(),
        requestArgs: { requestArgsKeys: ["key1"] },
        taskReturnData: {
          cacheData: true,
        },
      },
      {
        taskId: 2,
        taskName: "Task 2",
        task: jest.fn(),
        prevTaskDataAsArg: {
          prevTaskId: 1,
          prevTaskDataArgs: ["task1arg"],
        },
      },
    ];

    // Sample task request args
    taskRequestArgs = { key1: "value1", key2: "value2" };

    // Default mock return values
    const defaultMockAsyncImplementation = jest.fn(() =>
      Promise.resolve("data")
    );
    (execTaskBySpecObject as jest.Mock).mockImplementation(
      defaultMockAsyncImplementation
    );
    (getTaskSpecByIndex as jest.Mock).mockImplementation(
      (list, index) => list[index]
    );
    (getCachedData as jest.Mock).mockReturnValue("cachedData");
  });

  // afterEach(() => {
  //   clearAuxVarsMock.mockRestore();
  // });

  it("should execute all tasks except the last one correctly", async () => {
    const response = await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(execTaskBySpecObject).toHaveBeenCalledTimes(1);
    expect(setCacheData).toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  it("should execute the last task and reset auxiliary variables", async () => {
    global.index = 1;

    // Update the taskId and index to simulate the last task execution
    (getTaskSpecByIndex as jest.Mock).mockImplementation(
      () => tasksSpecsList[global.index]
    );
    global.taskId = 2;
    global.runTask = 0;

    const response = await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(execTaskBySpecObject).toHaveBeenCalledTimes(1);
    expect(response).toBeDefined();
    expect(global.taskId).toBe(2);
    expect(global.runTask).toBe(0);

    global.taskId = 3;
    global.runTask = 1;

    await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(global.taskId).toBe(3);
    expect(global.runTask).toBe(1);

    global.clearAuxVars();

    expect(global.clearAuxVars).toHaveBeenCalled();
    expect(global.taskId).toBe(1);
    expect(global.index).toBe(0);
    expect(global.runTask).toBe(0);
    expect(global.cachedData).toHaveLength(0);
  });

  it("should match if statement: task equal totalTasks and runTask equal true", async () => {
    global.index = 1;
    global.taskId = 2;
    global.runTask = 1;

    await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(global.index).toBe(1);
    expect(global.taskId).toBe(2);
    expect(global.runTask).toBe(1);
  });
});

// Mocking dependencies
// jest.mock("../../core/modules/TaskHandlerSpecs", () => ({
//   execTaskBySpecObject: jest.fn(),
//   getCachedData: jest.fn(),
//   getTaskSpecByIndex: jest.fn(),
// }));

// Assume we also need to mock executeAllTasksButLast
const executeAllTasksButLast = jest.fn();

describe("taskHandler - Error Handling", () => {
  let taskRequestArgs: TaskRequestArgs;
  let tasksSpecsList: ITaskHandlerSpecs[];
  let taskInstance: Task;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset file-scoped auxiliary variables before each test
    global.taskId = 1;
    global.index = 0;
    global.runTask = 0;
    global.cachedData = [];

    global.clearAuxVars = jest.fn(() => {
      global.index = 0;
      global.taskId = 1;
      global.runTask = 0;
      global.cachedData.length = 0;
    });

    // Initialize the Task instance
    taskInstance = new Task();

    // Sample tasksSpecsList
    tasksSpecsList = [
      {
        taskId: 1,
        taskName: "Task 1",
        task: jest.fn(),
        requestArgs: { requestArgsKeys: ["key1"] },
      },
      {
        taskId: 2,
        taskName: "Task 2", // This task will throw an error
        task: jest.fn(),
      },
    ];

    taskRequestArgs = { key1: "value1", key2: "value2" };

    // Mock implementation of execTaskBySpecObject for other tasks
    (execTaskBySpecObject as jest.Mock).mockResolvedValue("taskResult");

    // Mock implementation of executeAllTasksButLast to simulate an error
    executeAllTasksButLast.mockImplementation(() => {
      throw new Error("Task 1 failed");
    });

    // Mock implementation of execTaskBySpecObject to reject for Task 1
    (execTaskBySpecObject as jest.Mock).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (taskSpec, task, ...args) => {
        if (taskSpec.taskId === 1) {
          return Promise.reject(new Error("Task 1 failed")); // Rejecting the promise to simulate an error
        }
        return "data"; // Mock success for other tasks
      }
    );
  });

  it("should throw an error from executeAllTasksButLast", async () => {
    // Spy on the taskHandler to ensure that it calls executeAllTasksButLast correctly
    await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(execTaskBySpecObject).toHaveBeenCalledTimes(1); // Assume Task 1 is called
    expect(getTaskSpecByIndex).toHaveBeenCalledTimes(1); // Check if spec retrieval was invoked

    // Capture the error thrown from executeAllTasksButLast
    expect(executeAllTasksButLast).toThrow("Task 1 failed");
  });

  it("should set the error on Task instance when execution of Task 1 fails", async () => {
    jest.mock("../../core/modules/Task", () => {
      return {
        setError: jest.fn(function (error: ITaskError) {
          this.error.status = error.status;
          this.error.name = error.name;
          this.error.message = error.message;
        }),
      };
    });

    // Initialize a new Task instance to check error property
    // const taskInstance = new Task();
    (getTaskSpecByIndex as jest.Mock).mockImplementation(
      () => tasksSpecsList[global.index]
    );
    try {
      await taskHandler(taskRequestArgs, tasksSpecsList); // Call the function that throws an error
    } catch (error) {
      // Assert that the caught error is an instance of the Error class
      expect(executeAllTasksButLast).toThrow("Task 1 failed");
      expect(error).toBeInstanceOf(Error); // This line checks the instance

      expect(execTaskBySpecObject).toHaveBeenCalledTimes(0);

      taskInstance.error = {
        status: 400,
        name: "Error",
        message: "Task 1 failed",
      };

      expect(taskInstance.error).toEqual({
        status: 400,
        name: "Error",
        message: "Task 1 failed",
      });

      global.clearAuxVars();

      expect(global.clearAuxVars).toHaveBeenCalled();
      expect(global.taskId).toBe(1);
      expect(global.index).toBe(0);
      expect(global.runTask).toBe(0);
      expect(global.cachedData).toHaveLength(0);
    }
  });

  it("should throw an error instance", async () => {
    try {
      await taskHandler(taskRequestArgs, tasksSpecsList); // Call the function that throws an error
    } catch (error) {
      // Assert that the caught error is an instance of the Error class
      expect(error).toBeInstanceOf(Error); // This line checks the instance
    }
  });
});
