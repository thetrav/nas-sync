import { getQueue } from "@/Api";
import { QueueItem } from "@shared/types";
import { useState, useCallback } from "react";

export function useQueue() {
  const [transfersLoading, setTransfersLoading] = useState<boolean>();
  const [transfersError, setTransfersError] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<QueueItem[]>([]);

  const refreshQueue = useCallback(() => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const response = await getQueue();
      setRemoteFiles(response.entries);
    } catch (e) {
      setRemoteError(e);
    } finally {
      setRemoteLoading(false);
    }
  }, []);

  const enqueueFile = useCallback((file: FileItem) => {
    const newTransfer: TransferItem = {
      id: `t${Date.now()}`,
      status: "pending",
      remotePath: file.path,
      localPath: `/Downloads/${file.name}`,
      fileName: file.name,
    };
    setTransfers((prev) => [...prev, newTransfer]);
  }, []);

  const deleteTransfer = useCallback((id: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    transfers,
    setTransfers,
    refreshQueue,
    enqueueFile,
    deleteTransfer,
  };
}
