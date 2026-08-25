#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templateRoot = join(pluginRoot, "patches", "templates");
const checkout = process.env.DSH_DESKTOP_UNPACKED || "D:\\dsh\\DSH Desktop\\resources\\app.asar.unpacked";
const backupRoot = join(pluginRoot, "patches", "backups");
const manifestPath = join(backupRoot, "manifest.json");
const args = process.argv.slice(2);
const quiet = args.includes("--quiet");
const command = args.find((arg) => !arg.startsWith("-")) || "doctor";

const targets = [
  ["dsh-session-reference", "lib/index.js", "dsh-session-reference.index.js"],
  ["dsh-client-ui-reference", "lib/client.js", "dsh-client-ui-reference.client.js"],
  ["dsh-client-ui-input-trigger", "lib/client.js", "dsh-client-ui-input-trigger.client.js"],
  ["dsh-client-ui-workspace", "lib/client.js", "dsh-client-ui-workspace.client.js"],
  ["dsh-client-ui-conversation", "lib/client.js", "dsh-client-ui-conversation.client.js"],
].map(([pkg, relative, template]) => ({
  pkg,
  target: join(checkout, "node_modules", "@deepseek-ai", pkg, ...relative.split("/")),
  template: join(templateRoot, template),
}));

const sha = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const say = (text) => { if (!quiet) console.log(text); };

function manifest() {
  if (!existsSync(manifestPath)) return { version: 1, checkout, files: {} };
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}
function save(value) {
  mkdirSync(backupRoot, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function validateLayout() {
  const missing = targets.flatMap((item) => [item.target, item.template].filter((path) => !existsSync(path)));
  if (missing.length) throw new Error(`missing required files:\n${missing.join("\n")}`);
}

function doctor() {
  validateLayout();
  const state = targets.map((item) => ({
    package: item.pkg,
    status: sha(item.target) === sha(item.template) ? "patched" : "update-drift",
    target: item.target,
  }));
  for (const item of state) say(`${item.status.padEnd(12)} ${item.package}`);
  if (state.some((item) => item.status !== "patched")) process.exitCode = 2;
}

function applyPatch() {
  validateLayout();
  const state = manifest();
  let changed = 0;
  for (const item of targets) {
    const wanted = sha(item.template);
    const current = sha(item.target);
    if (current === wanted) continue;
    mkdirSync(backupRoot, { recursive: true });
    const backup = join(backupRoot, `${item.pkg}.${current}.js`);
    if (!existsSync(backup)) copyFileSync(item.target, backup);
    state.files[item.pkg] = { backup, originalSha256: current, patchedSha256: wanted, target: item.target };
    copyFileSync(item.template, item.target);
    if (sha(item.target) !== wanted) throw new Error(`verification failed for ${item.pkg}`);
    changed += 1;
  }
  save(state);
  say(changed ? `[session-reference-ux-patch] applied ${changed} file(s); restart DSH Desktop.` : "[session-reference-ux-patch] already current.");
}

function restore() {
  const state = manifest();
  let changed = 0;
  for (const item of targets) {
    const record = state.files[item.pkg];
    if (!record || !existsSync(record.backup)) continue;
    copyFileSync(record.backup, item.target);
    changed += 1;
  }
  say(`[session-reference-ux-patch] restored ${changed} file(s); restart DSH Desktop.`);
}

try {
  if (command === "apply") applyPatch();
  else if (command === "restore") restore();
  else if (command === "doctor") doctor();
  else throw new Error(`unknown command ${JSON.stringify(command)} (use apply, doctor, restore)`);
} catch (error) {
  console.error(`[session-reference-ux-patch] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
