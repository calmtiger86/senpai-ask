---
name: senpai-finish
description: >
  Decides what happens to finished work — shows it running, confirms tests
  pass, then apply, put online, decide later, or throw away: "다 됐어?",
  "확인해줘", "끝내자", "이대로 반영해줘", "마무리해줘", "방금 한 거 버려줘",
  "없던 일로 해줘", "이거 쓸까 버릴까", "finish this", "wrap it up", "keep or discard". The one
  skill that makes the keep-or-discard call; never applies failing work.
---

# Senpai Finish

> **This is where the keep-or-discard decision happens.** Every other senpai
> skill did its work inside an isolated copy and left the real project
> untouched. This skill is the only place that decides whether that work gets
> applied to the real project or thrown away — and it never decides on the
> person's behalf. The whole safety model of this toolkit is "work in
> isolation, then one clear keep-or-discard choice at the end." That choice
> lives here.

## Overview

Bring the work to a clean close: show the person it actually runs, confirm the
tests pass, then offer a small set of plain choices and carry out the one they
pick.

**Core principle:** Show it running → confirm tests pass → detect the
environment → present the right (small) set of choices → carry out the choice →
tidy up → save a few lines to memory. Never apply work when tests fail.

**Announce at start:** "I'm using senpai-finish to wrap this up — I'll show you
it working, then you decide what to do with it."

**Say this to the person at the start (plain language):**

> "The work's done in the safe copy. I'll show you it running, make sure the
> automatic checks pass, and then you choose: keep it, or throw it away.
> Nothing touches your real project until you say so."

**Run Steps 1–3 inside the copy that holds the work.** If an earlier session
left that copy (`senpai-remember` found it in `git worktree list`) and you're
in the real project now, go into it first: in Claude Code, `EnterWorktree`
with its `path`; elsewhere, `cd` into it.

## Step 1: Show it actually running (for the person)

**Already checked in this session?** If `senpai-build` ran it here on the
copy's current commit (`git rev-parse --short HEAD` matches the one it noted,
`git status --short` shows nothing new, and the result is still in this
conversation), show the person that result instead of running it again. A new
session, or anything merged, means running it again. This covers showing it
only — Step 2's tests still run.

**A total beginner can't read a test log — but they *can* recognize a screen
that works or output that looks right.** So before anything technical, if the
project has something
you can actually run, run it briefly and show them.

Detect a runnable entry point (skip this step silently if there isn't one, or
if what to run is unclear):

```bash
# Common entry points — use whichever matches the project.
# Node:   npm start / npm run dev / node <entry>
# Python: python main.py / the project's documented run command
# Rust:   cargo run
# Go:     go run .
```

- If it's a short command or script, run it and show the person the output.
- If it's a server or app with a URL, start it, show that it responds (a page,
  a health check, a screenshot if you can), then stop it again.
- Keep it short — a quick "here's it working," not a full demo.

Then say, in plain words, what they're looking at — e.g. "this is your login
screen now checking the password."

**Observe, don't just read.** If the project produces output (a web page, CLI
output, API response), actually look at what it produces — don't just check
whether the command exited successfully. A process can exit 0 and still show a
blank page or wrong data. Tell the person what you *actually see*, not just
that "it ran." If you can take a screenshot, do so — a beginner trusts their
eyes more than a log line.

**If it's clearly broken when you run it,** stop here and tell the person
plainly, before touching the choices. Don't push a visibly broken result toward
"apply."

**If there's nothing runnable, or it's unclear what to run,** skip this step and
rely on the automated tests in Step 2. Don't invent a fake demo.

## Step 2: Confirm the tests pass (the safety gate)

**This is a hard gate and it does not bend.** Run the project's tests once:

```bash
# Use the project's own test command.
npm test / cargo test / pytest / go test ./...
```

**If tests fail:** say so in plain language and stop.

> "The automatic checks are failing (<N> of them). I won't apply this to your
> real project until they pass — that's the safety rule. I'll go back and fix
> it."

Do **not** continue to the choices below. Applying broken work to the real
project is exactly what this gate prevents. (A nice-looking demo in Step 1 does
not override a failing test here — the tests are the gate.) Route back to
`senpai-build` to find and fix the root cause, then return here once tests
pass.

