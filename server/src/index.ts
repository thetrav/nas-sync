import { listSonarr } from "./listSonarr";
import { SFTP } from "./sftp";
import { listLocal, createLocalFolder } from "./localFileSystem";
import {
  queueList,
  queueEnqueue,
  removeFromQueue
} from "./queue";
import { dbHandler } from "./requestHandlers";
import { deleteCron, getCron, setCron } from "./cron";
const port = Number(process.env.PORT) || 3000;

const sftp = new SFTP();

Bun.serve({
  port,
  routes: {
    "/tv": listSonarr,
    "/sftp": dbHandler((req) => sftp.listSftp(req)),
    "/local": dbHandler(listLocal),
    "/local/create": dbHandler(createLocalFolder),
    "/queue": {
      GET: dbHandler(queueList),
      POST: dbHandler(queueEnqueue),
    },
    "/queue/:id": {
      DELETE: dbHandler((req) => {
        const id = Number(req.params.id);
        return removeFromQueue(id);
      }),
    },
    "/cron": {
      GET: dbHandler(getCron),
      POST: dbHandler(setCron),
      DELETE: dbHandler(deleteCron)
    }
  },
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${port}`);
