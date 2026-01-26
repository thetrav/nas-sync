import { listSonarr } from "./listSonarr";
import { SFTP } from "./sftp";
import { listLocal, createLocalFolder } from "./localFileSystem";
import {
  queueList,
  queueEnqueue,
  removeFromQueue
} from "./queue";
import { jsonResponseWrapper } from "./wrapper";
import { deleteCron, getCron, setCron } from "./cron";
const port = Number(process.env.PORT) || 3000;

const sftp = new SFTP();

Bun.serve({
  port,
  routes: {
    "/tv": listSonarr,
    "/sftp": jsonResponseWrapper((req) => sftp.listSftp(req)),
    "/local": jsonResponseWrapper(listLocal),
    "/local/create": jsonResponseWrapper(createLocalFolder),
    "/queue": {
      GET: jsonResponseWrapper(queueList),
      POST: jsonResponseWrapper(queueEnqueue),
    },
    "/queue/:id": {
      DELETE: jsonResponseWrapper((req) => {
        const id = Number(req.params.id);
        return removeFromQueue(id);
      }),
    },
    "/cron": {
      GET: jsonResponseWrapper(getCron),
      POST: jsonResponseWrapper(setCron),
      DELETE: jsonResponseWrapper(deleteCron)
    }
  },
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${port}`);
