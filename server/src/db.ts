import { Database } from "bun:sqlite";

export let connection:Database | null


export function init() {
  connection = new Database("mydb.sqlite", { create: true });

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
  connection.run(`PRAGMA journal_mode = WAL`);
  connection.run(`PRAGMA busy_timeout = 5000`);
  connection.close();
}

export function db() {
  return connection!;
}

export async function withDb<I, T>(i: I, f: (args: I) => Promise<T>) {
  connection = new Database("mydb.sqlite", { create: true });
  try {
  return await f(i);
   } finally {
    connection.close();
   }
}