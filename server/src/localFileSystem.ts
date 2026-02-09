import { readdir, stat, mkdir, access } from "fs/promises";
import { join } from "path";
import { formatBytes } from "./fileListing.ts";

// Store current local directory path in memory
let currentLocalPath = process.env.LOCAL_ROOT ?? "/tmp";

export async function listLocal(params: {path: string}) {
  console.log("listing", params.path);
  const pathParam = params.path;

  // Handle navigation requests
  if (pathParam) {
    if (pathParam === "..") {
      // Go up one directory
      const parts = currentLocalPath.split("/");
      parts.pop();
      currentLocalPath = parts.join("/") || "/";
    } else {
      // Navigate into subdirectory
      currentLocalPath = pathParam.startsWith("/")
        ? pathParam
        : join(currentLocalPath, pathParam);
    }
  }

  // Read directory contents
  const entries = await readdir(currentLocalPath, { withFileTypes: true });

  // Sort entries: directories first, then files, both alphabetically
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const fileEntries = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(currentLocalPath, entry.name);
      const stats = await stat(fullPath);
      const size = entry.isDirectory() ? "" : formatBytes(stats.size);

      return {
        name: entry.name,
        isDirectory: entry.isDirectory(),
        fullPath: fullPath,
        size: size,
      };
    }),
  );

  return {
    currentPath: currentLocalPath,
    entries: fileEntries,
    rootPath: process.env.LOCAL_ROOT ?? "/tmp",
  };
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function filterExistingFiles(remoteRoot: string, filePaths: string[]): Promise<string[]> {
  const localRoot = process.env.LOCAL_ROOT ?? "/tmp";
  const missingFiles: string[] = [];
  
  for (const filePath of filePaths) {
    const relativePath = filePath.replace(remoteRoot, "").replace(/^\//, "");
    const localPath = join(localRoot, relativePath);
    
    const exists = await fileExists(localPath);
    if (!exists) {
      missingFiles.push(filePath);
    }
  }
  
  return missingFiles;
}

export async function createLocalFolder(params: {path: string, name: string}) {
  const { path: targetPath, name: folderName } = params;
  
  if (!folderName) {
    throw new Error("Folder name is required");
  }
  
  const pathParts = targetPath.split('/').filter(Boolean);
  const nameParts = folderName.split('/').filter(Boolean);
  const allParts = [...pathParts, ...nameParts];
  const fullPath = '/' + allParts.join('/');
  
  await mkdir(fullPath);
  
  return { path: fullPath };
}
