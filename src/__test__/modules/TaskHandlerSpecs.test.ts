import {
  execTaskBySpecObject,
  getCachedData,
  getTaskSpecByIndex,
  ICacheData,
  ITaskHandlerSpecs,
  logTask,
  setCacheData,
} from "../../core/modules/TaskHandlerSpecs";

describe("Task Handling Functions", () => {
  let taskHandlerItemSpecsList: ITaskHandlerSpecs[];
  let cachedData: ICacheData[];

  beforeEach(() => {
    taskHandlerItemSpecsList = [
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
    cachedData = [];
  });

  describe("getTaskSpecByIndex", () => {
    it("should return the task spec by index", () => {
      const taskSpec = getTaskSpecByIndex(taskHandlerItemSpecsList, 1);
      expect(taskSpec).toEqual(taskHandlerItemSpecsList[1]);
    });

    it("should return undefined for an invalid index", () => {
      const taskSpec = getTaskSpecByIndex(taskHandlerItemSpecsList, 5);
      expect(taskSpec).toBeUndefined();
    });
  });

  describe("getCachedData", () => {
    it("should return cached data for the specified taskId", () => {
      const cacheItem: ICacheData = { taskId: 1, data: "Cached Result" };
      cachedData.push(cacheItem);
      const data = getCachedData(1, cachedData);
      expect(data).toBe("Cached Result");
    });

    it("should return undefined for a non-existent taskId", () => {
      const data = getCachedData(2, cachedData);
      expect(data).toBeUndefined();
    });
  });

  describe("setCacheData", () => {
    it("should add data to cache correctly", () => {
      setCacheData(1, "Test Data", cachedData);
      expect(cachedData).toHaveLength(1);
      expect(cachedData[0]).toEqual({ taskId: 1, data: "Test Data" });
    });

    it("should append data for a different taskId", () => {
      setCacheData(1, "First Data", cachedData);
      setCacheData(2, "Second Data", cachedData);
      expect(cachedData).toHaveLength(2);
    });
  });

  describe("logTask", () => {
    it("should log the task information", () => {
      console.log = jest.fn(); // Mock console.log
      logTask(taskHandlerItemSpecsList[0]);
      expect(console.log).toHaveBeenCalledWith("Running Task 1 - Test Task 1");
    });
  });

  describe("execTaskBySpecObject", () => {
    it("should execute the task function and return the result", async () => {
      const result = await execTaskBySpecObject(
        taskHandlerItemSpecsList[0],
        "task"
      );
      expect(result).toBe("Task 1 Result");
    });

    it("should execute a different task function and return the result", async () => {
      const result = await execTaskBySpecObject(
        taskHandlerItemSpecsList[1],
        "task"
      );
      expect(result).toBe("Task 2 Result");
    });
  });
});
