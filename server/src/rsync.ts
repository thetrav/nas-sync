import { spawn } from "node:child_process";
import { mkdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { DownloadJob } from "./queue.ts";

export async function downloadFile(
  job: DownloadJob,
  progressFn: (transferred: number) => unknown,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const localDir = path.dirname(job.local_path);
    mkdirSync(localDir, { recursive: true });

    // Track local size (rsync resumes automatically)
    let lastReported = 0;
    let lastTick = 0;

    const sshArgs = [
      "-i",
      process.env.KEY_PATH ?? "",
      "-p",
      "22",
      "-o",
      "StrictHostKeyChecking=no",
    ].filter(Boolean);

    const rsyncArgs = [
      "-az",
      "--partial",
      "--append-verify",
      "--info=progress2",
      "-e",
      `ssh ${sshArgs.join(" ")}`,
      `${process.env.USER_NAME}@${process.env.SERVER_URL}:${job.remote_path}`,
      job.local_path,
    ];

    const rsync = spawn("rsync", rsyncArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    rsync.stdout.on("data", (data: Buffer) => {
      const now = Date.now();
      if (now - lastTick < 1000) return; // throttle to ~1s
      lastTick = now;

      // rsync --info=progress2 emits lines like:
      // "  123,456,789  42%   12.34MB/s    0:01:23"
      const match = data.toString().match(/^\s*([\d,]+)/m);
      if (!match) return;

      const bytes = parseInt(match[1].replace(/,/g, ""), 10);
      if (bytes > lastReported) {
        lastReported = bytes;
        progressFn(bytes);
      }
    });

    rsync.stderr.on("data", () => {
      // rsync uses stderr for some progress output; ignore
    });

    rsync.on("error", (err) => {
      reject(new Error(`Failed to start rsync: ${err.message}`));
    });

    rsync.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`rsync exited with code ${code}`));
        return;
      }

      // Final size report
      if (existsSync(job.local_path)) {
        const finalSize = statSync(job.local_path).size;
        progressFn(finalSize);
      }

      resolve();
    });
  });
}
