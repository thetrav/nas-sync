import type { QueueItem, QueueResponse, QueueItemCreate } from '@shared/types';
import {db} from "./db";
import { BunRequest } from 'bun';
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

  static create(obj: {remote_path: string, local_path: string, size: number}) {
    const {position} = db().query(`SELECT MAX(position) as position FROM ${table};`).get() as {position: number};
    db().query(`insert into ${table} (position, remote_path, local_path, status, created_at, started_at, completed_at, size, completed) 
        values ($position, $remote_path, $local_path, $status, $created_at, $started_at, $completed_at, $size, $completed)`).run(
            {
                $position: position,
                $remote_path: obj.remote_path,
                $local_path: obj.local_path,
                $status: 'queued',
                $created_at: new Date().toISOString(),
                $started_at: null,
                $completed_at: null,
                $size: obj.size,
                $completed: null
            }
        );
  }

    static all() {
      return db()
        .query(`${select} order by position asc`)
        .as(DownloadJob)
        .all();
    }

    static get(id: number) {
        return db()
        .query(
            `${select} where id = $id`,
        )
        .as(DownloadJob)
        .get({ $id: id });
    }

    static findByPath(remote_path: string, local_path: string) {
      return db()
        .query(
            `${select} where remote_path = $remote_path and local_path = $local_path`,
        )
        .as(DownloadJob)
        .get({ $remote_path: remote_path, $local_path: local_path });
    }

    update() {
        const updateFields = columns.map(c => `${c} = $${c}`).join(", ")
        const params: Record<string, any> = {};
        columns.forEach((key) => {
            params[`$${key}`] = this[key];
        })
        const up = db().prepare(
        `update ${table} set ${updateFields} where id = $id`,
        )
        db().transaction(p => up.run(p))(params);
    }

    remove() {
        db().query(
        `update ${table} set position = position - 1 where position > (select position from ${table} where id = $id)`,
        ).run({ $id: this.id });
        db().query(`delete from ${table} where id = $id`).run({ $id: this.id });
    }
}


export function queueList(): QueueResponse {
  const items = DownloadJob.all();

  return {
    items: items,
    count: items.length,
  };
}

export async function queueEnqueue(req: BunRequest) {
  const form = (await req.json()) as QueueItemCreate;
  const remotePath = form.remote_path;
  const localPath = form.local_path;

  if (!remotePath || !localPath) {
    throw new ServerError("remote_path and local_path are required", 400);
  }

  // Check if already in queue
  const existing = DownloadJob.findByPath(remotePath, localPath);
  if (existing) {
    return existing;
  }

  DownloadJob.create(form);
  return DownloadJob.findByPath(remotePath, localPath);
}

export function removeFromQueue(id: number) {
    DownloadJob.get(id)?.remove();
    return { success: true };
}
