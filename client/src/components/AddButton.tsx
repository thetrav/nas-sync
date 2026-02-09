import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type AddButtonProps {
  onClick: () => void;
  label: string;
  disabled: boolean;
  onFileIconClick?: () => void;
  alwaysVisible?: boolean;
}

export function AddButton({ onClick, label, disabled, onFileIconClick, alwaysVisible = false }: AddButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    onFileIconClick?.();
    onClick();
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "enqueue-button transition-all",
        alwaysVisible 
          ? "opacity-70 hover:opacity-100" 
          : "opacity-0 group-hover:opacity-70",
        isClicked && "scale-150 opacity-70"
      )}
      title={label}
    >
      <Plus className="w-3 h-3" />
    </button>
  );
}