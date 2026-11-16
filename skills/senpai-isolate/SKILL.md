---
name: senpai-isolate
description: >
  Makes a safe copy of the project before any change, once the direction is
  agreed ("좋아요, 진행해 주세요", "let's start") — Claude Code's
  `EnterWorktree`, a git worktree, or the Codex sandbox — so the real files
  stay untouched until senpai-finish decides whether to keep the work.
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
`git init && git add -A -- . ':(exclude).senpai' && git commit --allow-empty -m "initial"`.

**Empty folder → work in place.** A folder holding only `.senpai/` counts as
empty. With nothing to protect yet, skip creating an
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

**Picking up a copy left earlier?** If `senpai-remember` found unfinished work
in another copy (`git worktree list`) and the person wants to continue it,
enter that copy (in Claude Code, `EnterWorktree` with its `path`) instead of
making a new one. Skip the starting-commit check and reset in 1a for it — that
copy already holds the person's work.

Tell the person plainly, matching the state:
- On a branch: "Good — we're already in a safe copy, so your real project is protected."
- Detached HEAD: "We're already in a safe copy that's externally managed. I'll name a branch for it later, at the finish step."

**If `GIT_DIR == GIT_COMMON` (or in a submodule):** this is the person's real
checkout. Make the copy without asking — just tell the person in one sentence
(the "Say this" line above). If the copy needs the one-line `.gitignore` save
point from Step 1a/1b, say that too: it's the one change the real project gets
now. Work in place only if the person already asked for it ("그냥 여기서 해") —
then flag that the real project will change directly, so `senpai-finish`
becomes the only place to undo.

**Unsaved changes in the real project?** Check `git status --short`, ignoring
`.senpai/`. A copy starts from the last save point, so project files changed
since then would be missing from it. If there are any, name them and ask once:
save them in a save point first (commit those files by name), or work in place
instead. Apart from the first-save-point question above, it's the only question
this step asks.

For in-place work, append the line
`- Starting point: <short SHA>` under the current `- Agreed:` line in
`$ROOT/.senpai/log.md` so `senpai-finish` can offer an undo path back to it.
Keep the label `Starting point:` in English even when the rest of the log is in
another language — `senpai-finish` searches for that exact text. Write it only
for in-place work (here, the empty-folder case, and a sandbox that blocks the
copy); an isolated copy doesn't need it, because the copy's branch is already
the way back.

**Leave `.senpai/` where it is.** Memory lives in the real project (see
`senpai-remember`). Uncommitted changes there — such as the agreement line
`senpai-brainstorming` just wrote — are expected: don't stash, move, copy, or
commit them, and don't clean them up before making the copy. If `git ls-files
.senpai` prints anything (an older version committed memory), untrack it once
before making the copy: `git rm -r -q --cached .senpai && git commit -q -m
"chore: stop tracking senpai memory"`, and make sure `.senpai/.gitignore`
exists.

## Step 1: Make the isolated copy

**There are three mechanisms. Try them in this order.** Native tool first,
git fallback next, and on Codex confirm the sandbox as a second layer.

### 1a. Native worktree tool (preferred)

Look for a native tool before touching git yourself. Native tools handle where
the copy goes and the branch — running `git worktree add` when a
native tool exists creates phantom state the platform can't see.

- **Claude Code:** you have native tools named **`EnterWorktree`** (make and
  enter the safe copy) and **`ExitWorktree`** (leave it). `EnterWorktree` puts
  the copy in `.claude/worktrees/`, so first make sure git ignores that folder,
  the same way as in 1b: if `git check-ignore -q .claude/worktrees` fails,
  append the line `.claude/worktrees` to `.gitignore` and commit just that
  file (`git add .gitignore && git commit -m "chore: ignore senpai copies" -- .gitignore`).
  Otherwise the real project shows `?? .claude/` for as long as the copy
  exists. Don't hide it any other way (`.git/info/exclude`, or a file inside
  `.claude/`) — those ask for extra permission. Then note the real project's
  commit (`git rev-parse HEAD`) and use `EnterWorktree`.
  Inside the new copy, compare its `git rev-parse HEAD` with the noted commit:
  depending on its `worktree.baseRef` setting, Claude Code may start the copy
  from the online default branch, which leaves out commits that were never
  pushed. If they differ, move the fresh copy to the noted commit with
  `git reset --hard <noted SHA>` — safe only now, before any work. Then skip to
  Step 2. `ExitWorktree` is used later by `senpai-finish`, not here. If for
  some reason `EnterWorktree` is not available in this session, fall through to
  Step 1b.

- **Codex:** Codex makes its own managed copies, but only when the person
  starts one (`codex --worktree`, `/worktree`, or the app's Worktree mode) —
  Step 0 already notices when you're inside one. You can't start one yourself,
  so go to Step 1b (git fallback), then do the sandbox check in 1c.

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
3. If none, default to `.worktrees/` at the project root — never a temporary
   folder outside the project, which can vanish.

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
now the only place to keep or undo the work. Record the `- Starting point:`
line as for any in-place work, then run setup and baseline tests in place. (On Codex, see the "Codex App Finishing" note under 1c.)

### 1c. Codex sandbox — the second layer (Codex only)

The worktree isolates *what the work changes*. The Codex sandbox independently
limits *what any command is allowed to touch*. They're two separate defenses;
keep both on when you can, so if one misses, the other catches it.

Confirm the beginner-safe sandbox is on: **`workspace-write`** with
**`on-request`** approvals and network disabled by default. This is the
recommended default for beginners. If it's off or looser, say so plainly and
suggest turning it on before real work.

This sandbox keeps `.git` read-only, so `git worktree add` and `git commit`
need the person's approval. Run them as escalated commands
(`require_escalated`, with a one-line reason), and say first, in one plain
sentence, why Codex may ask ("안전한 복사본을 만들려면 허락이 필요해요"). A plain
run fails with `Operation not permitted` or `cannot lock ref` — that's this
sandbox, not a dead end: retry it escalated. If it's refused, or fails
without asking, tell the person plainly and follow "Sandbox blocked it?" in
1b.

**Codex App Finishing (when the sandbox blocks branching).** If the sandbox
won't let you create a branch (detached HEAD in an externally managed
workspace), don't pretend it worked. Be honest:

- Give up on making a separate copy and work in the current location.
- When the work is done, commit it and hand the decision back to the person:
  tell them a suggested **branch name** and **commit message**, and point them
  to the App's native controls ("Create branch here" / "Hand off") so they
  apply the work themselves.
- You can still run tests, stage files, and write out the suggested names.
  Pushing needs the network, which this sandbox blocks by default — ask for
  approval, or let the person push it themselves.

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
