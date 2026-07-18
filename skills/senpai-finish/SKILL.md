---
name: senpai-finish
description: Use when the work is done and it's time to decide what happens to it — keep it and apply it to the real project, put it online for review, decide later, or throw it away. This is the one skill that makes the keep-or-discard call. It first shows the person the work actually running and confirms tests pass (and never applies anything on failing tests), then presents a small set of plain-language choices. Triggers include "끝내자", "이대로 반영해줘", "마무리해줘", "이거 쓸까 버릴까", and the English "finish this", "wrap it up", "keep or discard".
---

# Senpai Finish

> **This is where the keep-or-discard decision happens.** Every other senpai
> skill did its work inside an isolated copy and left the real project
> untouched. This skill is the only place that decides whether that work gets
> applied to the real project or thrown away — and it never decides on the
> person's behalf. There is no file-level allowlist and no approval token here;
> the whole safety model of this toolkit is "work in isolation, then one clear
> keep-or-discard choice at the end." That choice lives here.

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

## Step 1: Show it actually running (for the person)

**The original skill only checks that automated tests pass. A total beginner
can't read a test log — but they *can* recognize a screen that works or output
that looks right.** So before anything technical, if the project has something
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
> real project until they pass — that's the safety rule. Want me to look into
> why?"

Do **not** continue to the choices below. Applying broken work to the real
project is exactly what this gate prevents. (A nice-looking demo in Step 1 does
not override a failing test here — the tests are the gate.)

**If tests pass (or the project genuinely has no tests):** continue.

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

Read the state into three facts:

| Fact | How to tell |
|---|---|
| Normal checkout (not an isolated copy) | `GIT_DIR == GIT_COMMON`, or it's a submodule |
| Isolated copy on a named branch | `GIT_DIR != GIT_COMMON`, `BRANCH` non-empty, not a submodule |
| Isolated copy, detached HEAD (externally managed) | `GIT_DIR != GIT_COMMON`, `BRANCH` empty |
| Has an online home | `HAS_REMOTE` non-empty |

## Step 4: Find the base branch

Only needed if "apply locally" is on the menu (Step 5). Figure out what this
work branched from:

```bash
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

If neither resolves, ask plainly: "This work split off from `main` — is that
right?" Don't guess silently.

## Step 5: Present the choices (kept deliberately small)

**The original always offers four choices, including "make a Pull Request."**
For a total beginner, "Pull Request" is an unfamiliar idea, and it only makes
sense at all when the project actually has an online home. So:

- **Only show the "put it online for review" choice when a remote actually
  exists** (`HAS_REMOTE` is non-empty). No remote → drop that choice.
- **The "apply to your real project" choice is available** unless we're on a
  detached HEAD (externally managed — see below).
- **"Decide later" and "Throw it away" are always there.**

Which gives these menus. Present exactly the choices for the matching row —
don't pad them with extra explanation:

| Situation | Choices |
|---|---|
| Normal checkout / isolated copy on a named branch, **remote exists** | Apply · Put online for review · Decide later · Throw away (4) |
| Normal checkout / isolated copy on a named branch, **no remote** | Apply · Decide later · Throw away (3) |
| Detached HEAD, **remote exists** | Put online for review · Decide later · Throw away (3) |
| Detached HEAD, **no remote** | Decide later · Throw away (2) |

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
same choices with `AskUserQuestion` instead of a numbered list if you prefer —
it's the same choices either way. A plain text menu is completely fine and is
the default. Don't force a tool where a sentence works.

## Step 6: Carry out the choice

### Apply it to your real project (local merge)

```bash
# Move to the real project root first — never merge from inside the copy.
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

git checkout <base-branch>
# Only pull if there's actually an online home to pull from (HAS_REMOTE from
# Step 3) -- running `git pull` with no remote configured is a plain error.
if [ -n "$HAS_REMOTE" ]; then git pull; fi
git merge <feature-branch>

# Re-run the tests on the merged result before trusting it.
<test command>
```

Only after the merge succeeds and tests pass on the merged result: tidy up the
copy (Step 7), then delete the branch (`git branch -d <feature-branch>`). Tell
the person plainly: "Done — it's now part of your real project."

### Put it online and ask for a review (needs a remote)

```bash
git push -u origin <feature-branch>
```

Then, in plain words: "It's online now. Someone (or you, later) can look it over
before it becomes part of the main project." **Leave the copy in place** — the
person may need it to make changes after the review. Do not tidy it up.

### Decide later (keep as-is)

Change nothing. Say: "I've left everything exactly as it is in the safe copy —
your real project is untouched. We can pick this back up anytime." **Leave the
copy in place.**

### Throw this work away (discard)

**This can't be undone, so confirm first — keep this exact, deliberate step.**
Show what will be lost and require the person to type the word:

```
This will permanently delete this work — you can't get it back:
- the branch <name>
- these saved points: <commit-list>
- the safe copy at <path>

