# Task Handler

## Overview

This module is designed to handle and execute a sequence of tasks based on provided specifications. It orchestrates the task execution process, handling tasks one after another, and making use of cached data when necessary.

This task handling module is structured to execute tasks efficiently, support dependency management between tasks through caching, and provide essential error handling to ensure robustness. It's a flexible solution adaptable to various sequential task execution scenarios.


```
npm i jrd_task_handler
```

----


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

  handleResponse(result, res);
};
```

## Description

### Sample Endpoint: `taskEndpoint`

The `taskEndpoint` function is an asynchronous function that acts as a handler for an Express.js endpoint, designed to process HTTP requests.

#### Workflow

- **Request Handling**: 
  - Extracts the request arguments from `req.body`, assuming a JSON payload, which will be used as input for tasks.
  
- **Task Execution**:
  - Utilizes `taskHandlerWrapper` to manage the execution flow. It takes:
    - `taskHandler`: The core function that coordinates task execution using requested arguments and task specifications.
    - `requestArgs`: The arguments extracted from the incoming HTTP request.
    - `registerTasksSpecsList`: A list of task specifications defining what tasks to run and their configurations.

- **Response Handling**:
  - Sends back the result to the client using `handleResponse`, adjusting the HTTP response to reflect the task execution outcome.

## Key Components

### 1. `taskHandlerWrapper`

This utility function is likely designed to wrap the core task execution (`taskHandler`) with additional logic, possibly including error handling, logging, or other middleware functionalities. It orchestrates the main task execution process.

### 2. Task Specification: `registerTasksSpecsList`

This is a list of the task specifications (`registerTasksSpecsList`), which outlines what tasks should be executed, in what order, and with what configurations.

#### Example

```typescript
/**
 * This is an example of the specifications for each task used by the task loader
 */
export const registerTasksSpecsList: Array<ITaskHandlerSpecs> = [
  {
    taskId: 1,
    taskName: "checkEmailExists",
    task: checkEmailExists,
    requestArgs: {
      requestArgsKeys: ["email"],
    },
  },
  {
    taskId: 2,
    taskName: "getApiCredentials",
    task: getApiCredentials,
    taskReturnData: {
      cacheData: false,
    },
  },
  {
    taskId: 3,
    taskName: "createAccount",
    task: createAccount,
    requestArgs: {
      requestArgsKeys: ["email", "password"],
    },
    taskReturnData: {
      cacheData: true,
    },
  },
  ...
]
```

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

### 3. `handleResponse(result: ITask, res: Response)`

This helper function is responsible for returning the results of task execution to the client via the HTTP response (`res`). It formats and sends the outcome of the task handler back to the requester. In general, the `taskHandler` function is designed to return an object with a status code of 400, indicating an error scenario, which is handled by a try/catch block as described in the following examples. However, you have the flexibility to replace it with a function that returns a different response based on specific business logic conditions.

```typescript
// Task 1 - Check email
export const checkEmailExists = async (email: string) => {
  console.log(email);
  let emailExists: boolean = false;

  return new Promise((resolve, reject) => {
    emailExists = false;
    // Simulate an asynchronous operation
    setTimeout(() => {
      try {
        if (emailExists) {
          throw new Error("An account with the provided email already exists");
        }
        resolve(emailExists);
      } catch (error) {
        reject(error);
      }
    }, 1000);
  });
};

// Task 2 - Get API credentials
export const getApiCredentials = async () => {
  let apiCredentials: unknown = undefined;

  return new Promise((resolve, reject) => {
    apiCredentials = { token: "<some token>" };
    setTimeout(() => {
      try {
        if (!apiCredentials) {
          throw new Error(
            "An error occurred while getting the API credentials"
          );
        }
        resolve(apiCredentials);
      } catch (error) {
        reject(error);
      }
    }, 2000);
  });
};
```

### Implementing a different response handler

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
  taskId: 2,
};

if(taskResponse.taskId === 2)
  convertToRedirectError(taskResponse, res);

```

##






