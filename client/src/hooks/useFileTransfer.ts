import { useLocal } from "./useLocal";
import { useRemote } from "./useRemote";
import { useQueue } from "./useQueue";
import { useEffect } from "react";

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
    enqueueFile,
    deleteTransfer,
    queueLoading,
    queueError
  } = useQueue();

  // refresh everything once on initial load
   useEffect(() => {
    refreshLocal();
    refreshRemote();
    refreshQueue();
  }, []);


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
