import { cn } from '@/lib/utils';
import { useState } from 'react';

type BreadcrumbButtonProps {
  onClick: () => void;
  label: string;
  disabled: boolean;
  isLast?: boolean;
  className?: string;
}

export function BreadcrumbButton({ onClick, label, disabled, isLast = false, className }: BreadcrumbButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    onClick();
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "hover:text-foreground transition-all flex-shrink-0",
        isLast ? 'text-foreground' : 'text-muted-foreground',
        isClicked && "scale-150 opacity-70",
        className
      )}
    >
      {label}
    </button>
  );
}