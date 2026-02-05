import express from "express";
import { listLocal } from "./localFileSystem.ts";
import { queueList, queueEnqueue, removeFromQueue } from "./queue.ts";
import { get, post, del } from "./requestHandlers.ts";
import path from "path";
import { fileURLToPath } from "url";
import { list } from "./ssh.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number(process.env.PORT) || 3000;
const app = express();

const api = express.Router();

api.use(express.json());

// API routes (must come before static files)
api.get("/ssh",get(list),);
api.get("/local", get(listLocal));
api.get("/queue", get(queueList));
api.post("/queue", post(queueEnqueue));
api.delete("/queue/:id", del(removeFromQueue));

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
