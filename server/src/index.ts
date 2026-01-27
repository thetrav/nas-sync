import { listSonarr } from "./listSonarr";
import { SFTP } from "./sftp";
import { listLocal, createLocalFolder } from "./localFileSystem";
import { queueList, queueEnqueue, removeFromQueue } from "./queue";
import { dbHandler } from "./requestHandlers";
import { deleteCron, getCron, setCron } from "./cron";
const port = Number(process.env.PORT) || 3000;

const sftp = new SFTP();

Bun.serve({
  port,
  routes: {
    "/api/tv": listSonarr,
    "/api/sftp": dbHandler((req) => sftp.listSftp(req)),
    "/api/local": dbHandler(listLocal),
    "/api/local/create": dbHandler(createLocalFolder),
    "/api/queue": {
      GET: dbHandler(queueList),
      POST: dbHandler(queueEnqueue),
    },
    "/api/queue/:id": {
      DELETE: dbHandler((req) => {
        const id = Number(req.params.id);
        return removeFromQueue(id);
      }),
    },
    "/api/cron": {
      GET: dbHandler(getCron),
      POST: dbHandler(setCron),
      DELETE: dbHandler(deleteCron),
    },
  },
  fetch(req) {
    const path = new URL(req.url).pathname;
    const file = Bun.file(`./ui${path == "/" ? "/index.html" : path}`);
    return new Response(file);
  },
});

console.log(`Server running on http://localhost:${port}`);
