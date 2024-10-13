# Task Handler

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
- Updates the `cachedData`, `index`, `taskId`, and `runTask` flags to progress the task sequence.
- #### Note:
   At this point, the response will always include an empty object for `data` and an object for `error` (the properties will be empty if there are no errors) and the ID for the current task being executed. If no errors occur during the process, the final task will return the resulting data.

### 3. `getTaskArgs` Function

This function builds the argument list for a task based on the current task's specifications:

- **Task Arguments**: Extracts arguments using specific keys from the `taskRequestArgs`.
- **Previous Task Data**: If required, retrieves cached data of a previous task to be used as arguments using specific keys from the `prevTaskDataArgs`.

- #### Note
  - When defining a task's arguments, if you use both `taskRequestArgs` and `prevTaskDataArgs,` the `taskRequestArgs` must be declared first, followed by `prevTaskDataArgs,` and in their respective order, defined in the `tasksSpecsList` object for the given task.

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


----
<br/>

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

### 1. Sample Endpoint: `taskEndpoint`

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

This is a list of the task specifications (`registerTasksSpecsList`), which outlines what tasks should be executed, in what order, and with what configurations.


Structured overview of the properties from Task Specification, outlining their purposes.

| Property          | Type                                      | Description                                                                                   |
|-------------------|-------------------------------------------|-----------------------------------------------------------------------------------------------|
| `taskId`          | `number`                                  | A unique identifier for the task.                                                             |
| `taskName`        | `string`                                  | The name of the task for reference and logging purposes.                                      |
| `task`            | `AsyncTask`                               | An asynchronous function representing the task execution, returning a promise.                |
| `requestArgs`     | `IRequestArgs` | Interface defining the structure for task input arguments extracted from the initial request.            |
| `prevTaskDataAsArg` | `IPreviousTaskDataArgs` | Interface defining the structure for using data from a previous task as arguments in the current task.       | Optional. Defines usage of data returned from a previous task as arguments for the current task.|
| `taskReturnData`  | `ITaskReturnData` | Interface specifying whether a task's return data should be cached for later use by other tasks.             | Optional. Specifies whether the task's return data should be cached for future use.           |

### IRequestArgs

| Property          | Type              | Description                                                                                  |
|-------------------|-------------------|----------------------------------------------------------------------------------------------|
| `requestArgsKeys` | `string[]`        | An array of keys used to extract arguments from the initial request object.                  |

### IPreviousTaskDataArgs

| Property           | Type               | Description                                                                                  |
|--------------------|--------------------|----------------------------------------------------------------------------------------------|
| `prevTaskId`       | `number`           | The ID of the previous task whose data will be used as input for the current task.           |
| `prevTaskDataArgs` | `string[]`         | An array of keys specifying which data from the previous task is used as arguments for the current task. |

### ITaskReturnData

| Property   | Type      | Description                                                                               |
|------------|-----------|-------------------------------------------------------------------------------------------|
| `cacheData`| `boolean` | A boolean indicating if the task's return data should be cached for later use by other tasks. |

##

### 4. `handleResponse`

This function is responsible for managing the return of task execution results to the client through the HTTP response (`res`). It formats and sends the outcome of the task handler back to the requester. Since the `taskHandler` function always returns an object with a status code of 400 (indicating an error scenario), it can be replaced with a function that returns a different response based on specific business logic conditions.

### Example

Assume you need to send a redirect response. We will create the `convertToRedirectError` function and modify it accordingly. HTTP 300 codes are used for redirection, which usually implies that further action needs to be taken to complete the request.

Here's how you might implement this function in TypeScript:

```typescript
import { Response } from 'express'; // Import Response type for Express

// Assume the following specified interface for ITask
interface ITask {
  data?: object;
  error: ITaskError;
  taskId: number;
}

// Assume the ITaskError specified interface for ITaskError:
interface ITaskError {
  status: number;   // HTTP status code
  name: string;     // Name/type of the error
  message: string;  // Detailed message describing the error
}

/**
 * Converts an ITask object into an error response with an HTTP 300 status code
 * and sends it to the client.
 *
 * @param {ITask} task - The task object to convert into an error response.
 * @param {Response} res - The Express Response object used to send the error.
 */
const convertToRedirectError = (task: ITask, res: Response): void => {
  // Extract properties from the task object
  const { taskId } = task;

  // Construct redirect error response
  const redirectError: ITaskError = {
    status: 307, // Temporary Redirect (you can choose any 3xx code as needed)
    name: "RedirectError",
    message: `Task ${taskId} requires further action. Please redirect accordingly.`,
  };

  // Send the constructed error response to the client
  res.status(redirectError.status).json(redirectError);
};

// Example usage assuming the following task response with default error status code 400: 
const taskResponse: ITask = {
  data: {},
  error: {
    status: 400,
    name: "BadRequest",
    message: "Invalid request.",
  },
  taskId: 3,
};

if(taskResponse.taskId === 3)
  convertToRedirectError(taskResponse, res);

```

##






