import React from 'react';

interface TableCellProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function TableCell({ children, style, className }: TableCellProps) {
  return (
    <td 
      style={{ 
        padding: '8px',
        borderBottom: '1px solid #ddd',
        ...style 
      }}
      className={className}
    >
      {children}
    </td>
  );
}