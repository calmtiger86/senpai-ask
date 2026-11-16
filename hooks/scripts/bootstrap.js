#!/usr/bin/env node
// senpai — bootstrap hook (SessionStart only).
//
// Adds a short fact about senpai mode as hidden context when a session starts,
// resumes, clears, forks, or is compacted, so the assistant routes build/add/
// debug/verify requests through the `senpai` skill. Written as a statement of
// fact, not a command: hook docs warn that command-style context can be treated
// as an injection attempt.
//
// Host: Claude Code runs this with no argument (hooks/hooks.json); Codex runs it
// with `codex` (hooks/codex-hooks.json, via .codex-plugin/plugin.json).
//
// Toggle: create `.senpai-off` in the host's config folder (~/.claude or
// ~/.codex) to pause the nudge; delete it to resume. senpai-ask itself stays
// installed either way.
//
// Fail-open: any error prints nothing and exits 0, so a broken hook never
// blocks a session. No deps beyond Node's fs/os/path.

const fs = require('fs');
const os = require('os');
const path = require('path');

try {
  const isCodex = process.argv[2] === 'codex';
  const configDir = isCodex
    ? process.env.CODEX_HOME || path.join(os.homedir(), '.codex')
    : process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  const instructionsFile = isCodex ? 'AGENTS.md' : 'CLAUDE.md';
  const offFlag = path.join(configDir, '.senpai-off');

  const context = fs.existsSync(offFlag)
    ? `senpai mode is paused in this session because ${offFlag} exists. Deleting that file turns it back on.`
    : 'senpai mode is on in this session: requests to build, add, debug, or check something go through the `senpai` skill first. '
      + `The person's own instructions and ${instructionsFile} take priority.`;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
  }));
} catch (e) {
  // Fail open — print nothing.
}
