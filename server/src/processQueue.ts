import { sleep } from "bun";
import { init, withDb } from "./db";
import { formatBytes } from "./fileListing";
import { DownloadJob } from "./queue";
import { SFTP } from "./sftp";


async function allJobs(): Promise<DownloadJob[]> {
  return withDb(null, async () => DownloadJob.all());
}

async function updateJob(job: DownloadJob) {
  return withDb(null, async () => job.update());
}

async function processQueueOnce() {
  const jobs = await allJobs();
  console.log(`${new Date().toISOString()} ${jobs.length} Jobs`)
  for (const job of jobs) {
    if (job.status === "queued") {
      console.log(`SCP: ${job.remote_path} to ${job.local_path}`);
      job.status = "downloading";
      updateJob(job);
      
      const sftp = new SFTP();
      try {
        let lastUpdate = new Date().getTime();
        await sftp.downloadFile(job, (transferred) => {
          const now = new Date().getTime();
          if(now - lastUpdate > 1000) {
            job.completed = formatBytes(transferred);
            updateJob(job);
            lastUpdate = now;
          }
        });
        job.status = "completed";
        updateJob(job);
        return
      } catch (error) {
        console.error(`Download failed for job ${job.id}:`, error);
        job.status = "failed";
        updateJob(job);
        return
      }
    } else if (job.status === "downloading") {
      console.log(`already running`);
      return
    } else {
        console.log(`skipping status ${job.status}`)
    }
  }
  console.log("Nothing left in queue")
}

init();
while (true) {
  await processQueueOnce();
  await sleep(1_000);
}