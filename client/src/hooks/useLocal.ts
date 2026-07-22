import { getLocalFiles, createLocalFolder } from "@/Api";
import { useFileCache } from "./useFileCache";
import { useCallback } from "react";

export function useLocal() {
  const cache = useFileCache("localFileCache", getLocalFiles);

  const createFolder = useCallback(async (folderName: string) => {
    await createLocalFolder(cache.path, folderName);
    await cache.refresh();
  }, [cache.path, cache.refresh]);

  return {
    localPath: cache.path,
    setLocalPath: cache.setPath,
    localFiles: cache.files,
    setLocalFiles: cache.setFiles,
    navigateLocal: cache.navigate,
    refreshLocal: cache.refresh,
    localLoading: cache.loading,
    localError: cache.error,
    createFolder,
  };
}
