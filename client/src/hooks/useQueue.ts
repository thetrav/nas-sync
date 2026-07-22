import { getQueue, enqueueFile as apiEnqueue, removeFromQueue, isQueuePaused, pauseQueue, resumeQueue } from "@/Api";
import { QueueItem, QueueItemCreate } from "@shared/types";
import { useState, useCallback } from "react";

export function useQueue() {
  const [transfers, setTransfers] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState<boolean>(false);
  const [queueError, setQueueError] = useState<{ message: string } | null>(
    null,
  );
  const [queuePaused, setQueuePaused] = useState<boolean>(false);

  const refreshQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const response = await getQueue();
      setTransfers(response.items);
      setQueuePaused(await isQueuePaused());
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

  const togglePause = useCallback(async () => {
    setQueueError(null);
    try {
      if (queuePaused) {
        await resumeQueue();
      } else {
        await pauseQueue();
      }
      setQueuePaused(!queuePaused);
    } catch (e) {
      setQueueError(e);
    }
  }, [queuePaused]);

  return {
    transfers,
    setTransfers,
    refreshQueue,
    enqueueFile,
    deleteTransfer,
    queueLoading,
    queueError,
    queuePaused,
    togglePause,
  };
}
