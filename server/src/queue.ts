import type { QueueItem, QueueResponse, QueueItemCreate } from '@shared/types';
import {db} from "./db";
import { Request } from 'express';
import { ServerError } from './ServerError';

const table = "download_queue";
const columns = ['id', 'position', 'remote_path', 'local_path', 'status', 'created_at', 'started_at', 'completed_at', 'size', 'completed'];

const select = `select ${columns.join(",")} from ${table}`;

export class DownloadJob implements QueueItem {
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

  constructor(obj: QueueItem) {
    this.id = obj.id;
    this.position = obj.position;
    this.remote_path = obj.remote_path;
    this.local_path = obj.local_path;
    this.status = obj.status;
    this.created_at = obj.created_at;
    this.started_at = obj.started_at;
    this.completed_at = obj.completed_at;
    this.size = obj.size;
    this.completed = obj.completed;
  }

  static async create(obj: {remote_path: string, local_path: string, size: number}) {
    const result = await db().get(`SELECT MAX(position) as position FROM ${table};`) as {position: number} | undefined;
    const position = result?.position || 0;
    await db().run(`insert into ${table} (position, remote_path, local_path, status, created_at, started_at, completed_at, size, completed) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            position,
            obj.remote_path,
            obj.local_path,
            'queued',
            new Date().toISOString(),
            null,
            null,
            obj.size,
            null
        );
  }

    static async all() {
      const rows = await db().all(`${select} order by position asc`);
      return rows.map(row => new DownloadJob(row as QueueItem));
    }

    static async get(id: number) {
        const row = await db().get(`${select} where id = ?`, id);
        return row ? new DownloadJob(row as QueueItem) : null;
    }

    static async findByPath(remote_path: string, local_path: string) {
      const row = await db().get(`${select} where remote_path = ? and local_path = ?`, remote_path, local_path);
      return row ? new DownloadJob(row as QueueItem) : null;
    }

    async update() {
        const updateFields = columns.map(c => `${c} = ?`).join(", ")
        const values = columns.map(key => this[key]);
        await db().run(`update ${table} set ${updateFields} where id = ?`, ...values, this.id);
    }

    async remove() {
        await db().run(
        `update ${table} set position = position - 1 where position > (select position from ${table} where id = ?)`,
        this.id
        );
        await db().run(`delete from ${table} where id = ?`, this.id);
    }
}


export async function queueList(): Promise<QueueResponse> {
  const items = await DownloadJob.all();

  return {
    items: items,
    count: items.length,
  };
}

export async function queueEnqueue(req: Request) {
  const form = req.body as QueueItemCreate;
  const remotePath = form.remote_path;
  const localPath = form.local_path;

  if (!remotePath || !localPath) {
    throw new ServerError("remote_path and local_path are required", 400);
  }

  // Check if already in queue
  const existing = await DownloadJob.findByPath(remotePath, localPath);
  if (existing) {
    return existing;
  }

  await DownloadJob.create(form);
  return await DownloadJob.findByPath(remotePath, localPath);
}

export async function removeFromQueue(id: number) {
    const job = await DownloadJob.get(id);
    if (job) {
        await job.remove();
    }
    return { success: true };
}
