'use strict';

// senpai — secret & control-file pattern check.
//
// This is the ONE piece of real code in the toolkit; everything else is
// markdown guidance. Worktree isolation (senpai-isolate) keeps code *changes*
// from reaching the original project, but it does NOT stop an assistant from
// reading or writing secret files (.env, private keys, credentials) — the
// filesystem stays fully reachable inside an isolated worktree. This module is
// the single pattern source for blocking exactly that, plus writes to the
// files that govern how the assistant itself runs (control files).
//
// Pure functions, no dependencies, no state. Secret/control paths are flagged
// regardless of approval state: a secret must never leak even when the change
// around it was approved.

// Agent/harness control directories. Editing anything inside them changes the
// rules the assistant runs under, so writes here are blocked wherever the
// plugin is installed — matched by directory name, never by this repo's own
// absolute path. `.senpai/` is deliberately absent: that folder holds the
// toolkit's own memory/plan data (log.md, current-plan.md, decisions.md), which
// the skills must be able to write.
const CONTROL_DIRS = new Set(['.claude', '.codex', '.claude-plugin']);

const ENV_EXACT = '.env';
const ENV_PREFIX = '.env.';
const SSH_PRIVATE_KEY_NAMES = new Set(['id_rsa', 'id_ed25519']);
const SECRET_EXTENSIONS = ['.pem', '.key'];
const SECRET_SUBSTRINGS = ['credential', 'secret'];

// Split on both POSIX and Windows separators so the check is host-agnostic.
function toSegments(filePath) {
  return String(filePath).split(/[\\/]+/).filter(Boolean);
}

// Hard secret shapes: fixed filenames/extensions that are secret regardless of
// context. id_rsa.pub / id_ed25519.pub are public keys, so the exact-name match
// (not a substring) correctly leaves them alone.
function isHardSecretSegment(segment) {
  const lower = segment.toLowerCase();
  if (lower === ENV_EXACT || lower.startsWith(ENV_PREFIX)) return true;
  if (SSH_PRIVATE_KEY_NAMES.has(lower)) return true;
  if (SECRET_EXTENSIONS.some((ext) => lower.endsWith(ext))) return true;
  return false;
}

// Free-form shapes: any segment whose name contains "credential"/"secret"
// (covers .aws/credentials, api-secret.json, and friends). Higher
// false-positive risk, so scanCommand() gates this behind a "looks like a file
// path" check before applying it to loose Bash tokens.
function isSubstringSecretSegment(segment) {
  const lower = segment.toLowerCase();
  return SECRET_SUBSTRINGS.some((needle) => lower.includes(needle));
}

function isSecretSegment(segment) {
  return isHardSecretSegment(segment) || isSubstringSecretSegment(segment);
}

// True if any path segment matches a secret pattern. Used for file-target tools
// (Write/Edit/MultiEdit/NotebookEdit), where the target is unambiguously a file.
function isSecretPath(filePath) {
  if (typeof filePath !== 'string' || filePath.length === 0) return false;
  return toSegments(filePath).some(isSecretSegment);
}

// True if the path lives inside a control directory (see CONTROL_DIRS).
function isControlPath(filePath) {
  if (typeof filePath !== 'string' || filePath.length === 0) return false;
  return toSegments(filePath).some((segment) => CONTROL_DIRS.has(segment.toLowerCase()));
}

// A token that plausibly names a file/path (has a separator or a dot), rather
// than a bare English word like "secret" or "credential" in a message.
function looksLikeFileReference(token) {
  return token.includes('/') || token.includes('\\') || token.includes('.');
}

// Glob-aware hard-shape check: `cat .env*`, `cat .en[v]`, `cat id_rsa*` never
// reach isHardSecretSegment as written, because a glob pattern is not an exact
// filename and Bash (not this scanner) is the thing that would expand it. We
// don't parse glob syntax -- we just strip the wildcard characters and re-test
// the remainder against the same hard-shape roots, in both prefix directions,
// so a pattern that *could* expand to a secret is treated the same as the
// secret itself (over-blocking a secret shape is the safe side -- see
// scanCommand's doc comment). A short minimum length keeps this from firing on
// near-empty globs like bare `*`.
const GLOB_META = /[*?[\]{}]/;
const HARD_SECRET_ROOTS = ['.env', 'id_rsa', 'id_ed25519'];
const MIN_GLOB_STRIP_LENGTH = 2;

function isHardSecretGlobSegment(segment) {
  if (!GLOB_META.test(segment)) return false;
  const stripped = segment.replace(/[*?[\]{}]/g, '');
  const lower = stripped.toLowerCase();
  if (lower.length < MIN_GLOB_STRIP_LENGTH) return false;
  if (HARD_SECRET_ROOTS.some((root) => root.startsWith(lower) || lower.startsWith(root))) return true;
  if (SECRET_EXTENSIONS.some((ext) => lower.endsWith(ext) || ext.startsWith(lower))) return true;
  return false;
}

