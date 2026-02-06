import { FileListingPanel } from '@/components/FileListingPanel';
import { TransferQueue } from '@/components/TransferQueue';
import { useFileTransfer } from '@/hooks/useFileTransfer';

const Index = () => {
  const {
    localPath,
    localFiles,
    localLoading,
    localError,
    navigateLocal,
    refreshLocal,
    remotePath,
    remoteFiles,
    remoteLoading,
    remoteError,
    navigateRemote,
    refreshRemote,
    transfers,
    queueLoading,
    queueError,
    refreshQueue,
    enqueueFile,
    deleteTransfer,
  } = useFileTransfer();

  return (
    <div className="h-screen w-screen bg-background flex flex-col p-4 gap-4">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold">File Transfer</h1>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">v1.0</span>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Local panel */}
        <div className="flex-1 min-w-0">
          <FileListingPanel
            title="Local"
            icon="local"
            files={localFiles}
            currentPath={localPath}
            onRefresh={refreshLocal}
            onNavigate={navigateLocal}
            loading={localLoading}
            error={localError}
            localPath={localPath}
            remotePath={remotePath}
          />
        </div>

        {/* Remote panel */}
        <div className="flex-1 min-w-0">
          <FileListingPanel
            title="Remote"
            icon="remote"
            files={remoteFiles}
            currentPath={remotePath}
            onRefresh={refreshRemote}
            onNavigate={navigateRemote}
            onEnqueue={enqueueFile}
            loading={remoteLoading}
            error={remoteError}
            showEnqueue
            localPath={localPath}
            remotePath={remotePath}
          />
        </div>
      </div>

      {/* Transfer queue */}
      <div className="h-64 flex-shrink-0">
        <TransferQueue
          items={transfers}
          onDelete={deleteTransfer}
          onRefresh={refreshQueue}
          loading={queueLoading}
          error={queueError}
        />
      </div>
    </div>
  );
};

export default Index;
