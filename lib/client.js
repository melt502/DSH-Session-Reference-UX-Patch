// lib/client.js — dsh-session-reference-ux-patch client half.
//
// The actual UX patches live in the host half (lib/index.js), which runs
// `spawnSync(bin/patch.mjs apply)` at boot. This empty client entry exists
// solely so the plugin appears in the DSH Desktop plugin manager — same
// pattern as dsh-hotkey's host-only companion.

/** Client plugin body — all behavior is host-side patching. */
function apply() {}

export { apply };
