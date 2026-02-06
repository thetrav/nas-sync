import { getLocalFiles } from "@/Api";
import { FileEntry } from "@shared/types";
import { useState, useCallback } from "react";

export function useLocal() {
  const [localPath, setLocalPath] = useState("/");
  const [localFiles, setLocalFiles] = useState<FileEntry[]>([]);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const refreshLocal = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const response = await getLocalFiles(localPath);
      setLocalPath(response.currentPath);
      setLocalFiles(response.entries);
    } catch (e) {
      setLocalError(e);
    } finally {
      setLocalLoading(false);
    }
  }, [localPath]);

  const navigateLocal = useCallback((path: string) => {
    setLocalPath(path);
    refreshLocal();
  }, []);

  return {
    localPath,
    setLocalPath,
    localFiles,
    setLocalFiles,
    navigateLocal,
    refreshLocal,
    localLoading,
    localError,
  };
}