function secretReason(token) {
  return `This looks like a secret file ("${token}"). Senpai never reads or writes credential files, even inside an isolated workspace.`;
}

function controlReason(token) {
  return `This is a control file ("${token}"). Senpai does not change the files that decide how it runs.`;
}

// Bash-side scan. We do NOT reimplement a shell parser (explicitly out of scope
// for this toolkit) — we split the command into rough tokens and look for
// secret/control paths among them.
//
//  - Hard secret shapes (.env, id_rsa, *.pem, *.key) always match, even bare.
//  - Substring shapes (secret/credential) match only when the token looks like a
//    file reference, so `echo "the secret"` stays allowed while
//    `cat config/credentials.json` is blocked.
//
// Known, accepted limitation: a secret-shaped token inside a message
// (`git commit -m "fix .env"`) is read as a reference and blocked; rewording or
// a user override recovers it. Over-blocking a secret shape is the safe side.
// ponytail: token scan, not a shell parser — upgrade to real parsing only if
// false positives actually bite in practice.
function scanCommand(command) {
  if (typeof command !== 'string' || command.length === 0) return null;

  const cleaned = command.replace(/[|&;<>()"'`=]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    const segments = toSegments(token);
    if (segments.some((segment) => CONTROL_DIRS.has(segment.toLowerCase()))) {
      return controlReason(token);
    }
    if (segments.some(isHardSecretSegment) || segments.some(isHardSecretGlobSegment)) {
      return secretReason(token);
    }
    if (looksLikeFileReference(token) && segments.some(isSubstringSecretSegment)) {
      return secretReason(token);
    }
  }

  return null;
}

module.exports = { isSecretPath, isControlPath, scanCommand };

// --- self-check -------------------------------------------------------------
// Run directly (`node scripts/protect-secrets.js`) to verify the patterns.
// No test framework — just assert() over a table of cases. Prints "ok" on pass.
if (require.main === module) {
  const assert = require('assert');

  const secretYes = [
    '.env', 'config/.env', '.env.production', 'app/.env.local',
    'id_rsa', '/home/me/.ssh/id_rsa', 'id_ed25519',
    'server.pem', 'deploy.key', 'certs/private.pem',
    'aws-credentials.json', '.aws/credentials', 'my-secret.txt',
    'C:\\Users\\me\\.ssh\\id_rsa',
  ];
  const secretNo = [
    'README.md', 'src/index.js', 'id_rsa.pub', 'id_ed25519.pub',
    '.environment', 'package.json', 'docs/setup.md', '.senpai/log.md',
    '.senpai/current-plan.md', '.senpai/decisions.md', '',
  ];
  for (const p of secretYes) assert.strictEqual(isSecretPath(p), true, `expected secret: ${p}`);
  for (const p of secretNo) assert.strictEqual(isSecretPath(p), false, `expected not secret: ${p}`);

  const controlYes = [
    '.claude/settings.json', '.codex/config.toml', '.claude-plugin/plugin.json',
    'project/.claude/hooks/x.js',
  ];
  const controlNo = [
    '.senpai/log.md', 'src/claude/util.js', 'claude.md', 'README.md', '',
  ];
  for (const p of controlYes) assert.strictEqual(isControlPath(p), true, `expected control: ${p}`);
  for (const p of controlNo) assert.strictEqual(isControlPath(p), false, `expected not control: ${p}`);

  const commandYes = [
    'cat .env', 'cat ~/.ssh/id_rsa', 'cp server.pem /tmp/x',
    'cat config/credentials.json', 'nano .claude/settings.json',
    'openssl rsa -in deploy.key',
    // Glob-bypass regression cases (found in a pre-release audit): a glob
    // pattern that could expand to a hard secret shape must be blocked too.
    'cat .env*', 'cat .en[v]', 'cat .en*', 'cat ~/.ssh/id_rsa*', 'cat *.pem',
  ];
  const commandNo = [
    'git status', 'npm install', 'echo "keep this a secret"',
    'rm -rf build', 'ls -la', 'git commit -m "add login"', '',
    // Innocent globs must stay allowed -- the glob check only fires when the
    // stripped remainder overlaps a hard secret root/extension.
    'ls *.js', 'cat *.md', 'rm -rf build/*',
  ];
  for (const c of commandYes) assert.ok(scanCommand(c), `expected command blocked: ${c}`);
  for (const c of commandNo) assert.strictEqual(scanCommand(c), null, `expected command allowed: ${c}`);

  process.stdout.write('protect-secrets self-check ok\n');
}
