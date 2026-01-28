import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export let connection: Database;
const dbPath = process.env.QUEUE_DB_PATH ?? "queue.sqlite";

export async function init() {
  connection = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await connection.exec(`PRAGMA journal_mode = WAL`);
  await connection.exec(`PRAGMA busy_timeout = 5000`);
  await connection.exec(
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
  );
}

export function db() {
  if (!connection) {
    throw new Error("Database not initialized. Call init() first.");
  }
  return connection;
}

export async function withDb<I, T>(i: I, f: (args: I) => Promise<T>) {
  await init();
  try {
    await connection!.exec(`PRAGMA journal_mode = WAL`);
    await connection!.exec(`PRAGMA busy_timeout = 5000`);
    return await f(i);
  } finally {
    await connection!.close();
    connection = null;
  }
}
