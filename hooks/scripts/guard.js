#!/usr/bin/env node
// senpai — secret & control-file guard (PreToolUse).
//
// The one blocking hook in the toolkit. It denies a tool call only when it would
// touch a secret file (.env, private keys, credentials) or a control file
// (.claude / .codex / .claude-plugin) — everything else gets no opinion, so this
// hook never gets in the way of ordinary work. Pattern logic lives in
// scripts/protect-secrets.js; this file is just the wiring.
//
// Applies regardless of approval state: a secret must not leak even when the
// surrounding change was approved.

const { isSecretPath, isControlPath, scanCommand } = require('../../scripts/protect-secrets');

// Read the PreToolUse payload from stdin (best-effort). Any parse failure falls
// through to "no opinion" so the guard can never wedge a session shut.
let raw = '';
try {
  raw = require('fs').readFileSync(0, 'utf8');
} catch (e) {
  // No stdin — nothing to inspect.
}

let payload = {};
try {
  payload = JSON.parse(raw) || {};
} catch (e) {
  payload = {};
}

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

// No opinion — let the normal permission flow decide.
function allow() {
  process.stdout.write('{}');
  process.exit(0);
}

const toolName = payload.tool_name;
const input = (payload.tool_input && typeof payload.tool_input === 'object') ? payload.tool_input : {};

const FILE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'Read', 'Grep']);

if (FILE_TOOLS.has(toolName)) {
  const targets = [input.file_path, input.notebook_path, input.path]
    .filter((t) => typeof t === 'string' && t.length > 0);
  for (const target of targets) {
    if (isControlPath(target)) {
      deny(`This is a control file ("${target}"). Senpai does not change the files that decide how it runs.`);
    }
    if (isSecretPath(target)) {
      deny(`This looks like a secret file ("${target}"). Senpai never reads or writes credential files, even inside an isolated workspace.`);
    }
  }
  allow();
}

if (toolName === 'Bash') {
  const reason = scanCommand(input.command);
  if (reason) {
    deny(reason);
  }
  allow();
}

// Any other tool: not this hook's concern.
allow();
