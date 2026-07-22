#!/usr/bin/env -S node --experimental-strip-types
import { execSync } from "child_process";
import { rm, mkdir, cp } from "fs/promises";
import path from "path";

const root = process.cwd();

const clientDir = path.join(root, "client");
const clientDist = path.join(clientDir, "dist");
const serverUi = path.join(root, "server", "ui");

function run(command: string, cwd: string = root) {
  execSync(command, { cwd, stdio: "inherit" });
}

async function main() {
  console.log("▶ Building client...");
  run("npx vite build", clientDir);

  console.log("▶ Replacing server/ui...");
  await rm(serverUi, { recursive: true, force: true });
  await mkdir(serverUi, { recursive: true });
  await cp(clientDist, serverUi, { recursive: true });

  console.log("▶ Building Docker image...");
  run("docker build -t thetrav/nas-sync .");

  console.log("✅ Done");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
