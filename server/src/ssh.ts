import { formatBytes } from "./fileListing.ts";
import { ServerError } from "./ServerError.ts";
import { DownloadJob } from "./queue.ts";
import { readFileSync } from "node:fs";
import { Client } from "ssh2";
import path from "node:path";
import type {
  FileEntry,
  FileListingResponse,
} from "../../shared/types/index.ts";
import { withDb } from "./db.ts";

const config = {
  host: process.env.SERVER_URL,
  port: 22,
  username: process.env.USER_NAME,
  privateKey: process.env.KEY_PATH
    ? readFileSync(process.env.KEY_PATH)
    : undefined,
};

export async function executeSshCommand(command: string): Promise<string[]> {
  const client = new Client();
  
  return new Promise((resolve, reject) => {
    client.on("error", err => {
      console.error("SSH client error:", err);
      reject(err);
    });

    client.connect(config).on('ready', () => {
      client.exec(command, (err, stream) => {
        if (err) {
          client.end();
          reject(new Error(`Failed to execute command: ${err}`));
          return;
        }

        let output = "";
        stream.on('close', (code: number) => {
          client.end();
          
          if (code !== 0) {
            reject(new Error(`Command failed with exit code ${code}`));
            return;
          }

          const lines = output.trim().split('\n');
          resolve(lines);
        }).on('data', (data: Buffer) => {
          output += data.toString();
        })?.stderr.on('data', (data: Buffer) => {
          output += data.toString();
        }).on('error', (data: Buffer) => {
          const error = data.toString();
          console.log("error", error)
          reject(error)
        });
      });
    });
  });
}

export async function listFolderContents(path: string): Promise<FileEntry[]> {
  console.log(`listing`, path);
  const command = `ls -la "${path}" | tail -n +2`;
  const lines = await executeSshCommand(command);
  
  const entries: FileEntry[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Parse ls -la output
    // Example: drwxr-xr-x 2 user group 4096 Jan 01 12:00 dirname
    //          -rw-r--r-- 1 user group 1024 Jan 01 12:00 filename
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9) continue;

    const permissions = parts[0];
    const size = parts[4];
    const name = parts.slice(8).join(' ');
    
    // Skip "." and ".." entries
    if (name === '.' || name === '..') continue;

    const isDirectory = permissions.startsWith('d');
    
    entries.push({
      name,
      isDirectory,
      fullPath: `${path}/${name}`,
      size: formatBytes(isDirectory ? 0 : parseInt(size) || 0),
    });
  }

  return entries;
}

export async function list(params: {path: string}): Promise<FileListingResponse> {
  const remoteRoot = process.env.REMOTE_ROOT;

  if (!remoteRoot) {
    throw new ServerError("REMOTE_ROOT not configured", 500);
  }

  // Handle navigation requests
  const pathParam = params.path;

  let currentPath = process.env.REMOTE_ROOT ?? "/";

  if (pathParam) {
    // Update current path for navigation
    if (pathParam === "..") {
      // Go up one directory
      const parts = currentPath.split("/");
      parts.pop();
      currentPath = parts.join("/") || "/";
    } else {
      // Navigate into subdirectory
      currentPath = pathParam.startsWith("/")
        ? pathParam
        : `${currentPath}/${pathParam}`;
    }
  }

  const entries = await listFolderContents(currentPath);

  // Check queue status for each file
  const entriesWithQueueStatus = [];
  for (const entry of entries) {
    if (entry.isDirectory) {
      entriesWithQueueStatus.push(entry);
      continue;
    }

    // Calculate corresponding local path
    const localBase = process.env.LOCAL_ROOT || "/tmp";
    const relativeRemotePath = entry.fullPath.replace(
      process.env.REMOTE_ROOT || "/",
      "",
    );
    const localPath = path.join(localBase, relativeRemotePath);

    // Check if file is in queue
    const queueItem = await withDb(null, async () => await DownloadJob.findByPath(entry.fullPath, localPath));
    const queueStatus = queueItem?.status!;

    entriesWithQueueStatus.push({
      ...entry,
      queueStatus: queueStatus || undefined,
    });
  }

  // Sort final entries: directories first, then files, case-insensitive
  entriesWithQueueStatus.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  return {
    currentPath,
    entries: entriesWithQueueStatus,
  };
}