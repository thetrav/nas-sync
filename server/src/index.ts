import { SFTP } from "./sftp";
import { listLocal, createLocalFolder } from "./localFileSystem";
import { queueList, queueEnqueue, removeFromQueue } from "./queue";
import { dbHandler } from "./requestHandlers";
import { init } from "./db";
const port = Number(process.env.PORT) || 3000;

const sftp = new SFTP();
init();
Bun.serve({
  port,
  routes: {
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
  },
  fetch(req) {
    const path = new URL(req.url).pathname;
    if(path.startsWith("/api")) {
      console.log("API miss", path)
      return new Response(null, {status: 404});
    }
    const file = Bun.file(`./ui${path == "/" ? "/index.html" : path}`);
    return new Response(file);
  },
});

console.log(`Server running on http://localhost:${port}`);
