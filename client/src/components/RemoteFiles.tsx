import { useState } from 'react';
import { getRemoteFiles, enqueueFile } from '../Api';
import type { FileEntry } from '@shared/types';
import { Table } from './Table';
import { TableCell } from './TableCell';

interface RemoteFilesProps {
  localPath: string;
  refreshQueue: () => Promise<void>;
}

export function RemoteFiles({ localPath, refreshQueue }: RemoteFilesProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async (path?: string) => {
    setLoading(true);
    try {
      const response = await getRemoteFiles(path);
      if (response) {
        setEntries(response.entries);
        setCurrentPath(response.currentPath);
      }
    } catch (error) {
      console.error('Failed to fetch remote files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (fullPath: string) => {
    handleRefresh(fullPath);
  };

  const handleUpDirectory = () => {
    if (currentPath) {
      // Go up one directory
      const parts = currentPath.split('/');
      parts.pop();
      const upPath = parts.join('/');
      handleRefresh(upPath || '');
    }
  };

  const handleEnqueue = async (entry: FileEntry, localPath: string) => {
    try {
      const result = await enqueueFile({remote_path: entry.fullPath, local_path: `${localPath}/${entry.name}`, size: entry.size});
      if (result) {
        console.log('File enqueued successfully:', result);
        // Refresh queue after successful enqueue
        await refreshQueue();
      }
    } catch (error) {
      console.error('Failed to enqueue file:', error);
    }
  };

  

  const displayEntries = currentPath ? [
    {
      name: '..',
      isDirectory: true,
      fullPath: '',
      size: ''
    },
    ...entries
  ] : entries;

  return (
    <div>
      <h1>Remote Files</h1>
      <button onClick={() => handleRefresh()} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      
      {currentPath && (
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Current path: {currentPath}
        </p>
      )}
      
      {displayEntries.length > 0 ? (
        <Table headers={['', 'Name', 'Size', 'Actions']}>
          {displayEntries.map((entry, index) => (
            <tr key={`${entry.name}-${index}`}>
              <TableCell>
                {/* Queue Status - empty for folders */}
                {!entry.isDirectory && entry.queueStatus && (
                  <span style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}>
                    {entry.queueStatus}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {entry.isDirectory ? (
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (entry.name === '..') {
                        handleUpDirectory();
                      } else {
                        handleFolderClick(entry.fullPath);
                      }
                    }}
                    style={{ 
                      color: '#007bff', 
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    {entry.name}{entry.name !== '..' ? '/' : ''}
                  </a>
                ) : (
                  entry.name
                )}
              </TableCell>
              <TableCell>
                {entry.isDirectory ? '' : (entry.size || '0 B')}
              </TableCell>
              <TableCell>
                {!entry.isDirectory && !entry.queueStatus && (
                  <button 
                    style={{ 
                      marginRight: '4px', 
                      padding: '4px 8px', 
                      fontSize: '12px',
                      cursor: 'pointer',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px'
                    }}
                    onClick={() => handleEnqueue(entry, localPath)}
                  >
                    Enqueue
                  </button>
                )}
              </TableCell>
            </tr>
          ))}
        </Table>
      ) : (
        <p style={{ marginTop: '16px' }}>No files found</p>
      )}
    </div>
  );
}