import { Trash2, ArrowDownToLine } from 'lucide-react';
import { QueueItem } from "@shared/types";
import { cn } from '@/lib/utils';
import { useRef, useEffect, useState } from 'react';
import { RefreshButton } from './RefreshButton';

interface TransferQueueProps {
  items: QueueItem[];
  onDelete: (id: number) => void;
  onRefresh: () => void;
  loading: boolean;
  error: string;
}

const statusLabels: Record<QueueItem['status'], string> = {
  queued: 'Pending',
  downloading: 'Transferring',
  completed: 'Complete',
  failed: 'Error',
};

export function TransferQueue({ items, onDelete, onRefresh, loading, error }: TransferQueueProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [clickedDeleteId, setClickedDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [items]);

  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  return (
    <div className="panel h-full">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4 text-primary" />
          <h2 className="panel-title">Transfer Queue</h2>
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </div>
        <RefreshButton 
          onClick={onRefresh} 
          title="Refresh queue" 
          loading={loading} 
        />
      </div>
      
      <div ref={scrollContainerRef} className="panel-content scrollbar-thin">
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
                      item.status === 'queued' && 'status-pending',
                      item.status === 'downloading' && 'status-transferring',
                      item.status === 'completed' && 'status-complete',
                      item.status === 'failed' && 'status-error'
                    )}
                  >
                    {statusLabels[item.status]}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Remote</p>
                    <p className="text-sm font-mono truncate" title={item.remote_path}>
                      {item.remote_path}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Local</p>
                    <p className="text-sm font-mono truncate" title={item.local_path}>
                      {item.local_path}
                    </p>
                  </div>
                </div>
                
                {item.status === 'downloading' && item.completed !== undefined && (
                  <div className="w-20 flex-shrink-0">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-status-transferring transition-all duration-300"
                        style={{ width: `${item.completed}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {item.completed}%
                    </p>
                  </div>
                )}
                
                <button
                  disabled={loading}
                  onClick={() => {
                    setClickedDeleteId(item.id);
                    setTimeout(() => setClickedDeleteId(null), 200);
                    onDelete(item.id);
                  }}
                  className={cn(
                    "icon-button text-destructive hover:text-destructive hover:bg-destructive/10 transition-all",
                    clickedDeleteId === item.id && "scale-150 opacity-70"
                  )}
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
