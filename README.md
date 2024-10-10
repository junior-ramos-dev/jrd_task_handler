# Task Load Handler

## Overview

This module is designed to handle and execute a sequence of tasks based on provided specifications. It orchestrates the task execution process, handling tasks one after another, and making use of cached data when necessary.

This task handling module is structured to execute tasks efficiently, support dependency management between tasks through caching, and provide essential error handling to ensure robustness. It's a flexible solution adaptable to various sequential task execution scenarios.

## Key Components

### 1. `taskHandler` Function

The `taskHandler` function is the main orchestrator that executes a list of tasks. It takes two parameters:

- **`taskRequestArgs`**: An object containing arguments required by tasks.
- **`tasksSpecsList`**: An array of task specifications, each defining how a task should be executed.

#### Workflow

- **Initialization**: Initialize auxiliary variables like `taskId`, `index`, and `runTask` to manage task sequencing.
- **Task Execution**:
  - Uses `getTaskSpecByIndex` to retrieve the current task specification.
  - Assembles `taskArgs` by calling `getTaskArgs`, which extracts required arguments from `taskRequestArgs` or cached data.
  - If `taskId` is less than the total tasks, it calls `executeAllTasksButLast`.
  
### 2. `executeAllTasksButLast` Function

This helper function handles the execution of tasks except for the final task:

- Verifies if the current task should be logged and is ready to run.
- Executes the task using `execTaskBySpecObject` and caches its output if needed.
- Updates the `index`, `taskId`, and `runTask` flags to progress the task sequence.

### 3. `getTaskArgs` Function

This function builds the argument list for a task based on the current task's specifications:

- **Task Arguments**: Extracts arguments using specific keys from the `taskRequestArgs`.
- **Previous Task Data**: If required, retrieves cached data of a previous task to be used as arguments.

### 4. `getValueInObjectFromArrayKeys` Function

This utility function searches through an object (including nested objects) to extract values based on provided keys. It returns an array containing the corresponding values found.

## Examples

### Example 1: Basic Task Execution

Suppose you have two tasks to execute. The `taskHandler` would manage running the first task, storing data if required, and then proceeding to the last task, leveraging cached data when necessary.

**Input**:
```typescript
const taskRequestArgs = { id: 123 };
const tasksSpecsList: ITaskHandlerSpecs[] = [
    { taskId: 1, taskName: "Fetch User", task: fetchUser },
    { taskId: 2, taskName: "Fetch Orders", task: fetchOrders, prevTaskDataAsArg: { prevTaskId: 1,  prevTaskDataArgs: ['userId'] } }
];
```

**Execution Flow**:
1. The first task, `Fetch User`, is executed using `taskRequestArgs`.
2. The result of `Fetch User` is cached if necessary.
3. The second task, `Fetch Orders`, uses the result of the first task as an argument (`userId`), ensuring sequential dependency handling.

### Example 2: Error Handling

If an error occurs during task execution, it is caught and logged:

**Case**:
- Error happens in fetching user orders.
  
**Error Handling**:
- The error is captured, and a response object with a 400 status is returned, detailing the error.

<br/>

----
</br>

# Usage with API (Express)

The provided code defines an endpoint for an Express.js application that handles incoming HTTP requests by executing a series of tasks. This endpoint utilizes a task handler to manage the task execution process based on specifications defined elsewhere.

**Example**:
```typescript
import { Request, Response } from "express";

import {
  taskHandlerWrapper,
  handleResponse,
  taskHandler,
} from "jrd_task_loader";

import { registerTasksSpecsList } from "@/example/registerTasksSpecsList";

export const taskEndpoint = async (req: Request, res: Response) => {
  const requestArgs: object = req.body;

  const result = await taskHandlerWrapper(
    taskHandler,
    requestArgs,
    registerTasksSpecsList
  );

  console.log("result:", result);

  handleResponse(result, res);
};
```


## Key Components

### 1. Express.js Endpoint: `taskEndpoint`

The `taskEndpoint` function is an asynchronous function that acts as a handler for an Express.js endpoint, designed to process HTTP requests.

#### Workflow

- **Request Handling**: 
  - Extracts the request arguments from `req.body`, assuming a JSON payload, which will be used as input for tasks.
  
- **Task Execution**:
  - Utilizes `taskHandlerWrapper` to manage the execution flow. It takes:
    - `taskHandler`: The core function that coordinates task execution using requested arguments and task specifications.
    - `requestArgs`: The arguments extracted from the incoming HTTP request.
    - `registerTasksSpecsList`: A list of task specifications defining what tasks to run and their configurations.

- **Logging**:
  - Outputs the task result to the server console for debugging or info purposes.

- **Response Handling**:
  - Sends back the result to the client using `handleResponse`, adjusting the HTTP response to reflect the task execution outcome.

### 2. `taskHandlerWrapper`

This utility function is likely designed to wrap the core task execution (`taskHandler`) with additional logic, possibly including error handling, logging, or other middleware functionalities. It orchestrates the main task execution process.

### 3. Task Specification: `registerTasksSpecsList`

This is an imported list of task specifications (`registerTasksSpecsList`), which outlines what tasks should be executed, in what order, and with what configurations.

### 4. `handleResponse`

This function manages how the result of task executions is returned to the client through the HTTP response (`res`). It formats and sends the task handler's outcome back to the requester.

## Example Usage Scenario

1. **Client Request**: A client sends a POST request to this endpoint with a JSON body, e.g., `{ "userId": "12345" }`.

2. **Backend Processing**:
   - The `taskEndpoint` extracts this data and triggers the taskHandlerWrapper with necessary components.
   - Tasks are executed as per the steps defined in the `registerTasksSpecsList`, where each task can involve processes like fetching user data, computing metrics, etc.

3. **Result Handling**:
   - The result of these tasks, whether success or error, is logged to the console.
   - The final formatted response is sent back to the client, indicating success or detailing any errors encountered.

This setup provides a flexible and organized way to handle complex business logic asynchronously via a sequence of tasks, thereby enabling scalable and maintainable backend processes for handling diverse client requests effectively.

