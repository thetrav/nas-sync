import { Trash2, ArrowDownToLine } from 'lucide-react';
import { QueueItem } from "@shared/types";
import { cn } from '@/lib/utils';
import { useRef, useEffect, useState, useMemo } from 'react';
import { RefreshButton } from './RefreshButton';
import { Switch } from '@/components/ui/switch';

type TransferQueueProps = {
  items: QueueItem[];
  onDelete: (id: number) => void;
  onRefresh: () => void;
  loading: boolean;
  error: {message: string} | null;
  noInternalScroll?: boolean;
}

const statusLabels: Record<QueueItem['status'], string> = {
  queued: 'Pending',
  downloading: 'Transferring',
  completed: 'Complete',
  failed: 'Error',
};

export function TransferQueue({ items, onDelete, onRefresh, loading, error, noInternalScroll = false }: TransferQueueProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [clickedDeleteId, setClickedDeleteId] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('transferQueueAutoRefresh');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('transferQueueAutoRefresh', String(autoRefresh));
  }, [autoRefresh]);

  const priorityItemId = useMemo(() => {
    const downloading = items.find(i => i.status === 'downloading');
    if (downloading) return downloading.id;
    return items.find(i => i.status !== 'completed')?.id;
  }, [items]);

  useEffect(() => {
    if (!scrollContainerRef.current || priorityItemId === undefined) return;
    
    const targetRef = itemRefs.current.get(priorityItemId);
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [items, priorityItemId]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      onRefresh();
    }, 2000);

    return () => clearInterval(interval);
  }, [onRefresh, autoRefresh]);

  return (
    <div className="panel h-full">
      <div className="panel-header justify-between flex-wrap gap-y-2">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4 text-primary" />
          <h2 className="panel-title">Transfer Queue</h2>
          <span className="text-xs text-muted-foreground">({items.length})</span>
          {error && (
            <span className="text-sm text-destructive ml-2">{error.message}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
            title="Auto-refresh queue"
          />
          <RefreshButton 
            onClick={onRefresh} 
            title="Refresh queue" 
            loading={loading} 
          />
        </div>
      </div>
      
      <div ref={scrollContainerRef} className={cn("panel-content scrollbar-thin", noInternalScroll && "flex-1")}>
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No transfers in queue
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="queue-row"
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                  else itemRefs.current.delete(item.id);
                }}
              >
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
