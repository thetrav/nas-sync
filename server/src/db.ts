import { Database } from "bun:sqlite";
import { BunRequest } from "bun";
import { ServerError } from "./ServerError";
import { QueueItem } from "@shared/types";

export const db = new Database("mydb.sqlite", { create: true });

db.query(
  `create table if not exists download_queue (
    id integer primary key,
    position integer,
    remote_path text not null,
    local_path text not null,
    status text not null default 'queued',
    pid integer,
    created_at datetime default current_timestamp,
    started_at datetime,
    completed_at datetime
  );`,
).run();

export class DownloadQueue implements QueueItem {
  id: number;
  position: number;
  remote_path: string;
  local_path: string;
  status: "queued" | "downloading" | "completed" | "failed";
  pid?: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;

  constructor(
    id: number,
    position: number,
    remote_path: string,
    local_path: string,
    status: "queued" | "downloading" | "completed" | "failed",
  ) {
    this.id = id;
    this.position = position;
    this.remote_path = remote_path;
    this.local_path = local_path;
    this.status = status;
    this.created_at = new Date().toISOString();
  }

  static all() {
    return db
      .query("select * from download_queue order by position asc")
      .as(DownloadQueue)
      .all();
  }

  static create(remote_path: string, local_path: string) {
    // Get next position
    const { count } = db
      .query("select count(*) as count from download_queue")
      .get() as { count: number };
    const position = count + 1;

    const { lastInsertRowid } = db
      .query(
        `insert into download_queue (position, remote_path, local_path, status) values ($position, $remote_path, $local_path, 'queued')`,
      )
      .run({
        $position: position,
        $remote_path: remote_path,
        $local_path: local_path,
      });
    return new DownloadQueue(
      Number(lastInsertRowid),
      position,
      remote_path,
      local_path,
      "queued",
    );
  }

  static findByPath(remote_path: string, local_path: string) {
    return db
      .query(
        "select * from download_queue where remote_path = $remote_path and local_path = $local_path",
      )
      .as(DownloadQueue)
      .get({ $remote_path: remote_path, $local_path: local_path });
  }

  static updateStatus(id: number, status: string, pid?: number) {
    const updateFields = ["status = $status"];
    const params: { $status: string; $id: number; $pid?: number } = {
      $status: status,
      $id: id,
    };

    if (status === "downloading") {
      updateFields.push("started_at = current_timestamp");
    }
    if (status === "completed" || status === "failed") {
      updateFields.push("completed_at = current_timestamp");
    }
    if (pid) {
      updateFields.push("pid = $pid");
      params.$pid = pid;
    }

    db.query(
      `update download_queue set ${updateFields.join(", ")} where id = $id`,
    ).run(params);
  }

  static remove(id: number) {
    db.query("delete from download_queue where id = $id").run({ $id: id });
    // Reorder remaining items
    db.query(
      "update download_queue set position = position - 1 where position > (select position from download_queue where id = $id)",
    ).run({ $id: id });
  }
}

export function queueList() {
  const items = DownloadQueue.all();

  return {
    items: items as QueueItem[],
    count: items.length,
  };
}

export async function queueEnqueue(req: BunRequest) {
  const form = (await req.json()) as {
    remote_path: string;
    local_path: string;
  };
  const remotePath = form.remote_path;
  const localPath = form.local_path;

  if (!remotePath || !localPath) {
    throw new ServerError("remote_path and local_path are required", 400);
  }

  // Check if already in queue
  const existing = DownloadQueue.findByPath(remotePath, localPath);
  if (existing) {
    return existing;
  }

  return DownloadQueue.create(remotePath, localPath);
}

export async function startFirstQueued() {
  // Find first item with status 'queued'
  const item = db
    .query(
      "select * from download_queue where status = 'queued' order by position asc limit 1",
    )
    .as(DownloadQueue)
    .get();

  if (!item?.id) {
    throw new ServerError("No queued items found", 404);
  }

  // Update status to 'downloading' and get a process ID
  const pid = Math.floor(Math.random() * 100000);
  DownloadQueue.updateStatus(item.id, "downloading", pid);

  // In a real implementation, we'd start the background process here
  console.log(
    `Starting download process for ${item.remote_path} -> ${item.local_path} with PID ${pid}`,
  );

  return {
    success: true,
    pid: pid,
    message: `Started downloading ${item.remote_path}`,
  };
}

export function removeFromQueue(id: number) {
  DownloadQueue.remove(id);
  return { success: true };
}
