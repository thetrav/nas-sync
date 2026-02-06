import { useLocal } from "./useLocal";
import { useRemote } from "./useRemote";
import { useQueue } from "./useQueue";

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
