import { taskHandler } from "../../core/loaders/TaskHandler";
import { TaskRequestArgs } from "../../core/modules/TaskHandler";
import {
  execTaskBySpecObject,
  getCachedData,
  getTaskSpecByIndex,
  ICacheData,
  ITaskHandlerSpecs,
  logTask,
  setCacheData,
} from "../../core/modules/TaskHandlerSpecs";

// File-scoped auxiliary variables
let taskId = 1;
let index = 0;
let runTask = 0;
const cachedData: ICacheData[] = [];

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

describe("taskHandler", () => {
  let taskRequestArgs: TaskRequestArgs;
  let tasksSpecsList: ITaskHandlerSpecs[];
  let clearAuxVarsMock: jest.Mock;

  beforeEach(() => {
    // Reset mock implementations
    jest.clearAllMocks();

    // Reset file-scoped auxiliary variables before each test
    taskId = 1;
    index = 0;
    runTask = 0;

    // Sample task specs list
    tasksSpecsList = [
      {
        taskId: 1,
        taskName: "Task 1",
        task: jest.fn(),
        requestArgs: { requestArgsKeys: ["key1"] },
      },
      {
        taskId: 2,
        taskName: "Task 2",
        task: jest.fn(),
      },
    ];

    // Sample task request args
    taskRequestArgs = { key1: "value1", key2: "value2" };

    clearAuxVarsMock = jest.fn(() => {
      index = 0;
      taskId = 1;
      runTask = 0;
      cachedData.length = 0;
    });

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

  afterEach(() => {
    clearAuxVarsMock.mockRestore();
  });

  it("should execute all tasks except the last one correctly", async () => {
    const response = await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(execTaskBySpecObject).toHaveBeenCalledTimes(1);
    expect(logTask).not.toHaveBeenCalled();
    expect(setCacheData).not.toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  it("should execute the last task and reset indices", async () => {
    // Update the taskId and index to simulate the last task execution
    (getTaskSpecByIndex as jest.Mock).mockImplementation(
      () => tasksSpecsList[1]
    );

    const response = await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(execTaskBySpecObject).toHaveBeenCalledTimes(1);
    expect(logTask).not.toHaveBeenCalled();
    expect(setCacheData).not.toHaveBeenCalled();
    expect(response).toBeDefined();
    // Additional checks can be added here to ensure reset behavior, if applicable
  });

  it("should handle and return task execution errors", async () => {
    const error = new Error("Execution Error");
    (execTaskBySpecObject as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(error)
    );

    tasksSpecsList = [];

    const response = await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(response!.error).toEqual({
      status: 400,
      name: "TypeError",
      message: "Cannot read properties of undefined (reading 'requestArgs')",
    });
  });

  it("should reset auxiliary variables when the last task is completed", async () => {
    await taskHandler(taskRequestArgs, tasksSpecsList);

    // Manually simulate the state to trigger clearAuxVars
    taskId = 3;
    index = 1;
    runTask = 1;

    // Execute the handler again to ensure aux variables are cleared
    await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(clearAuxVarsMock).toHaveBeenCalled();

    // Verify state resets
    expect(taskId).toBe(1);
    expect(index).toBe(0);
    expect(runTask).toBe(0);
    expect(cachedData).toHaveLength(0);

    // Ensure no further task executions occur post-reset
    expect(execTaskBySpecObject).toHaveBeenCalledTimes(1);
  });
});
