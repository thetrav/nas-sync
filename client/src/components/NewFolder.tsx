import { useState, useRef, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { AddButton } from './AddButton';

interface NewFolderProps {
  disabled: boolean;
  onCreateFolder: (folderName: string) => void;
}

export function NewFolder({ disabled, onCreateFolder }: NewFolderProps) {
  const [showInput, setShowInput] = useState(false);
  const [folderName, setFolderName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    setShowInput(true);
    setFolderName('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      setShowInput(false);
    } else if (e.key === 'Escape') {
      setFolderName('');
      setShowInput(false);
    }
  };

  const handleInputBlur = () => {
    if (!folderName.trim()) {
      setShowInput(false);
    }
  };

  const handleCreateClick = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName('');
      setShowInput(false);
    }
  };

  const handleCancelClick = () => {
    setFolderName('');
    setShowInput(false);
  };

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  return (
    <>
      <ChevronRight className="w-3 h-3 text-muted-foreground" />
      {showInput ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={folderName}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            placeholder="New folder name..."
            className="px-2 py-0.5 text-sm bg-background border border-border rounded font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-w-0 flex-shrink-0"
          />
          {folderName.trim() && (
            <AddButton
              disabled={disabled}
              onClick={handleCreateClick}
              label="Create folder"
              alwaysVisible
            />
          )}
          <button
            onClick={handleCancelClick}
            className="text-red-500 hover:text-red-600 transition-colors p-1"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </>
      ) : (
        <AddButton
          disabled={disabled}
          onClick={handleAddClick}
          label="New folder"
          alwaysVisible
        />
      )}
    </>
  );
}