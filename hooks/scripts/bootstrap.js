#!/usr/bin/env node
// senpai — bootstrap hook.
//
// Re-injects a short "senpai mode is on" nudge as hidden context on
// SessionStart and after compaction (PostCompact), so the assistant loads the
// `senpai` skill before its first response and doesn't forget the mode when the
// conversation is compacted.
//
// Pure text injection only. No file blocking, no approval logic, no deps.
// If a host (e.g. some Codex setups) ignores this hook, it's not fatal: the
// `senpai` skill's own trigger keywords are the safety net.

const NUDGE = [
  'senpai mode is on.',
  'Load the `senpai` skill before responding to build/add/debug/verify requests.',
  'User instructions and CLAUDE.md take priority.',
].join(' ');

// Read the hook payload from stdin (best-effort) only to echo the event name
// back, so the output labels itself with the event that actually fired.
let raw = '';
try {
  raw = require('fs').readFileSync(0, 'utf8');
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
