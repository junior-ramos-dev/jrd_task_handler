import { taskHandler } from "../../core/loaders/taskHandler";
import { Task } from "../../core/modules/Task";
import {
  execTaskBySpecObject,
  getTaskSpecByIndex,
  setCacheData,
  TASK,
} from "../../core/modules/TaskHandlerSpecs";

jest.mock("../../core/modules/TaskHandlerSpecs", () => ({
  execTaskBySpecObject: jest.fn(),
  getCachedData: jest.fn(),
  getTaskSpecByIndex: jest.fn(),
  logTask: jest.fn(),
  setCacheData: jest.fn(),
  TASK: {},
}));

describe("taskHandler", () => {
  const mockTask = new Task();
  mockTask.setData = jest.fn();
  mockTask.setTaskId = jest.fn();
  mockTask.getResponse = jest.fn().mockReturnValue({ test: "response" });

  const taskRequestArgs = { sampleArg: "testArg" };
  const tasksSpecsList = [
    {
      taskId: 1,
      taskName: "First Task",
      task: jest.fn(),
      taskReturnData: { cacheData: true },
      requestArgs: { requestArgsKeys: ["sampleArg"] },
    },
    {
      taskId: 2,
      taskName: "Second Task",
      task: jest.fn(),
      prevTaskDataAsArg: { prevTaskId: 1, prevTaskDataArgs: ["sampleArg"] },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute tasks and return response", async () => {
    (getTaskSpecByIndex as jest.Mock).mockReturnValueOnce(tasksSpecsList[0]);
    (execTaskBySpecObject as jest.Mock).mockResolvedValueOnce({
      someData: "data",
    });

    const response = await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(getTaskSpecByIndex).toHaveBeenCalledWith(tasksSpecsList, 0);
    expect(execTaskBySpecObject).toHaveBeenCalledWith(
      tasksSpecsList[0],
      TASK,
      "testArg"
    );
    expect(setCacheData).toHaveBeenCalledWith(1, { someData: "data" }, []);
    expect(mockTask.setData).toHaveBeenCalledWith({ someData: "data" });
    expect(response).toEqual({ test: "response" });
  });

  it("should handle errors and return error response", async () => {
    const error = new Error("Test error");
    (getTaskSpecByIndex as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const response = await taskHandler(taskRequestArgs, tasksSpecsList);

    expect(mockTask.error).toEqual({
      status: 400,
      name: error.name,
      message: error.message,
    });
    expect(response).toEqual({ test: "response" });
  });
});
