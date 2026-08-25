import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Re-apply the durable patch after DSH package reconciliation.
 * Set DSH_SESSION_REFERENCE_UX_AUTO_APPLY=0 to disable boot-time repair.
 */
function apply(ctx) {
  if (process.env.DSH_SESSION_REFERENCE_UX_AUTO_APPLY === "0") return;
  const child = spawnSync(process.execPath, [resolve(root, "bin/patch.mjs"), "apply", "--quiet"], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
  });
  if (child.status !== 0) {
    const detail = (child.stderr || child.stdout || `exit ${child.status}`).trim();
    console.warn(`[session-reference-ux-patch] automatic repair skipped: ${detail}`);
  } else if (child.stdout.trim()) {
    console.info(child.stdout.trim());
  }
}

export { apply };
