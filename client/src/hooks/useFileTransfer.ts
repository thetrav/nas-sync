import { useLocal } from "./useLocal";
import { useRemote } from "./useRemote";
import { useQueue } from "./useQueue";
import { useEffect, useCallback } from "react";
import { QueueItemCreate } from "@shared/types";

export function useFileTransfer() {
  const {
    localPath,
    setLocalPath,
    localFiles,
    setLocalFiles,
    navigateLocal,
    refreshLocal,
    localLoading,
    localError,
  } = useLocal();
  const {
    remotePath,
    setRemotePath,
    remoteFiles,
    setRemoteFiles,
    navigateRemote,
    refreshRemote,
    remoteLoading,
    remoteError,
  } = useRemote();

  const {
    transfers,
    setTransfers,
    refreshQueue,
    enqueueFile: apiEnqueueFile,
    deleteTransfer: apiDeleteTransfer,
    queueLoading,
    queueError
  } = useQueue();

  // refresh everything once on initial load
   useEffect(() => {
    refreshLocal();
    refreshRemote();
    refreshQueue();
  }, []);

  const enqueueFile = useCallback(async (item: QueueItemCreate) => {
    await apiEnqueueFile(item);
    
    // Update the remote file's queueStatus to queued
    setRemoteFiles(prevFiles => 
      prevFiles.map(file => 
        file.fullPath === item.remote_path 
          ? { ...file, queueStatus: 'queued' as const }
          : file
      )
    );
  }, [apiEnqueueFile, setRemoteFiles]);

  const deleteTransfer = useCallback(async (id: number) => {
    await apiDeleteTransfer(id);
    
    // Find the transfer being deleted and clear the corresponding file's queueStatus
    const transferToDelete = transfers.find(t => t.id === id);
    if (transferToDelete) {
      setRemoteFiles(prevFiles => 
        prevFiles.map(file => 
          file.fullPath === transferToDelete.remote_path 
            ? { ...file, queueStatus: undefined }
            : file
        )
      );
    }
  }, [apiDeleteTransfer, setRemoteFiles, transfers]);

  return {
    localPath,
    localFiles,
    localLoading,
    localError,
    navigateLocal,
    refreshLocal,
    remotePath,
    remoteFiles,
    remoteLoading,
    remoteError,
    navigateRemote,
    refreshRemote,
    transfers,
    queueLoading,
    queueError,
    refreshQueue,
    enqueueFile,
    deleteTransfer,
  };
}
