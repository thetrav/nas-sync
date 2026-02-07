import { getRemoteFiles } from "@/Api";
import { FileEntry } from "@shared/types";
import { useState, useCallback } from "react";

export function useRemote() {
  const [remotePath, setRemotePath] = useState("");
  const [remoteFiles, setRemoteFiles] = useState<FileEntry[]>([]);
  const [remoteLoading, setRemoteLoading] = useState<boolean>(false);
  const [remoteError, setRemoteError] = useState<{message: string} | null>(null);
  const refreshRemote = useCallback(async () => {
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const response = await getRemoteFiles(remotePath);
      setRemotePath(response.currentPath);
      setRemoteFiles(response.entries);
    } catch (e) {
      setRemoteError(e);
    } finally {
      setRemoteLoading(false);
    }
  }, [remotePath]);

  const navigateRemote = useCallback(async (path: string) => {
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const response = await getRemoteFiles(path);
      setRemotePath(response.currentPath);
      setRemoteFiles(response.entries);
    } catch (e) {
      setRemoteError(e);
    } finally {
      setRemoteLoading(false);
    }
  }, []);

  return {
    remotePath,
    setRemotePath,
    remoteFiles,
    setRemoteFiles,
    navigateRemote,
    refreshRemote,
    remoteLoading,
    remoteError,
  };
}
