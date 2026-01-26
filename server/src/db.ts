import { Database } from "bun:sqlite";

export const db = new Database("mydb.sqlite", { create: true });

db.query(
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
db.run(`PRAGMA journal_mode = WAL`);
db.run(`PRAGMA busy_timeout = 5000`);
