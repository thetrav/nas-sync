import { getLocalFiles, createLocalFolder } from "@/Api";
import { FileEntry } from "@shared/types";
import { useState, useCallback } from "react";

export function useLocal() {
  const [localPath, setLocalPath] = useState("");
  const [localFiles, setLocalFiles] = useState<FileEntry[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<{message: string} | null>(null);
  const refreshLocal = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const response = await getLocalFiles(localPath);
      setLocalFiles(response.entries);
      setLocalPath(response.currentPath);
    } catch (e) {
      setLocalError(e);
    } finally {
      setLocalLoading(false);
    }
  }, [localPath]);

  const navigateLocal = useCallback(async (path: string) => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const response = await getLocalFiles(path);
      setLocalFiles(response.entries);
      setLocalPath(response.currentPath);
    } catch (e) {
      setLocalError(e);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (folderName: string) => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      await createLocalFolder(localPath, folderName);
      await refreshLocal();
    } catch (e) {
      setLocalError(e);
    } finally {
      setLocalLoading(false);
    }
  }, [localPath, refreshLocal]);

  return {
    localPath,
    setLocalPath,
    localFiles,
    setLocalFiles,
    navigateLocal,
    refreshLocal,
    localLoading,
    localError,
    createFolder,
  };
}
