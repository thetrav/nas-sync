import { useState } from 'react';
import { getLocalFiles } from '../Api';
import type { FileEntry } from '@shared/types';
import { Table } from './Table';
import { TableCell } from './TableCell';

interface LocalFilesProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

export function LocalFiles({ currentPath, setCurrentPath }: LocalFilesProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async (path?: string) => {
    setLoading(true);
    try {
      const response = await getLocalFiles(path);
      if (response) {
        setEntries(response.entries);
        setCurrentPath(response.currentPath);
      }
    } catch (error) {
      console.error('Failed to fetch local files:', error);
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
      <h1>Local Files</h1>
      <button onClick={() => handleRefresh()} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      
      {currentPath && (
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Current path: {currentPath}
        </p>
      )}
      
      {displayEntries.length > 0 ? (
        <Table headers={['Name', 'Size']}>
          {displayEntries.map((entry, index) => (
            <tr key={`${entry.name}-${index}`}>
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
            </tr>
          ))}
        </Table>
      ) : (
        <p style={{ marginTop: '16px' }}>No files found</p>
      )}
    </div>
  );
}