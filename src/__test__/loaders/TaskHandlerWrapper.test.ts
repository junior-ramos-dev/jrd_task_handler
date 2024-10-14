import { Response } from "express";
import { ITask } from "src/core/modules/Task";

import {
  handleResponse,
  taskHandlerWrapper,
} from "../../core/loaders/TaskHandlerWrapper";
import { ITaskHandlerSpecs } from "../../core/modules/TaskHandlerSpecs";

describe("taskHandlerWrapper", () => {
  it("should call taskHandler with remapped arguments and return response", async () => {
    const mockTaskHandler = jest.fn().mockResolvedValue("mockResponse");
    const requestArgs = { arg1: "value1", arg2: "value2" };
    const tasksSpecsList: ITaskHandlerSpecs[] = [
      {
        taskId: 1,
        taskName: "Test Task 1",
        task: async () => "Task 1 Result",
      },
      {
        taskId: 2,
        taskName: "Test Task 2",
        task: async () => "Task 2 Result",
      },
    ];

    const response = await taskHandlerWrapper(
      mockTaskHandler,
      requestArgs,
      tasksSpecsList
    );

    expect(mockTaskHandler).toHaveBeenCalledWith(
      expect.any(Object),
      tasksSpecsList
    );
    expect(response).toEqual("mockResponse");
  });
});

// Mock the Response object from express
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("handleResponse", () => {
  let res: Response;

  beforeEach(() => {
    res = mockResponse();
  });

  it("should respond when taskId is defined but no data is available", () => {
    const result: ITask = {
      data: {},
      error: { status: 0, name: "", message: "" }, // No error
      taskId: 1,
    };

    handleResponse(result, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("should handle and respond properly when an error is present in the response", () => {
    const result: ITask = {
      data: {},
      error: {
        status: 500,
        name: "ServerError",
        message: "Something went wrong",
      },
      taskId: 2,
    };

    handleResponse(result, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(result.error);
  });

  it("should respond when data is present", () => {
    const result: ITask = {
      data: { key: "value" },
      error: { status: 0, name: "", message: "" }, // No error
      taskId: 3,
    };

    handleResponse(result, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("should not respond if result is undefined", () => {
    const result: ITask | undefined = undefined;

    handleResponse(result, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
