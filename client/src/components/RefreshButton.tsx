import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RefreshButtonProps {
  onClick: () => void;
  title: string;
  loading: boolean;
}

export function RefreshButton({ onClick, title, loading }: RefreshButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    onClick();
  };

  return (
    <button 
      disabled={loading} 
      onClick={handleClick} 
      className={cn(
        "icon-button transition-all",
        isClicked && "scale-150 opacity-70"
      )} 
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