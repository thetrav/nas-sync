import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function TableRow({ children, style, className }: TableRowProps) {
  return (
    <tr 
      style={{ 
        ...style 
      }}
      className={className}
    >
      {children}
    </tr>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <tr style={{ borderBottom: '2px solid #ccc' }}>
      {React.Children.map(children, (child, index) => (
        <th 
          key={index}
          style={{ 
            padding: '8px', 
            textAlign: 'left', 
            backgroundColor: '#626262' 
          }}
        >
          {child}
        </th>
      ))}
    </tr>
  );
}