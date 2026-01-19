import { useState } from 'react';
import { getQueue } from './Api';
import { Queue } from './components/Queue';
import { LocalFiles } from './components/LocalFiles';
import { RemoteFiles } from './components/RemoteFiles';
import type { QueueItem } from '@shared/types';

function App() {
  const [localPath, setLocalPath] = useState<string>('');
  const [items, setItems] = useState<QueueItem[]>([]);
  
  const refreshQueue = async () => {
    try {
      const response = await getQueue();
      setItems(response?.items ?? []);
    } catch (error) {
      console.error('Failed to refresh queue:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <Queue items={items} refreshQueue={refreshQueue} />
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: '1', marginRight: '10px' }}>
          <LocalFiles 
            currentPath={localPath}
            setCurrentPath={setLocalPath}
          />
        </div>
        <div style={{ flex: '1', marginLeft: '10px' }}>
          <RemoteFiles 
            localPath={localPath}
            refreshQueue={refreshQueue}
          />
        </div>
      </div>
    </div>
  );
}

export default App
