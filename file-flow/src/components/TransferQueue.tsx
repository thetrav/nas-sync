import { RefreshCw, Trash2, ArrowDownToLine } from 'lucide-react';
import { TransferItem } from '@/types/files';
import { cn } from '@/lib/utils';

interface TransferQueueProps {
  items: TransferItem[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const statusLabels: Record<TransferItem['status'], string> = {
  pending: 'Pending',
  transferring: 'Transferring',
  complete: 'Complete',
  error: 'Error',
};

export function TransferQueue({ items, onDelete, onRefresh }: TransferQueueProps) {
  return (
    <div className="panel h-full">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4 text-primary" />
          <h2 className="panel-title">Transfer Queue</h2>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <button onClick={onRefresh} className="icon-button" title="Refresh queue">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="panel-content scrollbar-thin">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No transfers in queue
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="queue-row">
                <div className="flex-shrink-0">
                  <span
                    className={cn(
                      'status-badge',
                      item.status === 'pending' && 'status-pending',
                      item.status === 'transferring' && 'status-transferring',
                      item.status === 'complete' && 'status-complete',
                      item.status === 'error' && 'status-error'
                    )}
                  >
                    {statusLabels[item.status]}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Remote</p>
                    <p className="text-sm font-mono truncate" title={item.remotePath}>
                      {item.remotePath}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Local</p>
                    <p className="text-sm font-mono truncate" title={item.localPath}>
                      {item.localPath}
                    </p>
                  </div>
                </div>
                
                {item.status === 'transferring' && item.progress !== undefined && (
                  <div className="w-20 flex-shrink-0">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-status-transferring transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {item.progress}%
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => onDelete(item.id)}
                  className="icon-button text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
