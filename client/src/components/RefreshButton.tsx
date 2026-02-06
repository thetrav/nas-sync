import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onClick: () => void;
  title: string;
  loading: boolean;
}

export function RefreshButton({ onClick, title, loading }: RefreshButtonProps) {
  return (
    <button 
      disabled={loading} 
      onClick={onClick} 
      className="icon-button" 
      title={title}
    >
      <RefreshCw 
        className={cn(
          "w-4 h-4",
          loading && "animate-spin"
        )} 
      />
    </button>
  );
}