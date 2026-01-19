import { useState } from 'react';
import { removeFromQueue, startFirstQueued } from '../Api';
import type { QueueItem } from '@shared/types';
import { Table } from './Table';
import { TableCell } from './TableCell';

interface QueueProps {
  refreshQueue: () => Promise<void>;
  items: QueueItem[];
}

export function Queue({ items, refreshQueue }: QueueProps) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshQueue();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: number) => {
    try {
      const success = await removeFromQueue(id);
      if (success) {
        // Refresh queue to show updated list
        refreshQueue();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      const result = await startFirstQueued();
      console.log('Download started:', result);
      // Refresh queue after starting to show updated status
      await refreshQueue();
    } catch (error) {
      console.error('Failed to start download:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Queue</h1>
      <div style={{ marginBottom: '16px' }}>
        <button onClick={handleRefresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button 
          onClick={handleStart}
          disabled={loading || items.length === 0}
          style={{ 
            marginLeft: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            padding: '4px 8px',
            cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Start
        </button>
      </div>
      
      {items.length > 0 ? (
        <Table headers={['Status', 'Remote Path', 'Local Path', 'Created', 'Actions']}>
          {items.map((item) => (
            <tr key={item.id}>
              <TableCell style={{ 
                color: item.status === 'completed' ? 'green' : 
                       item.status === 'failed' ? 'red' : 
                       item.status === 'downloading' ? 'blue' : 
                       item.status === 'queued' ? 'white' : 'black'
              }}>
                {item.status}
              </TableCell>
              <TableCell>{item.remote_path}</TableCell>
              <TableCell>{item.local_path}</TableCell>
              <TableCell>{item.created_at}</TableCell>
              <TableCell>
                <button 
                  style={{ 
                    marginRight: '4px', 
                    padding: '4px 8px', 
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px'
                  }}
                  onClick={() => handleRemove(item.id)}
                >
                  Remove
                </button>
              </TableCell>
            </tr>
          ))}
        </Table>
      ) : (
        <p style={{ marginTop: '16px' }}>No items in queue</p>
      )}
    </div>
  );
}