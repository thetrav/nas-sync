import { DownloadJob } from "./queue";
import { SFTP } from "./sftp";

async function processQueue() {
  const jobs = DownloadJob.all();
  console.log(`${jobs.length} Jobs`)
  for (const job of jobs) {
    if (job.status === "queued") {
      console.log(`SCP: ${job.remote_path} to ${job.local_path}`);
      job.status = "downloading";
      job.update();
      
      const sftp = new SFTP();
      try {
        await sftp.downloadFile(job);
        console.log("done");
        job.status = "completed";
        job.update();
        process.exit(0)
      } catch (error) {
        console.error(`Download failed for job ${job.id}:`, error);
        job.status = "failed";
        job.update();
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
