import { useState, useCallback } from "react";
import type {
  QueueResponse,
  FileListingResponse,
  FileEntry,
  QueueItem,
  QueueItemCreate,
} from "@shared/types";
import { useLocal } from "./useLocal";
import { useRemote } from "./useRemote";

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

  return {
    localPath,
    remotePath,
    localFiles,
    remoteFiles,
    transfers,
    navigateLocal,
    navigateRemote,
    refreshLocal,
    refreshRemote,
    refreshQueue,
    enqueueFile,
    deleteTransfer,
  };
}