**If tests pass (or the project genuinely has no tests):** continue.

The gate guards applying, not throwing away. If the person came here to throw
the work away, skip the tests; if the tests fail and they'd rather throw it
away, that choice stays open.

## Step 3: Detect the environment

Two things decide which choices to offer and how tidy-up works: **are we in an
isolated copy, and is there an online home (a remote) for this project?**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)          # empty string = detached HEAD
HAS_REMOTE=$(git remote)                      # empty = no online home
```

**Submodule guard** (same as `senpai-isolate`): `GIT_DIR != GIT_COMMON` is also
true inside a git submodule. If this prints a path, it's a submodule — treat it
as a normal repo, not an isolated copy:

```bash
git rev-parse --show-superproject-working-tree 2>/dev/null
```

Read the state into these facts:

| Fact | How to tell |
|---|---|
| Normal checkout (not an isolated copy) | `GIT_DIR == GIT_COMMON` (or submodule), AND `$ROOT/.senpai/log.md` has no open starting point |
| Worked in place (isolate chose not to copy) | `GIT_DIR == GIT_COMMON`, AND the log has an open starting point |
| Isolated copy on a named branch | `GIT_DIR != GIT_COMMON`, `BRANCH` non-empty, not a submodule |
| Detached-HEAD copy (host-owned) | `GIT_DIR != GIT_COMMON`, `BRANCH` empty |
| Has an online home | `HAS_REMOTE` non-empty |

The open starting point is the last `- Starting point: <SHA>` line with no
`- Finished:` line after it. A `Starting point:` line that a `Finished:` line
follows belongs to finished work — never act on it.

## Step 4: Present the choices (kept deliberately small)

For a total beginner, "Pull Request" is an unfamiliar idea, and it only makes
sense at all when the project actually has an online home. So:

- **Only show the "put it online for review" choice when a remote actually
  exists** (`HAS_REMOTE` is non-empty). No remote → drop that choice. Push
  only when the person picks it — never push or force-push otherwise.
- **"Apply to your real project" needs a copy on a named branch.** A
  detached-HEAD copy belongs to the host (see below), and without a copy the
  work is already in the real project.
- **"Decide later" and "Throw it away" are there whenever there's a copy.**

Which gives these menus. Present exactly the choices for the matching row —
don't pad them with extra explanation:

| Situation | Choices |
|---|---|
| Copy on a named branch, **remote exists** | Apply · Put online for review · Decide later · Throw away (4) |
| Copy on a named branch, **no remote** | Apply · Decide later · Throw away (3) |
| Detached-HEAD copy, **remote exists** | Put online for review · Decide later · Throw away (3) |
| Detached-HEAD copy, **no remote** | Decide later · Throw away (2) |
| Worked in place | Keep as-is · Undo to starting point (2) |
| Normal checkout, no open starting point | None — the work is already in the real project. Say so, then save the note (Step 7, `- Finished: kept`). |

Render it in plain language. For the fullest (4-choice) case:

```
The work is done and the checks pass. What would you like to do?

