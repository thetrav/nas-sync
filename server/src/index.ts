import express from "express";
import { SFTP } from "./sftp.ts";
import { listLocal } from "./localFileSystem.ts";
import { queueList, queueEnqueue, removeFromQueue } from "./queue.ts";
import { dbHandler } from "./requestHandlers.ts";
import { init } from "./db.ts";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;
const app = express();

const sftp = new SFTP();
init();

const api = express.Router();

api.use(express.json());

// API routes (must come before static files)
api.get(
  "/sftp",
  dbHandler((req) => sftp.listSftp(req)),
);
api.get("/local", dbHandler(listLocal));
// api.post('/local/create', dbHandler(createLocalFolder));
api.get("/queue", dbHandler(queueList));
api.post("/queue", dbHandler(queueEnqueue));
api.delete(
  "/queue/:id",
  dbHandler((req) => {
    const id = Number(req.params.id);
    return removeFromQueue(id);
  }),
);

// Handle API miss
api.use("/api/*", (req, res) => {
  console.log("API miss", req.path);
  res.status(404).send();
});

app.use("/api", api);
// Serve static files from ui directory
app.use(express.static(path.join(__dirname, "../ui")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
