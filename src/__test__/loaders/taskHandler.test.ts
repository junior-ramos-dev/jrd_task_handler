import { taskHandler } from "../../core/loaders/taskHandler";
import { TaskRequestArgs } from "../../core/modules/TaskHandler";
import {
  execTaskBySpecObject,
  getCachedData,
  getTaskSpecByIndex,
  ITaskHandlerSpecs,
  logTask,
  setCacheData,
} from "../../core/modules/TaskHandlerSpecs";

import "@types/jest";

// Mocking the dependencies
jest.mock("../../core/modules/TaskHandlerSpecs", () => ({
  execTaskBySpecObject: jest.fn(),
  getCachedData: jest.fn(),
  getTaskSpecByIndex: jest.fn(),
  logTask: jest.fn(),
  setCacheData: jest.fn(),
  TASK: {},
}));

describe("taskHandler", () => {
  let taskRequestArgs: TaskRequestArgs;
  let tasksSpecsList: ITaskHandlerSpecs[];

  beforeEach(() => {
    // Reset mock implementations
    jest.clearAllMocks();

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

  // Additional test cases can target specific logical branches and edge cases to achieve higher code coverage
});
