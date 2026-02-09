export type FileEntry {
  name: string;
  isDirectory: boolean;
  fullPath: string;
  size?: string;
  queueStatus?: 'queued' | 'downloading' | 'completed' | 'failed';
}

export type FileListingResponse {
  currentPath: string;
  entries: FileEntry[];
}

export type QueueItem {
  id: number;
  position: number;
  remote_path: string;
  local_path: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  size: string;
  completed: string;
}

export type QueueResponse {
  items: QueueItem[];
  count: number;
}

export type Cron {
  time: string;
  exists: boolean;
}

export type QueueItemCreate {
  remote_path: string;
  local_path: string;
  size: string;
}