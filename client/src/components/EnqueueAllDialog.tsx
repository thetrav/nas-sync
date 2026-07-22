import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { QueueItemCreate } from '@shared/types';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

type FileStatus = 'pending' | 'enqueuing' | 'queued' | 'failed';

type FileEntry = {
  item: QueueItemCreate;
  fileName: string;
  status: FileStatus;
  error?: string;
};

type EnqueueAllDialogProps = {
  onOpenChange: (open: boolean) => void;
  files: QueueItemCreate[];
  onEnqueue: (item: QueueItemCreate) => Promise<void>;
};

export function EnqueueAllDialog({ onOpenChange, files, onEnqueue }: EnqueueAllDialogProps) {
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const updateFileStatus = (index: number, status: FileStatus, error?: string) => {
    setFileEntries(prev =>
      prev.map((entry, i) => (i === index ? { ...entry, status, error } : entry))
    );
  };

  const enqueueWithRetry = async (item: QueueItemCreate, index: number, maxRetries = 3): Promise<boolean> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await onEnqueue(item);
        return true;
      } catch (err) {
        if (attempt === maxRetries - 1) {
          updateFileStatus(index, 'failed', err instanceof Error ? err.message : 'Unknown error');
          return false;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    return false;
  };

  const handleStart = async () => {
    setIsRunning(true);
    setFileEntries(
      files.map(item => ({
        item,
        fileName: item.remote_path.split('/').pop() || item.remote_path,
        status: 'pending' as FileStatus,
      }))
    );

    for (let i = 0; i < files.length; i++) {
      updateFileStatus(i, 'enqueuing');
      const success = await enqueueWithRetry(files[i], i);
      if (success) {
        updateFileStatus(i, 'queued');
      }
    }

    setIsRunning(false);
    setIsComplete(true);
  };

  const handleRetryFailed = async () => {
    setIsRunning(true);
    const failedIndices = fileEntries
      .map((entry, index) => (entry.status === 'failed' ? index : -1))
      .filter(index => index !== -1);

    for (const index of failedIndices) {
      updateFileStatus(index, 'enqueuing');
      const success = await enqueueWithRetry(fileEntries[index].item, index);
      if (success) {
        updateFileStatus(index, 'queued');
      }
    }

    setIsRunning(false);
    setIsComplete(true);
  };

  const handleClose = () => {
    if (!isRunning) {
      onOpenChange(false);
    }
  };

  const statusIcon = (status: FileStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'enqueuing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'queued':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const hasFailedFiles = fileEntries.some(entry => entry.status === 'failed');
  const allComplete = fileEntries.length > 0 && fileEntries.every(entry => entry.status === 'queued' || entry.status === 'failed');

  const displayEntries = fileEntries.length > 0
    ? fileEntries
    : files.map(item => ({
        item,
        fileName: item.remote_path.split('/').pop() || item.remote_path,
        status: 'pending' as FileStatus,
      }));

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="w-[66vw] max-h-[66vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enqueue All Files</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 gap-2">
          <div className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''} will be added to the queue
          </div>

          <div className="flex-1 border rounded-md p-2 min-h-0 overflow-auto">
            <div className="space-y-1">
              {displayEntries.map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded text-sm",
                    entry.status === 'enqueuing' && "bg-primary/10",
                    entry.status === 'failed' && "bg-destructive/10"
                  )}
                >
                  {statusIcon(entry.status)}
                  <span className="flex-1 truncate" title={entry.item.remote_path}>
                    {entry.fileName}
                  </span>
                  {entry.status === 'failed' && entry.error && (
                    <span className="text-xs text-destructive truncate max-w-32" title={entry.error}>
                      {entry.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRunning}
          >
            {isComplete ? 'Close' : 'Cancel'}
          </Button>
          {isComplete && hasFailedFiles && (
            <Button onClick={handleRetryFailed} disabled={isRunning}>
              Retry Failed
            </Button>
          )}
          {!isComplete && (
            <Button onClick={handleStart} disabled={isRunning || files.length === 0}>
              {isRunning ? 'Enqueuing...' : 'Start'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
