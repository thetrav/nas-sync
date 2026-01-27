import { $ } from "bun";
import { rm, mkdir, cp } from "fs/promises";
import path from "path";

const root = process.cwd();

const clientDir = path.join(root, "client");
const clientDist = path.join(clientDir, "dist");
const serverUi = path.join(root, "server", "ui");

async function main() {
  console.log("▶ Building client...");
  await $`bun run build`.cwd(clientDir);

  console.log("▶ Replacing server/ui...");
  await rm(serverUi, { recursive: true, force: true });
  await mkdir(serverUi, { recursive: true });
  await cp(clientDist, serverUi, { recursive: true });

  console.log("▶ Building Docker image...");
  await $`docker build -t thetrav/nas-sync .`;

  console.log("✅ Done");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
