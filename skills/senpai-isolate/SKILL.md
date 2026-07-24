---
name: senpai-isolate
description: Use before making any code change for a beginner — sets up an isolated copy of the project (native worktree tool if available, git worktree fallback, or Codex sandbox as a second layer) so the real files are never touched until senpai-finish decides whether to keep the work.
---

# Senpai Isolate

> **Why this skill is the safety core of this toolkit.** No file change ever
> leaves the isolated space this skill creates. The real project is not touched
> while work happens here. Whether any of it gets applied to the real project is
> decided later — only by `senpai-finish`, with the person's explicit yes.
> The invariant: work only inside the isolated copy, decide at the end.

## Overview

Make the work happen in a safe copy, not the person's real project. Detect
isolation that already exists first. Then use the platform's native tool. Then
fall back to a plain git worktree. Never fight the tool you already have.

**Core principle:** Detect existing isolation → use native tools → fall back to
git → (on Codex) also confirm the sandbox. The real project stays untouched
until `senpai-finish`.

**Say this to the person at the start (plain language, one sentence):**

> "I'll leave your real project exactly as it is and do the work safely in a
> copy. Nothing changes for real until you say so at the end."

You may add a tiny aside the first time, for the curious: *(a "copy" here is an
isolated workspace — technically a git worktree)*. Don't repeat the aside after
the first time, and don't make the person learn the word.

## Step 0: Are we already in a safe copy?

**First — is this even a git project?** If `git rev-parse` fails (no `.git`
at all), this folder has no version history yet. Say plainly: "아직 저장점이
없어서 먼저 하나 만들어 둘게요" (or the equivalent in their language).

If the folder already contains files, ask briefly before staging them all:
"여기 있는 파일들을 전부 첫 저장점에 포함해도 될까요?" (or equivalent). If they
say no or hesitate, run `git init && git commit --allow-empty -m "initial"`
(empty commit only). If yes (or the folder is empty), run
`git init && git add -A && git commit --allow-empty -m "initial"`.

**Empty folder → work in place.** With nothing to protect yet, skip creating an
isolated copy — record the starting SHA in `.senpai/log.md` as for any
in-place work.

**Folder already had files → make the isolated copy now.** That first commit
just gave you something to branch from, so don't skip isolation here — continue
to Step 1 and create the copy as normal. Existing files are exactly what this
skill exists to protect; only a genuinely empty folder has nothing to protect.

**Before creating anything, check whether the work is already isolated.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside a git
submodule. Before concluding "already isolated," confirm it is not a submodule:

```bash
# If this prints a path, it's a submodule, not a worktree — treat as a normal repo.
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** already in an isolated
copy. Skip to Step 2. Do NOT make another copy inside it.

Tell the person plainly, matching the state:
- On a branch: "Good — we're already in a safe copy, so your real project is protected."
- Detached HEAD: "We're already in a safe copy that's externally managed. I'll name a branch for it later, at the finish step."

**If `GIT_DIR == GIT_COMMON` (or in a submodule):** this is the person's real
checkout. Get a plain-language yes before making a copy, unless they already
told you their preference:

> "I'll do the work in a safe copy so your real files aren't touched — okay?"

Honor any preference they already stated without re-asking. If they decline,
work in place and skip to Step 2 — but flag that the real project will change
directly, so `senpai-finish` becomes the only place to undo. Record the
current commit SHA in `.senpai/log.md` (e.g. `- Starting point: abc1234`) so
`senpai-finish` can offer an undo path back to it.

## Step 1: Make the isolated copy

**There are three mechanisms. Try them in this order.** Native tool first,
git fallback next, and on Codex confirm the sandbox as a second layer.

### 1a. Native worktree tool (preferred)

Look for a native tool before touching git yourself. Native tools handle where
the copy goes, the branch, and cleanup — running `git worktree add` when a
native tool exists creates phantom state the platform can't see.

- **Claude Code:** you have native tools named **`EnterWorktree`** (make and
  enter the safe copy) and **`ExitWorktree`** (leave it). Use `EnterWorktree`
  now and skip to Step 2. `ExitWorktree` is used later by `senpai-finish`, not
  here. If for some reason `EnterWorktree` is not available in this session,
  fall through to Step 1b.

- **Codex CLI:** no dedicated worktree tool is confirmed here (likely none) — so
  do NOT wait for one. Go to Step 1b (git fallback), and then do the Codex
  sandbox check in 1c as a second, independent layer.

- **Other platforms:** if you see a tool like `WorktreeCreate`, a `/worktree`
  command, or a `--worktree` flag, use it and skip to Step 2.

Only proceed to Step 1b if you have no native worktree tool.

### 1b. Git worktree fallback

**Only if 1a gave you no native tool.** Make the copy with plain git.

**Where the copy goes** (explicit preference beats observed state):

1. If the person or your instructions named a location, use it.
2. Otherwise check for an existing worktree directory:
   ```bash
   ls -d .worktrees 2>/dev/null   # preferred (hidden)
   ls -d worktrees 2>/dev/null    # alternative
   ```
   If both exist, `.worktrees` wins.
3. If none, default to `.worktrees/` at the project root.

**Make sure the copy folder is ignored** (project-local locations only) — this
keeps the copy from being committed into the real repo:

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If it is NOT ignored: add it to `.gitignore`, commit that one line, then
proceed.

**Create it:**

```bash
path="$LOCATION/$BRANCH_NAME"
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Sandbox blocked it?** If `git worktree add` fails with a permission/sandbox
error, don't fight it. Tell the person plainly that the safe copy couldn't be
made, that you'll work in the real project instead, and that the finish step is
now the only place to keep or undo the work. Then run setup and baseline tests
in place. (On Codex, see the "Codex App Finishing" note under 1c.)

