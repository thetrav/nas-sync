import { init, withDb } from "./db.ts";
import { formatBytes } from "./fileListing.ts";
import { DownloadJob } from "./queue.ts";
import { downloadFile } from "./rsync.ts";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function allJobs(): Promise<DownloadJob[]> {
  return withDb(null, async () => await DownloadJob.all());
}

async function updateJob(job: DownloadJob) {
  return withDb(null, async () => { await job.update(); });
}

async function deleteJob(job: DownloadJob) {
  return withDb(null, async () => { await job.remove(); });
}

async function processQueueOnce() {
  const jobs = await allJobs();
  for (const job of jobs) {
    if (job.status === "queued" || job.status === "downloading") {
      console.log(`syncing: ${job.remote_path} to ${job.local_path}`);
      job.status = "downloading";
      await updateJob(job);

      try {
        let lastUpdate = new Date().getTime();
        await downloadFile(job, async (transferred) => {
          const now = new Date().getTime();
          if (now - lastUpdate > 1000) {
            job.completed = formatBytes(transferred);
            await updateJob(job);
            lastUpdate = now;
          }
        });
        job.status = "completed";
        job.completed_at = new Date().toISOString();
        await updateJob(job);
        return;
      } catch (error) {
        console.error(`Download failed for job ${job.id}:`, error);
        job.status = "failed";
        job.completed_at = new Date().toISOString();
        await updateJob(job);
        return;
      }
    } else if (job.status === "completed" || job.status == "failed" && job.completed_at) {
      if(new Date(job.completed_at!).getMilliseconds() < (new Date().getMilliseconds() - 1000*60*60*24)) {
        console.log(`removing old job ${job.remote_path} to ${job.local_path}`);
        await deleteJob(job);
      }
    }
  }
}

init();
while (true) {
  await processQueueOnce();
  await sleep(1_000);
}
