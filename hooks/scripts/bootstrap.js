#!/usr/bin/env node
// senpai — bootstrap hook.
//
// Re-injects a short "senpai mode is on" nudge as hidden context on
// SessionStart and after compaction (PostCompact), so the assistant loads the
// `senpai` skill before its first response and doesn't forget the mode when the
// conversation is compacted.
//
// Toggle: touch ~/.claude/.senpai-off to pause senpai for advanced-user
// sessions, rm ~/.claude/.senpai-off to resume. Default is on — senpai-ask
// itself is never disabled, only this per-session nudge.
//
// Pure text injection only. No file blocking, no approval logic, no deps
// beyond Node's own fs/os/path.
// If a host (e.g. some Codex setups) ignores this hook, it's not fatal: the
// `senpai` skill's own trigger keywords are the safety net.

const fs = require('fs');
const os = require('os');
const path = require('path');

const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const OFF_FLAG = path.join(claudeDir, '.senpai-off');
const isOff = fs.existsSync(OFF_FLAG);

const NUDGE_ON = [
  'senpai mode is on.',
  'Load the `senpai` skill before responding to build/add/debug/verify requests.',
  'User instructions and CLAUDE.md take priority.',
].join(' ');

const NUDGE_OFF = [
  'senpai mode is off (advanced-user session, paused via ~/.claude/.senpai-off).',
  `Resume with: rm ${OFF_FLAG}`,
].join(' ');

const NUDGE = isOff ? NUDGE_OFF : NUDGE_ON;

// Read the hook payload from stdin (best-effort) only to echo the event name
// back, so the output labels itself with the event that actually fired.
let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch (e) {
  // No stdin available — fine, we fall back to SessionStart below.
}

let eventName = 'SessionStart';
try {
  const payload = JSON.parse(raw);
  if (payload && typeof payload.hook_event_name === 'string') {
    eventName = payload.hook_event_name;
  }
} catch (e) {
  // Non-JSON or empty stdin — keep the default event name.
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: eventName,
    additionalContext: NUDGE,
  },
}));