### 1c. Codex sandbox — the second layer (Codex CLI only)

The worktree isolates *what the work changes*. The Codex sandbox independently
limits *what any command is allowed to touch*. They're two separate defenses;
keep both on when you can, so if one misses, the other catches it.

Confirm the beginner-safe sandbox is on: **`workspace-write`** with
**`on-request`** approvals and network disabled by default. This is the
recommended default for beginners. If it's off or looser, say so plainly and
suggest turning it on before real work.

**Codex App Finishing (when the sandbox blocks branching).** If the sandbox
won't let you create a branch (detached HEAD in an externally managed
workspace), don't pretend it worked. Be honest:

- Give up on making a separate copy and work in the current location.
- When the work is done, commit it and hand the decision back to the person:
  tell them a suggested **branch name** and **commit message**, and point them
  to the App's native controls ("Create branch" / "Hand off to local") so they
  apply the work themselves.
- You can still run tests, stage files, and write out the suggested names — you
  just can't push the branch from inside the sandbox.

## Step 2: Set the copy up

Auto-detect and run the right setup so the copy is ready to work in:

```bash
if [ -f package.json ]; then npm install; fi        # Node.js
if [ -f Cargo.toml ]; then cargo build; fi          # Rust
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi   # Python
if [ -f pyproject.toml ]; then poetry install; fi   # Python (poetry)
if [ -f go.mod ]; then go mod download; fi           # Go
```

Skip silently if none of these files exist.

If an install command fails with DNS, network, or registry errors, the
platform's sandbox is likely blocking network access. Ask the user to approve
network for the install — don't hunt for a code bug or try alternate package
managers.

## Step 3: Check the copy starts clean

Run the project's tests once, so a later failure can be told apart from a
pre-existing one:

```bash
# Use the project-appropriate command
npm test / cargo test / pytest / go test ./...
```

- **Tests fail:** report the failures in plain language and ask whether to keep
  going or look into it first. Don't quietly proceed.
- **Tests pass (or no tests exist):** report ready.

### Report (plain language, one line)

Don't paste the technical worktree report at the person. Say something like:

> "Ready — I'm now working in a safe copy of your project. Your real files stay
> exactly as they are until you decide at the end."

Keep the technical facts (copy path, branch name, test result) available if
they ask, but lead with the plain sentence.

## Quick Reference

| Situation | Action |
|-----------|--------|
| Already in a linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as normal repo (Step 0 guard) |
| Claude Code, `EnterWorktree` available | Use it (Step 1a), skip to Step 2 |
| Codex CLI | Git fallback (1b) + confirm sandbox (1c) |
| Other native worktree tool | Use it (Step 1a) |
| No native tool | Git worktree fallback (Step 1b) |
| `.worktrees/` / `worktrees/` exists | Use it (verify ignored); `.worktrees` wins |
| Neither exists | Explicit instruction, then default `.worktrees/` |
| Copy folder not ignored | Add to `.gitignore` + commit |
| Sandbox blocks worktree/branch | Work in place; on Codex use App Finishing (1c) |
| Baseline tests fail | Report plainly + ask |
| No package.json/Cargo.toml/etc. | Skip dependency install |

## Red Flags

**Never:**
- Make a copy when Step 0 already detected isolation.
- Run `git worktree add` when a native tool exists (Claude Code: `EnterWorktree`). This is the #1 mistake — if you have it, use it.
- Skip Step 1a and jump straight to git commands.
- Make a project-local copy without verifying it's ignored.
- Skip the baseline test check.
- Proceed with failing tests without asking.
- Claim the work is isolated when a sandbox blocked it — be honest and hand the decision back.
- Recreate file-level allowlists or per-file scope grants. This toolkit deliberately dropped that approach; isolation + a final keep/discard decision is the model.

**Always:**
- Run Step 0 detection first.
- Prefer native tools over the git fallback.
- On Codex, keep the sandbox on as a second layer.
- Verify the copy folder is ignored (project-local).
- Verify a clean test baseline.
- Leave the real project untouched — the keep-or-discard call belongs to `senpai-finish`.