1. Apply it to your real project
2. Put it online and ask for a review
3. Decide later (I'll leave the copy exactly as it is)
4. Throw this work away

Which one?
```

For the no-remote 3-choice case, drop line 2 and renumber. On a detached HEAD,
drop "Apply it to your real project" (the host manages where this work lands, so
we can't merge it locally). Keep the wording this plain every time.

**Native rendering (optional, your call):** in Claude Code you may present these
same choices with `AskUserQuestion` (in Codex, `request_user_input` if it's in
your tools) instead of a numbered list — it's the same choices either way. A
plain text menu is completely fine and is the default.

## Step 5: Carry out the choice

In Codex, `.git` is read-only inside the sandbox: run every git command that
writes (commit, merge, revert, `switch -c`, `worktree remove`, `branch -d`) as an escalated
command (`require_escalated`) so the person can approve it. If one is refused
or fails, tell the person plainly instead of working around it.

### First, go back to the real project (copy on a named branch)

**A detached-HEAD copy belongs to the host — Codex makes these. Skip this and
follow "Host-made copy" below.** Worked in place? You're already
in the real project; skip this too.

Otherwise, the rest happens from the real project with the copy sitting at a
path: merging or removing from inside the copy fails, and in a Claude Code
copy the real project can't even be written from there.

1. **Commit what's not committed yet** (skip this for "Throw away"). Check
   `git status --short` in the copy — the copy may be cleaned up later, and
   uncommitted work would go with it. Stage this work's files by name, never
   `git add -A`; if something that looks secret (`.env`, keys, tokens) shows
   up, leave it out and tell the person.
2. **Note the copy's path and branch** (`git rev-parse --show-toplevel`,
   `git branch --show-current`), and read the copy's `.senpai/log.md` if it
   has one.
3. **Leave the copy.** Claude Code copy: `ExitWorktree` with `action: "keep"` —
   never `remove`, which deletes the branch before the work is merged. If
   `ExitWorktree` says there's no copy to leave, or for any other copy:
   `cd "$ROOT"` (`ROOT` as defined in `senpai-remember`).
4. **Bring the copy's notes home.** Append the copy's log lines that aren't
   already in `$ROOT/.senpai/log.md`. Don't carry `current-plan.md` over — that
   plan is done. The wrap-up itself comes in Step 7, once the choice is
   carried out.

### Apply it to your real project (local merge)

From the real project:

```bash
git branch --show-current   # where the work lands; empty → ask which branch
# Pull only if this branch follows an online branch, fast-forward only; if
# that fails, skip it and tell the person.
git rev-parse @{u} >/dev/null 2>&1 && git pull --ff-only
git merge <copy-branch>

# Re-run the tests on the merged result before trusting it.
<test command>
```

Before merging, tell the person which branch it goes into ("`main`에
합칠게요") — after a break, the real project may be on a different branch than
when the work started. If the tests need dependencies that were only installed
in the copy, install them here first (`senpai-isolate` Step 2).

If the merge reports a conflict, stop and explain plainly: "Your original
changed while we were working, so I need to match them up." Resolve it
yourself, re-run the tests, and only continue once tests pass.

Only after the merge succeeds and tests pass on the merged result: tidy up the
copy (Step 6), then delete the branch (`git branch -d <copy-branch>`) — unless
Step 6 left the copy in place because the host owns it; then leave the branch
too. Tell
the person plainly: "Done — it's now part of your real project."

### Put it online and ask for a review (needs a remote)

From the real project (the copy's work is already committed):

```bash
git push -u origin <copy-branch>
```

Then, in plain words: "It's online now. Someone (or you, later) can look it over
before it becomes part of the main project." **Leave the copy in place** — the
person may need it to make changes after the review. Do not tidy it up.

### Decide later

The work is already committed on the copy's branch (step 1 above). Don't merge,
push, or remove anything. Say: "I've left everything exactly as it is in the
safe copy — your real project is untouched. We can pick this back up anytime."
**Leave the copy in place.**

### Keep as-is (in-place work only)

The work is already in the real project. Change nothing. Step 7 records
`- Finished: kept`, which closes the starting point so a later undo can't reach
back past this work.

### Undo to starting point (in-place work only)

Only shown when `$ROOT/.senpai/log.md` has an open starting point (Step 3)
because the work was done in place. Use that SHA, never one a `Finished:` line
already closed (that would also undo earlier, finished work). Revert all changes back to that commit
(`git revert --no-commit <start-SHA>..HEAD && git commit --no-edit`; skip it if
`<start-SHA>` is already `HEAD`). Then check `git status --short`: files that
were never committed are still there. Tell the person plainly that the work is
undone back to where we started, and name any files that are still there.

### Host-made copy (detached HEAD — the Codex app, `codex --worktree`)

The host owns this copy: don't leave, merge, or remove it.

- **Decide later:** make a branch (`git switch -c <name>`) and commit this
  work's files by name, as in step 1 above. Leave it there. If the branch
  can't be made, give the person a suggested branch name and commit message
  instead.
- **Put online:** the same, then `git push -u origin <name>` from the copy.
  The sandbox blocks the network by default, so this needs approval; if it's
  refused, give the person the branch name to push themselves.
- **Throw away:** delete nothing yourself. Tell the person Codex manages this
  copy — in the Codex app, archiving this chat removes it.

In the Codex app, "Hand off" moves the work to their local project ("Create
branch here" if no branch could be made).

### Throw this work away (copy on a named branch)

**This can't be undone, so confirm first — keep this exact, deliberate step.**
Show what will be lost and require the person to type the word:

```
This will permanently delete this work — you can't get it back:
- the branch <name>
- these saved points: <commit-list>
- files not saved yet: <file-list>
- the safe copy at <path>

Type '삭제' to confirm.
```

Inside the copy, `<commit-list>` is `git log --oneline <real-branch>..HEAD`,
where `<real-branch>` is the `branch` line in the first block of
`git worktree list --porcelain`; `<file-list>` is `git status --short`. Drop a
line that would be empty.

Render the confirmation word in the person's language (e.g. '삭제' in Korean,
'discard' in English, '削除' in Japanese, '删除' in Chinese). Wait for the
person to type that exact word. Anything else means don't
proceed. (This typed confirmation is the one explicit check this toolkit keeps
for an action that can't be reversed — don't soften it into a yes/no or skip it.)

If confirmed: go back to the real project (steps 2–4 of "First, go back" —
skip the commit), tidy up the copy (Step 6, with `--force`), force-delete the
branch (`git branch -D <copy-branch>`), then save the note with the *why*
(Step 7).

## Step 6: Tidy up the copy

**Only for "Apply" and "Throw away," on a copy with a named branch.** "Put
online for review" and "Decide later" keep the copy alive.

From the real project, and only for the copy the person just decided on. A copy
in `.claude/worktrees/` (made by `EnterWorktree`), `.worktrees/`, or
`worktrees/` was made by senpai, so remove it with git. A copy anywhere else
belongs to the host — never remove it.

```bash
git worktree remove "<copy path>"   # Throw away: add --force (confirmed above)
git worktree prune                  # clean up any stale registration
```

**After "Apply", if git refuses because files are left over** (something kept
out of the commit, like `.env`), don't use `--force`: show the person the
leftover files and ask whether to move them to the real project or delete them.

Removing the copy deletes its `.senpai/` too, since git ignores it. An empty
`.claude/worktrees/` folder may stay behind — leave it; Claude Code manages
that folder, and writing there asks for extra permission.

**If git says the copy is locked**, read the reason in
`git worktree list --porcelain` (the `locked` line). Claude Code's reason looks
like `claude session <name> (pid <N> start …)`. If `ps -p <N>` shows no
process, that session has ended: `git worktree unlock "<copy path>"`, then
remove it. If the process is still running, or the reason has no pid, another
session may be using the copy — leave it and tell the person plainly. Never
override a lock with `git worktree remove -f -f`.

## Step 7: Save a few lines to memory

Whatever the person chose, end by saving a short wrap-up so the next session
knows how this ended. Follow `senpai-remember`'s schema: append a few plain
lines to **`.senpai/log.md`**. Do not create a new file for this.

Write it to the real project's `$ROOT/.senpai/log.md` (`ROOT` as defined in
`senpai-remember`) once the choice is carried out — it survives even when the
copy is thrown away. For a host-made copy, still try `$ROOT/.senpai/log.md`
first (with approval if Codex asks), because the copy may be removed; only if
that fails, follow `senpai-remember`'s rule for when the real project can't be
written, and tell the person the *why* in words too.

Keep it to the usual few lines — did / decided / next. When the choice ends the
cycle (apply, throw away, keep as-is, undo), add a `- Finished:` line; only this
skill writes it, and it closes the cycle. "Decide later" and "put online" leave
the cycle open, so they don't — instead, name the copy's branch (and path) in
the `Next:` line, so the work can be found even if the copy folder is cleaned
up.

```markdown
- Did: finished the login work and applied it to the real project.
- Decided: kept it — demo looked right and all checks passed (user confirmed).
- Next: start on the signup form.
- Finished: applied
```

**Even when the person throws the work away, record *why*.** A discarded attempt
still teaches something, and the point of memory is to not repeat the same dead
end next time:

```markdown
- Did: tried adding offline mode; threw it away.
- Decided: discarded — it broke the sync tests and the approach was a dead end
  (user agreed). Note: don't retry offline mode without solving sync first.
- Finished: discarded
```

Then tell the person, in plain language, that it's saved — not the raw file.
