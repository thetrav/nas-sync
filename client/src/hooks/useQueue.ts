import { getQueue, enqueueFile as apiEnqueue, removeFromQueue } from "@/Api";
import { QueueItem, QueueItemCreate, } from "@shared/types";
import { useState, useCallback } from "react";

export function useQueue() {
  const [transfers, setTransfers] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState<boolean>(false);
  const [queueError, setQueueError] = useState<string | null>(null);

  const refreshQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const response = await getQueue();
      setTransfers(response.items);
    } catch (e) {
      setQueueError(e);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  const enqueueFile = useCallback(async (item: QueueItemCreate) => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      await apiEnqueue(item);
    } catch (e) {
      setQueueError(e);
    } finally {
      setQueueLoading(false);
    }
    await refreshQueue();
  }, []);

  const deleteTransfer = useCallback(async (id: number) => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      await removeFromQueue(id);
    } catch (e) {
      setQueueError(e);
    } finally {
      setQueueLoading(false);
    }
    await refreshQueue();
  }, []);

  return {
    transfers,
    setTransfers,
    refreshQueue,
    enqueueFile,
    deleteTransfer,
    queueLoading,
    queueError
  };
}
