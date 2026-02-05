import { readdir, stat } from "fs/promises";
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

// export async function createLocalFolder(req: Request) {
//   const formData = await req.formData();
//   const folderName = formData.get("foldername") as string;

//   if (!folderName) {
//     throw new ServerError("Folder name is required", 400);
//   }

//   const newPath = join(currentLocalPath, folderName);
//   await mkdir(newPath);

//   return {
//     success: true,
//     message: `Folder '${folderName}' created successfully`,
//     path: newPath,
//   };
// }
