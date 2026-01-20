export interface FileEntry {
  name: string;
  isDirectory: boolean;
  fullPath: string;
  size?: string;
  queueStatus?: 'queued' | 'downloading' | 'completed' | 'failed';
}

export interface FileListingResponse {
  currentPath: string;
  entries: FileEntry[];
  rootPath: string;
}

export interface QueueItem {
  id: number;
  position: number;
  remote_path: string;
  local_path: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  pid?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface QueueResponse {
  items: QueueItem[];
  count: number;
}

export interface Cron {
  time: string;
  exists: boolean;
}