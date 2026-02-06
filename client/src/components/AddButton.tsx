import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AddButtonProps {
  onClick: () => void;
  label: string;
  disabled: boolean;
  onFileIconClick?: () => void;
}

export function AddButton({ onClick, label, disabled, onFileIconClick }: AddButtonProps) {
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
        "enqueue-button opacity-0 group-hover:opacity-70 transition-all",
        isClicked && "scale-150 opacity-70"
      )}
      title={label}
    >
      <Plus className="w-3 h-3" />
    </button>
  );
}