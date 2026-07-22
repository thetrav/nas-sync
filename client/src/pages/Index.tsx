import { FileListingPanel } from '@/components/FileListingPanel';
import { TransferQueue } from '@/components/TransferQueue';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import { useMobileLayout } from '@/hooks/use-mobile';
import { HardDrive, Cloud, ArrowDownToLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { downloadLocalFileUrl } from '@/Api';

type PanelId = 'local' | 'remote' | 'transfer';

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
    createFolder,
  } = useFileTransfer();

  const isMobileLayout = useMobileLayout();
  const [activePanel, setActivePanel] = useState<PanelId>('local');

  const handleDownload = (path: string) => {
    const a = document.createElement('a');
    a.href = downloadLocalFileUrl(path);
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const tabs: { id: PanelId; icon: typeof HardDrive; label: string }[] = [
    { id: 'local', icon: HardDrive, label: 'Local' },
    { id: 'remote', icon: Cloud, label: 'Remote' },
    { id: 'transfer', icon: ArrowDownToLine, label: 'Transfers' },
  ];

  if (isMobileLayout) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold">File Transfer</h1>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">v1.0</span>
          </div>
          <div className="flex border-t border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePanel === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePanel(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1">
          {activePanel === 'local' && (
            <div className="p-4">
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
                onCreateFolder={createFolder}
                onDownload={handleDownload}
                showDownload
                noInternalScroll
                wrapText
              />
            </div>
          )}
          {activePanel === 'remote' && (
            <div className="p-4">
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
                noInternalScroll
                wrapText
              />
            </div>
          )}
          {activePanel === 'transfer' && (
            <div className="p-4">
              <TransferQueue
                items={transfers}
                onDelete={deleteTransfer}
                onRefresh={refreshQueue}
                loading={queueLoading}
                error={queueError}
                noInternalScroll
              />
            </div>
          )}
        </main>
      </div>
    );
  }

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
            onCreateFolder={createFolder}
            onDownload={handleDownload}
            showDownload
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
