import { FileEntry, FileListingResponse } from "@shared/types";
import { useState, useCallback, useRef } from "react";

type Fetcher = (path: string) => Promise<FileListingResponse>;

function loadMapFromStorage(key: string): Map<string, FileEntry[]> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();
    const entries: [string, FileEntry[]][] = JSON.parse(raw);
    return new Map(entries);
  } catch {
    return new Map();
  }
}

function loadPathFromStorage(key: string): string {
  try {
    return localStorage.getItem(`${key}_path`) ?? "";
  } catch {
    return "";
  }
}

function savePathToStorage(key: string, path: string) {
  try {
    localStorage.setItem(`${key}_path`, path);
  } catch {
    // silently ignore
  }
}

function saveToStorage(key: string, cache: Map<string, FileEntry[]>) {
  try {
    localStorage.setItem(key, JSON.stringify([...cache]));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function useFileCache(storageKey: string, fetcher: Fetcher) {
  const cacheRef = useRef<Map<string, FileEntry[]>>(loadMapFromStorage(storageKey));
  const [path, _setPath] = useState(() => loadPathFromStorage(storageKey));
  const [files, setFiles] = useState<FileEntry[]>(() => cacheRef.current.get(loadPathFromStorage(storageKey)) ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string } | null>(null);
  const inflightRef = useRef(0);

  const setPath = useCallback((value: string | ((prev: string) => string)) => {
    _setPath(prev => {
      const next = typeof value === "function" ? value(prev) : value;
      savePathToStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const navigate = useCallback(async (newPath: string) => {
    const cached = cacheRef.current.get(newPath);
    setFiles(cached ?? []);
    setPath(newPath);
    setError(null);

    const id = ++inflightRef.current;
    setLoading(true);
    try {
      const response = await fetcher(newPath);
      cacheRef.current.set(response.currentPath, response.entries);
      saveToStorage(storageKey, cacheRef.current);
      if (id === inflightRef.current) {
        setFiles(response.entries);
        setPath(response.currentPath);
      }
    } catch (e) {
      if (id === inflightRef.current) {
        setError(e as { message: string });
      }
    } finally {
      if (id === inflightRef.current) {
        setLoading(false);
      }
    }
  }, [storageKey, fetcher]);

  const refresh = useCallback(async () => {
    const id = ++inflightRef.current;
    setLoading(true);
    setError(null);
    try {
      cacheRef.current.delete(path);
      const response = await fetcher(path);
      cacheRef.current.set(response.currentPath, response.entries);
      saveToStorage(storageKey, cacheRef.current);
      if (id === inflightRef.current) {
        setFiles(response.entries);
        setPath(response.currentPath);
      }
    } catch (e) {
      if (id === inflightRef.current) {
        setError(e as { message: string });
      }
    } finally {
      if (id === inflightRef.current) {
        setLoading(false);
      }
    }
  }, [storageKey, path, fetcher]);

  return {
    path,
    setPath,
    files,
    setFiles,
    loading,
    error,
    navigate,
    refresh,
  };
}
