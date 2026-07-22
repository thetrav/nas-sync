import { getRemoteFiles } from "@/Api";
import { useFileCache } from "./useFileCache";

export function useRemote() {
  const cache = useFileCache("remoteFileCache", getRemoteFiles);

  return {
    remotePath: cache.path,
    setRemotePath: cache.setPath,
    remoteFiles: cache.files,
    setRemoteFiles: cache.setFiles,
    navigateRemote: cache.navigate,
    refreshRemote: cache.refresh,
    remoteLoading: cache.loading,
    remoteError: cache.error,
  };
}
