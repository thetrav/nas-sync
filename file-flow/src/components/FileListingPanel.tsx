import { RefreshCw, Folder, File, ChevronRight, Plus, HardDrive, Cloud } from 'lucide-react';
import { FileItem } from '@/types/files';
import { cn } from '@/lib/utils';

interface FileListingPanelProps {
  title: string;
  icon: 'local' | 'remote';
  files: FileItem[];
  currentPath: string;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
  onEnqueue?: (file: FileItem) => void;
  showEnqueue?: boolean;
}

function formatSize(bytes?: number): string {
  if (bytes === undefined) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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

export function FileListingPanel({
  title,
  icon,
  files,
  currentPath,
  onRefresh,
  onNavigate,
  onEnqueue,
  showEnqueue = false,
}: FileListingPanelProps) {
  const IconComponent = icon === 'local' ? HardDrive : Cloud;
  
  const pathParts = currentPath.split('/').filter(Boolean);
  
  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      onNavigate(file.path);
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
        <button onClick={onRefresh} className="icon-button" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Breadcrumb path */}
      <div className="px-4 py-2 bg-secondary/50 border-b border-panel-border flex items-center gap-1 text-sm overflow-x-auto scrollbar-thin">
        <button
          onClick={() => onNavigate('/')}
          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        >
          /
        </button>
        {pathParts.map((part, index) => (
          <span key={index} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <button
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
            {files.map((file) => (
              <div
                key={file.id}
                className="file-row group"
                onClick={() => handleFileClick(file)}
              >
                <div className="w-5 flex-shrink-0">
                  {file.type === 'folder' ? (
                    <Folder className="w-4 h-4 text-folder" />
                  ) : (
                    <File className="w-4 h-4 text-file" />
                  )}
                </div>
                <div className="flex-1 font-mono truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="w-24 text-right text-muted-foreground text-xs">
                  {file.type === 'folder' ? '—' : formatSize(file.size)}
                </div>
                <div className="w-32 text-right text-muted-foreground text-xs">
                  {formatDate(file.modified)}
                </div>
                {showEnqueue && file.type === 'file' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnqueue?.(file);
                    }}
                    className="enqueue-button opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Add to queue"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
                {showEnqueue && file.type === 'folder' && <div className="w-8" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
