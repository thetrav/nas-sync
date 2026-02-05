import type {
  QueueResponse,
  FileListingResponse,
  QueueItem,
  QueueItemCreate,
} from "@shared/types";
const baseUrl = "/api";

function encodeQueryString(params: object): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

async function get<T>(path: string, params: object = {}): Promise<T> {
  const response = await fetch(
    `${baseUrl}${path}?${encodeQueryString(params)}`,
  );
  if (response.ok) {
    return (await response.json()) as T;
  } else {
    throw new Error("network failure");
  }
}

async function post<T>(path: string, data: object): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    return (await response.json()) as T;
  } else {
    throw new Error(`network failure`);
  }
}

async function del(path: string): Promise<boolean> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "DELETE",
  });
  return response.ok;
}

export async function getQueue(): Promise<QueueResponse> {
  return get<QueueResponse>("/queue");
}

export async function getLocalFiles(
  path?: string,
): Promise<FileListingResponse | undefined> {
  const params = path ? { path } : {};
  return get<FileListingResponse>("/local", params);
}

export async function getRemoteFiles(
  path?: string,
): Promise<FileListingResponse | undefined> {
  const params = path ? { path } : {};
  return get<FileListingResponse>("/ssh", params);
}

export async function removeFromQueue(id: number): Promise<boolean> {
  return del(`/queue/${id}`);
}

export async function enqueueFile(obj: QueueItemCreate): Promise<QueueItem> {
  return await post<QueueItem>("/queue", 
    obj
  );
}
