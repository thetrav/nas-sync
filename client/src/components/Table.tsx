import React from 'react';
import { TableHeader } from './TableRow';

interface TableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Table({ headers, children, style }: TableProps) {
  return (
    <table style={{ 
      borderCollapse: 'collapse', 
      width: '100%', 
      marginTop: '16px',
      ...style 
    }}>
      <thead>
        <TableHeader>
          {headers}
        </TableHeader>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  );
}