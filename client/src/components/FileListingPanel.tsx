import { Folder, File, ChevronRight, Plus, HardDrive, Cloud, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { FileEntry, QueueItemCreate } from "@shared/types";
import { cn } from '@/lib/utils';
import { RefreshButton } from './RefreshButton';
import { BreadcrumbButton } from './BreadcrumbButton';
import { AddButton } from './AddButton';
import { DownloadButton } from './DownloadButton';
import { NewFolder } from './NewFolder';
import { useState, useMemo } from 'react';



type FileListingPanelProps  = {
  title: string;
  icon: 'local' | 'remote';
  files: FileEntry[];
  currentPath: string;
  onRefresh: () => void;
  onNavigate: (path: string) => void;
  onEnqueue?: (item: QueueItemCreate) => void;
  showEnqueue?: boolean;
  onDownload?: (path: string) => void;
  showDownload?: boolean;
  loading: boolean;
  error: {message: string} | null;
  localPath: string;
  remotePath: string;
  onCreateFolder?: (folderName: string) => void;
  noInternalScroll?: boolean;
  wrapText?: boolean;
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
  onDownload,
  showDownload = false,
  loading,
  error,
  localPath,
  remotePath,
  onCreateFolder,
  noInternalScroll = false,
  wrapText = false
}: FileListingPanelProps) {
  const IconComponent = icon === 'local' ? HardDrive : Cloud;
  const [clickedFolderIndex, setClickedFolderIndex] = useState<number | null>(null);
  const [clickedFileIconIndex, setClickedFileIconIndex] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{column: 'name' | 'modified'; order: 'desc' | 'asc'} | null>(null);
  
  const pathParts = currentPath.split('/').filter(Boolean);

  const sortedFiles = useMemo(() => {
    if (!sortConfig) {
      const folders = files.filter(f => f.isDirectory);
      const fileEntries = files.filter(f => !f.isDirectory);
      return [...folders, ...fileEntries];
    }
    
    return [...files].sort((a, b) => {
      if (sortConfig.column === 'name') {
        const cmp = a.name.localeCompare(b.name);
        return sortConfig.order === 'desc' ? -cmp : cmp;
      } else {
        const dateA = a.modified ? new Date(a.modified).getTime() : 0;
        const dateB = b.modified ? new Date(b.modified).getTime() : 0;
        return sortConfig.order === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });
  }, [files, sortConfig]);
  
  const handleFileClick = (file: FileEntry, index: number) => {
    if (file.isDirectory) {
      setClickedFolderIndex(index);
      setTimeout(() => setClickedFolderIndex(null), 200);
      onNavigate(filePath(currentPath, file.name));
    }
  };
  
  const handlePathClick = (index: number) => {
    const newPath = '/' + pathParts.slice(0, index + 1).join('/');
    onNavigate(newPath);
  };

  const handleCreateFolder = (folderName: string) => {
    onCreateFolder?.(folderName);
  };
  
  return (
    <div className="panel h-full">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <IconComponent className={cn("w-4 h-4", icon === 'local' ? 'text-folder' : 'text-primary')} />
          <h2 className="panel-title">{title}</h2>
          {error && (
            <span className="text-sm text-destructive ml-2">{error.message}</span>
          )}
        </div>
        <RefreshButton 
          onClick={onRefresh} 
          title="Refresh" 
          loading={loading} 
        />
      </div>
      
      {/* Breadcrumb path */}
      <div className="px-4 py-2 bg-secondary/50 border-b border-panel-border flex items-center gap-1 text-sm overflow-x-auto scrollbar-thin flex-wrap">
        <BreadcrumbButton 
          onClick={() => onNavigate('/')}
          label="/"
          disabled={loading}
        />
        {pathParts.map((part, index) => (
          <span key={index} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <BreadcrumbButton 
              onClick={() => handlePathClick(index)}
              label={part}
              disabled={loading}
              isLast={index === pathParts.length - 1}
              className="font-mono"
            />
          </span>
        ))}
        {icon === 'local' && (
          <NewFolder 
            disabled={loading}
            onCreateFolder={handleCreateFolder}
          />
        )}
      </div>
      
      {/* File listing */}
      <div className={cn("panel-content scrollbar-thin", noInternalScroll && "flex-1")}>
        {files.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Empty directory
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div className="file-row border-b border-panel-border text-xs text-muted-foreground font-medium sticky top-0 bg-card">
              <div className="w-5" />
              <button 
                className="flex-1 text-left flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() => setSortConfig(prev => {
                  if (prev?.column !== 'name') return { column: 'name', order: 'asc' };
                  if (prev.order === 'asc') return { column: 'name', order: 'desc' };
                  return null;
                })}
              >
                Name
                {sortConfig?.column === 'name' && sortConfig.order === 'desc' && <ArrowDown className="w-3 h-3 text-foreground" />}
                {sortConfig?.column === 'name' && sortConfig.order === 'asc' && <ArrowUp className="w-3 h-3 text-foreground" />}
              </button>
              <div className="w-24 text-right">Size</div>
              <button 
                className="w-32 text-right flex items-center justify-end gap-1 hover:text-foreground transition-colors"
                onClick={() => setSortConfig(prev => {
                  if (prev?.column !== 'modified') return { column: 'modified', order: 'desc' };
                  if (prev.order === 'desc') return { column: 'modified', order: 'asc' };
                  return null;
                })}
              >
                Modified
                {sortConfig?.column === 'modified' && sortConfig.order === 'desc' && <ArrowDown className="w-3 h-3 text-foreground" />}
                {sortConfig?.column === 'modified' && sortConfig.order === 'asc' && <ArrowUp className="w-3 h-3 text-foreground" />}
              </button>
              {showEnqueue && <div className="w-8" />}
              {showDownload && <div className="w-8" />}
            </div>
            
            {/* Files */}
            {sortedFiles.map((file, i) => (
              <div
                key={i}
                className="file-row group"
                onClick={() => !loading && handleFileClick(file, i)}
              >
                <div className="w-5 flex-shrink-0">
                  {file.isDirectory ? (
                    <Folder 
                      className={cn(
                        "w-4 h-4 text-folder transition-all",
                        clickedFolderIndex === i && "scale-150 opacity-70"
                      )} 
                    />
                  ) : (
                    <File 
                      className={cn(
                        "w-4 h-4 text-file transition-all",
                        clickedFileIconIndex === i && "scale-150 opacity-70"
                      )} 
                    />
                  )}
                </div>
                <div className={cn("flex-1 font-mono", wrapText ? "break-all" : "truncate")} title={file.name}>
                  {file.name}
                </div>
                <div className="w-24 text-right text-muted-foreground text-xs">
                  {file.isDirectory ? '—' : file.size}
                </div>
                <div className="w-32 text-right text-muted-foreground text-xs">
                  {file.modified ? new Date(file.modified).toLocaleDateString() : '—'}
                </div>
                {showEnqueue && <div className="w-8">{file.queueStatus}</div>}
                {showEnqueue && !file.isDirectory && !["queued", "downloading"].includes(file.queueStatus) && (
                  <AddButton
                    disabled={loading}
                    onClick={() => onEnqueue?.({
                      remote_path: filePath(remotePath, file.name),
                      local_path: filePath(localPath, file.name),
                      size: file.size
                    })}
                    label="Add to queue"
                    onFileIconClick={() => {
                      setClickedFileIconIndex(i);
                      setTimeout(() => setClickedFileIconIndex(null), 200);
                    }}
                  />
                )}
                {showEnqueue && file.isDirectory && <div className="w-8" />}
                {showDownload && !file.isDirectory && (
                  <DownloadButton
                    disabled={loading}
                    onClick={() => onDownload?.(filePath(currentPath, file.name))}
                    label="Download"
                  />
                )}
                {showDownload && file.isDirectory && <div className="w-8" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
