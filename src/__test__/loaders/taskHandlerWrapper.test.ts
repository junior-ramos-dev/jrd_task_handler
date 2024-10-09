import { Response } from "express";

import {
  handleResponse,
  taskHandlerWrapper,
} from "../../core/loaders/taskHandlerWrapper";
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

describe("handleResponse", () => {
  let mockResponse: Response;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  it("should return status 200 for a response with taskId", () => {
    const result = {
      data: {},
      error: { status: 0, name: "", message: "" },
      taskId: 1,
    };

    handleResponse(result, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(result);
  });

  it("should return the error status when there is an error", () => {
    const result = {
      data: {},
      error: { status: 400, name: "Error", message: "Not found" },
      taskId: 1,
    };

    handleResponse(result, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(result.error);
  });

  it("should return status 200 for a response with data", () => {
    const result = {
      data: { id: "123" },
      error: { status: 0, name: "", message: "" },
      taskId: 1,
    };

    handleResponse(result, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(result);
  });

  it("should not call response methods when result is undefined", () => {
    handleResponse(undefined, mockResponse);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