Type 'discard' to confirm.
```

Wait for the person to type exactly `discard`. Anything else means don't
proceed. (This typed confirmation is the one explicit check this toolkit keeps
for an action that can't be reversed — don't soften it into a yes/no or skip it.)

If confirmed:

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

Save the memory note first (Step 8 — so the *why* survives), then tidy up the
copy (Step 7), then force-delete the branch (`git branch -D <feature-branch>`).

## Step 7: Tidy up the copy

**Only for "Apply" and "Throw away."** "Put online for review" and "Decide
later" always keep the copy alive.

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

- **Native exit tool first (Claude Code):** if the copy was made with
  `EnterWorktree`, leave it with the matching native tool **`ExitWorktree`**.
  Running raw `git worktree remove` on a copy the platform created leaves
  phantom state it can't see.
- **`GIT_DIR == GIT_COMMON`:** a normal checkout — there's no separate copy to
  remove. Done.
- **Copy lives under `.worktrees/` or `worktrees/`:** this toolkit created it, so
  we own removing it. From the real project root:
  ```bash
  MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
  cd "$MAIN_ROOT"
  git worktree remove "$WORKTREE_PATH"
  git worktree prune   # clean up any stale registration
  ```
- **Anywhere else:** the host environment owns this workspace. Do **not** remove
  it. If the platform has a workspace-exit tool, use that; otherwise leave it be.

## Step 8: Save a few lines to memory

Whatever the person chose — apply, online for review, decide later, or throw
away — end by saving a short wrap-up so the next session knows how this ended.
Follow `senpai-remember`'s schema: append a few plain lines to **`.senpai/log.md`**.
Do not create a new file for this.

The log belongs to the **real** project, not the copy — so it survives even when
the copy is thrown away. As `senpai-remember` does, write to the real root, and
for the "throw away" case write it *before* removing the copy:

```bash
# First entry of `git worktree list` is always the real (main) working tree.
# Use sub() to drop the "worktree " prefix, not $2/awk field-splitting --
# field-splitting truncates any path containing a space (e.g. "My Project").
ROOT=$(git worktree list --porcelain 2>/dev/null | awk '/^worktree /{sub(/^worktree /,""); print; exit}')
# The note goes in "$ROOT/.senpai/log.md".
```

Keep it to the usual few lines — did / decided / next:

```markdown
- Did: finished the login work and applied it to the real project.
- Decided: kept it — demo looked right and all checks passed (user confirmed).
- Next: start on the signup form.
```

**Even when the person throws the work away, record *why*.** A discarded attempt
still teaches something, and the point of memory is to not repeat the same dead
end next time:

```markdown
- Did: tried adding offline mode; threw it away.
- Decided: discarded — it broke the sync tests and the approach was a dead end
  (user agreed). Note: don't retry offline mode without solving sync first.
```

Then tell the person, in plain language, that it's saved — not the raw file.

## Quick Reference

| Choice | Merge | Push | Keep copy | Delete branch | Needs remote |
|---|---|---|---|---|---|
| Apply to real project | yes | – | – | yes | – |
| Put online for review | – | yes | yes | – | yes |
| Decide later | – | – | yes | – | – |
| Throw away | – | – | – | yes (force) | – |

| Situation | What changes |
|---|---|
| Tests fail (Step 2) | Stop — no choices offered, nothing applied |
| No runnable entry point | Skip Step 1, rely on tests |
| No remote configured | Drop the "put online for review" choice |
| Detached HEAD | Drop "apply locally"; host manages where it lands |
| Copy under `.worktrees/`/`worktrees/` | We tidy it up (Apply / Throw away only) |
| Copy is host-owned | Never remove it; use a native exit tool if any |

## Common Mistakes

**Applying work when tests fail** — the gate exists exactly to stop this. A good
demo in Step 1 is not a substitute; tests are the gate.

**Skipping the "show it running" step when something *is* runnable** — the demo
is the part a beginner actually understands. Skip it only when there's nothing
to run.

**Offering "put it online for review" with no remote** — the choice makes no
sense without an online home. Drop it.

**Merging from inside the copy** — `git worktree remove` and merges fail or
misbehave when run from inside the copy. `cd` to the real project root first.

**Deleting the branch before removing the copy** — `git branch -d` fails while a
worktree still references the branch. Merge, tidy the copy, *then* delete.

**Tidying up the copy after "Put online" or "Decide later"** — the person needs
it alive. Only "Apply" and "Throw away" tidy up.

**Skipping the typed "discard" confirmation** — it's the one guard against
accidentally deleting work that can't be recovered.

**Forgetting to record *why* on a discard** — the lesson is lost and the same
dead end gets retried later.

## Red Flags

**Never:**
- Apply work to the real project when tests fail.
- Merge without re-checking tests on the merged result.
- Throw work away without the typed `discard` confirmation.
- Push or force-push without the person asking for it.
- Remove a copy before confirming the merge succeeded.
- Tidy up a copy you didn't create (only under `.worktrees/`/`worktrees/`).
- Run `git worktree remove` from inside the copy being removed.
- Offer the online-review choice when no remote exists.
- Recreate file-level allowlists or approval tokens — isolation plus this one
  keep-or-discard choice is the whole safety model.

**Always:**
- Show it running when you can, before anything technical.
- Confirm tests pass before offering any choice.
- Detect the environment (isolated? remote?) before building the menu.
- Present exactly the choices for the matching situation, in plain words.
- Prefer a native exit tool (`ExitWorktree`) over raw git for cleanup.
- Tidy up the copy for "Apply" and "Throw away" only.
- Save a few plain lines to `.senpai/log.md` at the real project root — always,
  including the *why* on a discard.
