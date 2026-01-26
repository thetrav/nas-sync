import { $ } from "bun";
import { formatBytes } from "./fileListing";
import { ServerError } from "./ServerError";
import { FileEntry, FileListingResponse } from "@shared/types";
import { DownloadJob } from "./queue";
import { readFileSync } from 'node:fs';
let currentPath = process.env.REMOTE_ROOT ?? "/";
import Client from 'ssh2-sftp-client';

const config = {
  host: process.env.SERVER_URL,
  port: 22,
  username: process.env.USER_NAME,
  privateKey: readFileSync(process.env.KEY_PATH!)
}

export class SFTP {

  async listFolderContents(path: string): Promise<FileEntry[]> {
    const client = new Client()
    try {
      await client.connect(config)
      const data = await client.list(path);
      return data.map(fi => ({
        name: fi.name,
        isDirectory: fi.type == 'd',
        fullPath: `${path}/${fi.name}`,
        size: formatBytes(fi.size)
      }))
    } catch (error) {
      throw new Error(`Failed to list directory ${path}: ${error}`);
    } finally {
      client.end();
    }
  }

  async listSftp(req: Request): Promise<FileListingResponse> {
    const remoteRoot = process.env.REMOTE_ROOT;

    if (!remoteRoot) {
      throw new ServerError("REMOTE_ROOT not configured", 500);
    }

    // Handle navigation requests
    const url = new URL(req.url);
    const pathParam = url.searchParams.get("path");

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

    const entries = await this.listFolderContents(currentPath);

    // Check queue status for each file
    const entriesWithQueueStatus = entries.map((entry) => {
      if (entry.isDirectory) {
        return entry;
      }

      // Calculate corresponding local path
      const localBase = process.env.LOCAL_ROOT || "/tmp";
      const relativeRemotePath = entry.fullPath.replace(
        process.env.REMOTE_ROOT || "/",
        "",
      );
      const localPath = require("path").join(localBase, relativeRemotePath);
      
      // Check if file is in queue
      const queueItem = DownloadJob.findByPath(entry.fullPath, localPath);
      const queueStatus = queueItem?.status as 'queued' | 'downloading' | 'completed' | 'failed';
      
      return {
        ...entry,
        queueStatus: queueStatus || undefined
      };
    });

    return {
      currentPath,
      entries: entriesWithQueueStatus,
    };
  }

  async downloadFile(job: DownloadJob, progressFn: (transferred: number) => unknown ): Promise<void> {
    const client = new Client();
    
    try {
      await client.connect(config);
      
      const localDir = require("path").dirname(job.local_path);
      await $`mkdir -p ${localDir}`;
      
      await client.fastGet(job.remote_path, job.local_path, {
        concurrency: parseInt(process.env.CONCURRENCY ?? '1'),
        step: progressFn
      });
    } catch (error) {
      throw new Error(`Failed to download ${job.remote_path} to ${job.local_path}: ${error}`);
    } finally {
      client.end();
    }
  }
}
