import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type DownloadButtonProps = {
  onClick: () => void;
  label: string;
  disabled: boolean;
}

export function DownloadButton({ onClick, label, disabled }: DownloadButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
    onClick();
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "enqueue-button transition-all",
        "opacity-0 group-hover:opacity-70",
        isClicked && "scale-150 opacity-70"
      )}
      title={label}
    >
      <Download className="w-3 h-3" />
    </button>
  );
}
