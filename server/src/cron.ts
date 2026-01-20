import { Cron } from "@shared/types";
import { BunRequest } from "bun";
import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const CRON_ID = "nas-sync-processQueue";
const DEFAULT_CRON_TIME = "* * * * *";
const CRON_CMD =
  `cd ${process.env.SERVER_HOME} && bun run processQueue # ${CRON_ID}`;

function normalize(crontab: string): string[] {
  return crontab
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);
}

async function getCrontab(): Promise<string[]> {
  try {
    const { stdout } = await execAsync("crontab -l");
    return normalize(stdout);
  } catch {
    // No crontab exists yet
    return [];
  }
}

async function writeCrontab(lines: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn("crontab", ["-"], {
        stdio: ["pipe", "inherit", "inherit"],
        });

        child.stdin.write(lines.join("\n") + "\n");
        child.stdin.end();

        child.on("error", reject);
        child.on("exit", code => {
        if (code === 0) resolve();
        else reject(new Error(`crontab exited with code ${code}`));
        });
    });
}

async function viewCronJob(): Promise<string | null> {
  const lines = await getCrontab();
  return lines.find(l => l.includes(CRON_ID)) ?? null;
}

async function createOrUpdateCronJob(cron: string): Promise<void> {
  const lines = await getCrontab();

  const filtered = lines.filter(l => !l.includes(CRON_ID));
  filtered.push(cron);

  await writeCrontab(filtered);
}

async function removeCronJob(): Promise<void> {
  const lines = await getCrontab();
  const filtered = lines.filter(l => !l.includes(CRON_ID));

  if (filtered.length !== lines.length) {
    await writeCrontab(filtered);
  }
}

export async function getCron(): Promise<Cron> {
    const cron = await viewCronJob();
    const exists = cron !== null;
    return {
        time: cron ? cron.split("cd")[0] : DEFAULT_CRON_TIME,
        exists
    }
}

export async function setCron(req: BunRequest): Promise<Cron> {
    const {time} = await req.json() as {time: string};
    
    const cron = `${time} ${CRON_CMD}`;
    await createOrUpdateCronJob(cron);
    return {
        time,
        exists: true
    }
}

export async function deleteCron(): Promise<Cron> {
    await removeCronJob();
    return {
        time: DEFAULT_CRON_TIME,
        exists: false
    }
}