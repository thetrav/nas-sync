import { Database } from "bun:sqlite";

export let connection:Database
const dbPath = process.env.QUEUE_DB_PATH ?? "queue.sqlite"

export function init() {
  connection = new Database(dbPath, { create: true });

  connection.run(`PRAGMA journal_mode = WAL`);
  connection.run(`PRAGMA busy_timeout = 5000`);
  connection.query(
    `create table if not exists download_queue (
      id integer primary key,
      position integer,
      remote_path text not null,
      local_path text not null,
      status text not null default 'queued',
      created_at datetime default current_timestamp,
      started_at datetime,
      completed_at datetime,
      size string,
      completed text
    );`,
  ).run();
}

export function db() {
  return connection!;
}

export async function withDb<I, T>(i: I, f: (args: I) => Promise<T>) {
  init();
  try {
    connection.run(`PRAGMA journal_mode = WAL`);
    connection.run(`PRAGMA busy_timeout = 5000`);
  return await f(i);
   } finally {
    connection.close();
   }
}