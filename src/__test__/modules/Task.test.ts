import { ITask, ITaskError, Task } from "../../core/modules/Task";

describe("Task Class", () => {
  let task: Task;

  beforeEach(() => {
    task = new Task();
  });

  it("should create an instance of Task with default values", () => {
    expect(task).toBeInstanceOf(Task);
    expect(task.data).toEqual({});
    expect(task.error).toEqual({ status: 0, name: "", message: "" });
    expect(task.taskId).toBe(0);
  });

  it("should initialize Task instance with provided values", () => {
    const taskData: ITask = {
      data: { someKey: "someValue" },
      error: { status: 404, name: "Not Found", message: "Resource not found" },
      taskId: 1,
    };

    const initializedTask = new Task(taskData);

    expect(initializedTask.data).toEqual(taskData.data);
    expect(initializedTask.error).toEqual(taskData.error);
    expect(initializedTask.taskId).toBe(taskData.taskId);
  });

  it("should set data correctly", () => {
    const newData = { newKey: "newValue" };
    task.setData(newData);
    expect(task.data).toEqual(newData);
  });

  it("should set error correctly", () => {
    const newError: ITaskError = {
      status: 500,
      name: "Server Error",
      message: "Internal server error",
    };
    task.setError(newError);
    expect(task.error).toEqual(newError);
  });

  it("should set taskId correctly", () => {
    task.setTaskId(2);
    expect(task.taskId).toBe(2);
  });

  it("should return the correct task response", () => {
    task.setData({ key: "value" });
    task.setError({
      status: 404,
      name: "Not Found",
      message: "Resource not found",
    });
    task.setTaskId(3);

    const expectedResponse: ITask = {
      data: { key: "value" },
      error: { status: 404, name: "Not Found", message: "Resource not found" },
      taskId: 3,
    };

    expect(task.getResponse()).toEqual(expectedResponse);
  });

  it("should return the correct taskId", () => {
    task.setTaskId(5);
    expect(task.getTaskId()).toBe(5);
  });

  it("should log the taskId to the console", () => {
    const consoleSpy = jest.spyOn(console, "log");
    task.setTaskId(10);

    task.logTaskId();

    expect(consoleSpy).toHaveBeenCalledWith(10);
    consoleSpy.mockRestore(); // Restore original console.log
  });
});
