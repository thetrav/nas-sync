import { withDb } from "./db";
import { formatBytes } from "./fileListing";
import { DownloadJob } from "./queue";
import { SFTP } from "./sftp";


async function allJobs(): Promise<DownloadJob[]> {
  return withDb(null, async () => DownloadJob.all());
}

async function updateJob(job: DownloadJob) {
  return withDb(null, async () => job.update());
}

async function processQueue() {
  const jobs = await allJobs();
  console.log(`${jobs.length} Jobs`)
  for (const job of jobs) {
    if (job.status === "queued") {
      console.log(`SCP: ${job.remote_path} to ${job.local_path}`);
      job.status = "downloading";
      updateJob(job);
      
      const sftp = new SFTP();
      try {
        await sftp.downloadFile(job, (transferred) => {
          job.completed = formatBytes(transferred);
          updateJob(job);
        });
        job.status = "completed";
        updateJob(job);
        process.exit(0)
      } catch (error) {
        console.error(`Download failed for job ${job.id}:`, error);
        job.status = "failed";
        updateJob(job);
        process.exit(1)
      }
    } else if (job.status === "downloading") {
      console.log(`already running`);
      process.exit(0);
    } else {
        console.log(`skipping status ${job.status}`)
    }
  }
  console.log("Nothing left in queue")
  process.exit(0)
}

processQueue().catch(console.error);
