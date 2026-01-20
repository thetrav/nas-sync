import { $ } from "bun";
import { parseLsLine, formatBytes } from "./fileListing";
import { ServerError } from "./ServerError";
import { FileEntry } from "@shared/types";
import { DownloadQueue } from "./db";

let currentPath = process.env.REMOTE_ROOT ?? "/";

export class SFTP {
  createScript(path: string): string {
    return `cd ${path}\nls -la\nquit`;
  }

  async executeScript(script: string): Promise<string> {
    const serverUrl = process.env.SERVER_URL;

    if (!serverUrl) {
      throw new Error("Server URL not configured");
    }

    return await $`echo "${script}" | sftp ${serverUrl}`.text();
  }

  parseScriptExecution(result: string, basePath = "/pool/public"): FileEntry[] {
    const lines = result.split("\n").map((l) => l.trim());
    const entries: {
      name: string;
      isDirectory: boolean;
      fullPath: string;
      size?: string;
    }[] = [];

    lines.forEach((line) => {
      // Skip sftp prompts and empty lines
      if (line.startsWith("sftp>") || line === "") {
        return;
      }

      const parsed = parseLsLine(line);
      if (!parsed) {
        console.log("warning: cannot parse line, skipping", line);
        return;
      }
      const { name, permissions, size } = parsed;

      // Skip . and .. entries
      if (name === "." || name === "..") {
        return;
      }

      const isDir = permissions.startsWith("d");
      const fullPath = `${basePath}/${name}`;

      entries.push({
        name: name,
        isDirectory: isDir,
        fullPath: fullPath,
        size: isDir ? "" : formatBytes(size),
      });
    });
    return entries;
  }

  async listFolderContents(path: string): Promise<FileEntry[]> {
    try {
      const script = this.createScript(path);
      const result = await this.executeScript(script);
      return this.parseScriptExecution(result, path);
    } catch (error) {
      throw new Error(`Failed to list directory ${path}: ${error}`);
    }
  }

  async listSftp(req: Request) {
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
        process.env.REMOTE_ROOT || "/pool/public",
        "",
      );
      const localPath = require("path").join(localBase, relativeRemotePath);
      
      // Check if file is in queue
      const queueItem = DownloadQueue.findByPath(entry.fullPath, localPath);
      const queueStatus = queueItem?.status as 'queued' | 'downloading' | 'completed' | 'failed';
      
      return {
        ...entry,
        queueStatus: queueStatus || undefined
      };
    });

    return {
      currentPath,
      entries: entriesWithQueueStatus,
      remoteRoot,
    };
  }
}
