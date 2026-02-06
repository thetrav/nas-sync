import { RefreshCw, Folder, File, ChevronRight, Plus, HardDrive, Cloud } from 'lucide-react';
import { FileEntry, QueueItemCreate } from "@shared/types";
import { cn } from '@/lib/utils';

interface FileListingPanelProps {
  title: string;
  icon: 'local' | 'remote';
  files: FileEntry[];
  currentPath: string;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
  onEnqueue?: (item: QueueItemCreate) => void;
  showEnqueue?: boolean;
  loading: boolean;
  error: string;
  localPath: string;
  remotePath: string;
}

function formatDate(date?: Date): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function filePath(currentPath: string, fileName: string) {
  const path = [currentPath];
  if(!currentPath.endsWith("/")) {
    path.push("/");
  }
  path.push(fileName);
  return path.join("");
}

export function FileListingPanel({
  title,
  icon,
  files,
  currentPath,
  onRefresh,
  onNavigate,
  onEnqueue,
  showEnqueue = false,
  loading,
  error,
  localPath,
  remotePath
}: FileListingPanelProps) {
  const IconComponent = icon === 'local' ? HardDrive : Cloud;
  
  const pathParts = currentPath.split('/').filter(Boolean);
  
  const handleFileClick = (file: FileEntry) => {
    if (file.isDirectory) {
      onNavigate(filePath(currentPath, file.name));
    }
  };
  
  const handlePathClick = (index: number) => {
    const newPath = '/' + pathParts.slice(0, index + 1).join('/');
    onNavigate(newPath);
  };
  
  return (
    <div className="panel h-full">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <IconComponent className={cn("w-4 h-4", icon === 'local' ? 'text-folder' : 'text-primary')} />
          <h2 className="panel-title">{title}</h2>
        </div>
        <button onClick={onRefresh} className="icon-button" title="Refresh" disabled={loading}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Breadcrumb path */}
      <div className="px-4 py-2 bg-secondary/50 border-b border-panel-border flex items-center gap-1 text-sm overflow-x-auto scrollbar-thin">
        <button
          disabled={loading}
          onClick={() => onNavigate('/')}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          /
        </button>
        {pathParts.map((part, index) => (
          <span key={index} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <button
              disabled={loading}
              onClick={() => handlePathClick(index)}
              className={cn(
                "hover:text-foreground transition-colors font-mono",
                index === pathParts.length - 1 ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {part}
            </button>
          </span>
        ))}
      </div>
      
      {/* File listing */}
      <div className="panel-content scrollbar-thin">
        {files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Empty directory
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div className="file-row border-b border-panel-border text-xs text-muted-foreground font-medium sticky top-0 bg-card">
              <div className="w-5" />
              <div className="flex-1">Name</div>
              <div className="w-24 text-right">Size</div>
              <div className="w-32 text-right">Modified</div>
              {showEnqueue && <div className="w-8" />}
            </div>
            
            {/* Files */}
            {files.map((file, i) => (
              <div
                key={i}
                className="file-row group"
                onClick={() => !loading && handleFileClick(file)}
              >
                <div className="w-5 flex-shrink-0">
                  {file.isDirectory ? (
                    <Folder className="w-4 h-4 text-folder" />
                  ) : (
                    <File className="w-4 h-4 text-file" />
                  )}
                </div>
                <div className="flex-1 font-mono truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="w-24 text-right text-muted-foreground text-xs">
                  {file.isDirectory ? '—' : file.size}
                </div>
                <div className="w-32 text-right text-muted-foreground text-xs">
                  {showEnqueue && file.queueStatus}
                </div>
                {showEnqueue && !file.isDirectory && (
                  <button
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnqueue?.({
                        remote_path: filePath(remotePath, file.name),
                        local_path: filePath(localPath, file.name),
                        size: file.size
                      });
                    }}
                    className="enqueue-button opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Add to queue"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
                {showEnqueue && file.isDirectory && <div className="w-8" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
