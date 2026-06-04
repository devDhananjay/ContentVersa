#!/usr/bin/env node
/**
 * Upload secrets/firebase-admin.json to EC2 and restart PM2.
 * Usage: node scripts/sync-firebase-admin-to-ec2.mjs [path-to-json]
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const localPath = process.argv[2] || join(root, "secrets", "firebase-admin.json");
const pem = process.env.EC2_PEM || join(process.env.HOME || "", "Downloads", "content.pem");
const host =
  process.env.EC2_HOST ||
  "ec2-user@ec2-52-66-204-66.ap-south-1.compute.amazonaws.com";

if (!existsSync(localPath)) {
  console.error(`Missing ${localPath}`);
  console.error("Download from Firebase Console → Service accounts → Generate new private key");
  process.exit(1);
}

const json = readFileSync(localPath, "utf8");
JSON.parse(json);

const remoteDir = "/home/ec2-user/ContentVersa/secrets";
const remoteFile = `${remoteDir}/firebase-admin.json`;

const scp = spawnSync(
  "scp",
  ["-i", pem, localPath, `${host}:${remoteFile}`],
  { stdio: "inherit" }
);
if (scp.status !== 0) process.exit(scp.status || 1);

const ssh = spawnSync(
  "ssh",
  [
    "-i",
    pem,
    host,
    `mkdir -p ${remoteDir} && chmod 700 ${remoteDir} && chmod 600 ${remoteFile} && cd ~/ContentVersa && grep -q '^FIREBASE_ADMIN_CREDENTIALS_FILE=' .env 2>/dev/null || echo 'FIREBASE_ADMIN_CREDENTIALS_FILE=/home/ec2-user/ContentVersa/secrets/firebase-admin.json' >> .env && cp -f .env build/.env && pm2 restart next-app`,
  ],
  { stdio: "inherit" }
);
process.exit(ssh.status || 0);
