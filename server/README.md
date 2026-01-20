# server

# environment

`.env` in the root folder does not get checked in and is used to provide the app with its environment

```
TODO: document
```

# Run

`bun run ./src/index.ts`

# Test

`bun test <file to test>`

omit <file to test> if you just want to run all tests

# Operation

## File Systems

The server can navigate local and remote file systems, sftp is the protocol used for remote.

## Queue Management

The server manages a queue of tasks that need to be executed.  Currently the only task is transferring files from a remote file system to a local file system via sftp

## Queue Execution

The server manages a cron job as a vehicle for processing tasks on the queue.  
The cron will execute once per minute by default but can be configured otherwise. 
The entrypoint for cron is processQueue.ts

The user cron is used, sudo is not enabled.