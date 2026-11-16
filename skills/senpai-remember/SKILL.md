---
name: senpai-remember
description: >
  Plain-language memory across sessions — "이어서 하자", "지난번에 어디까지
  했지", "저장해줘", "오늘 여기까지", "continue", "where did we leave off",
  "remember this", "that's it for today". Recalls where things were left at
  session start and saves a few lines on what happened and why. /resume and
  `codex resume` reopen one exact session; this keeps the story across many.
---

# Senpai Remember

Carry a coding project's story from one session to the next, in words a total
beginner can read. A patient senior colleague doesn't just remember *what* the
code says — they remember *why* you dropped the login screen three weeks ago,
and what you meant to do next. That memory is this skill's whole job.

**Speak the user's own language.** If they wrote to you in Korean, recall and
save in Korean; if in English, English. The plain-language summaries you show
the person always match the language they're speaking.

## What this is — and what it never touches

This is the **check-in / check-out for a coding project**: at the start of a
session it *checks in* by recalling where you were, and at the end it *checks
out* by saving a few lines about what happened.

**Two hard lines this skill does not cross:**

- It writes **only its own memory notes** under `.senpai/` (`log.md`, and
  optionally `decisions.md`). It never writes or edits product code, never
  scaffolds anything, never runs the build.
- It never changes any approval or "go" state. Keeping or discarding real work
  is `senpai-finish`'s call; approving a plan is `senpai-plan`'s. This skill
  only records and recalls. Pure memory.

## Two layers: let the native tools do the native job

Two different kinds of "remembering" exist. Don't reinvent the first one —
point the person to the native command in one line.

| What the person wants | What actually does it |
|---|---|
| Jump back into the *exact* session — the precise commands and files from before | **Native tools.** Claude Code: `/resume` (pick a past session). Codex CLI: `codex resume` (`--last`, `--all`, or search). |
| Remember the *story* across many sessions — what got built weeks ago and **why** | **This skill's `.senpai/log.md`.** |

## The files — keep it to two

The entire memory is one file, with an optional second only if the first gets
crowded. Do not recreate a folder of many notes.

- **`.senpai/log.md`** — the running story. Append a few lines per session:
  what you did, why you decided it that way, and what to pick up next. Plain
  language. This is the one file that always exists.
- **`.senpai/decisions.md`** — *optional*, and only if `log.md`'s "why we
  decided X" notes grow enough to crowd out the story (see "Splitting out
  decisions" below). Don't create it up front. An empty second file is exactly
  the premature structure this toolkit avoids.
- **`.senpai/current-plan.md`** — **not yours.** `senpai-plan` owns it. You may
  read it to see what the current plan is, but never write or restructure it.

**Where the files live.** Memory belongs to the *real* project, not to a
throwaway copy, so it survives whether the work is later kept or discarded.
Locate the main project root and write there:

```bash
# First entry of `git worktree list` is always the main working tree.
# Use sub() to drop the "worktree " prefix, not $2/awk field-splitting --
# field-splitting truncates any path containing a space (e.g. "My Project").
ROOT=$(git worktree list --porcelain 2>/dev/null | awk '/^worktree /{sub(/^worktree /,""); print; exit}')
ROOT=${ROOT:-$PWD}   # not a git project yet: the current folder is the root
# Memory lives at "$ROOT/.senpai/".
```

**Keep `.senpai/` out of git.** Whenever you create a `.senpai/` folder, also
create `.senpai/.gitignore` containing the single line `*`. Git then ignores
the whole folder in every checkout: memory is never committed, a copy never
starts with a stale version of it, and a copy can be removed cleanly.

**When the real project can't be written.** Inside a Claude Code
`EnterWorktree` copy, edits to the real project are blocked (a Codex sandbox
may do the same). There, write to `.senpai/` inside the copy — that's the
normal path, not an error. While you're working inside that copy, its
`.senpai/` is the current one: its `current-plan.md` is the current plan, and its `log.md` holds this
cycle's lines. `senpai-finish` appends those lines to `$ROOT/.senpai/log.md`
when it leaves the copy — on every choice, for a copy on a named branch. Never copy the folder over
the real one — that would replace the project's whole history with one cycle.

## Starting a session — recall first, automatically

At the start of a session, **without being asked**, check for
`$ROOT/.senpai/log.md`. Also run `git worktree list`: if another checkout has
its own `.senpai/log.md`, read its latest entry too and mention that copy in
the recap.

- **It exists:** read the last entry (or two) and open with a short, plain
  recap, then ask whether to continue — for example:

  > "Last time we got the login button to actually check the password, and
  > decided to skip 'remember me' for now. Next up was the signup form. Want to
  > pick that up, or do something else?"

  Keep it to a few sentences. Lead with where things stood and what was next;
  offer to continue.

- **It doesn't exist:** this is a first session. Say nothing about past work —
  don't invent a history. Just start fresh.

(The session-start hook only notes that a log exists; `senpai` does the
recap. If the person opens with "이어서 하자" / "where did we leave off", do
the same thing.)

## Direction check — how far have we come?

When `log.md` has **5 or more entries**, or after a **long gap** (> 1 week
between the last entry's date and today), or after a **discard** (senpai-finish
"throw away"), add a brief direction check after the recall:

1. Read the **first entry** in `log.md` (the original goal / starting point).
2. Read the **latest entry** (where things are now).
3. Compare: has the direction shifted? Are there abandoned branches or pivots?

If the direction has noticeably changed, say so plainly:

> "We started out building a todo app, but over the last few sessions it's
> turned into more of a project tracker with team features. The original plan
> was simpler — is this still where you want to go, or should we refocus?"

If the direction is consistent, skip this — don't manufacture drama. Also check
`git log --oneline` and `git branch` when available to see if the commit
history or branch names tell a story the log doesn't (e.g., abandoned branches
that were never recorded as discards).

Keep it to 2–3 sentences. The point is awareness, not a formal review.

## Milestones — save immediately, don't wait for session end

When another skill passes a milestone, append one line to `.senpai/log.md`
right away — don't wait for the person to say "저장해줘" or close the session.
Non-developers close windows without saving; milestones are the lifeline.

(`senpai-brainstorming` already does this for its own milestone — it writes
the one-sentence agreement itself at its Restate Gate. This section covers
milestones from every other skill, e.g. an approved plan from `senpai-plan`.)

## Ending a session — save a few lines

When the person signals a stopping point — "오늘 여기까지", "that's it for
today", "저장해줘", or a natural wrap-up — append a short entry to `.senpai/log.md`.
A few lines, no more:

- **Did** — what actually got done this session.
- **Decided** — any real decision and its one-line reason (including any
  hard-to-undo choice that was confirmed).
- **Next** — what to pick up next time.

Then tell the person, in plain language, that it's saved and what you'll
remember — not the raw file. Don't end a working session silently; a saved line
now is what makes the next check-in possible.

## What a log entry looks like

Short, dated, plain. The raw file is a working note (jargon is fine here — see
the last section), but keep it skimmable:

Keep the line labels in English even when the rest is in the person's
language: other skills search for `Agreed:`, `Starting point:`, and
`Finished:`. Each has one writer — `Agreed:` is written only by
`senpai-brainstorming`, `Starting point:` only by `senpai-isolate`, and
`Finished:` only by `senpai-finish` (it closes a cycle). Don't repeat these
lines when saving a session.

```markdown
# Project log

## 2026-07-18
- Agreed: the login button checks the password; no "remember me" yet.
- Did: wired the login button to actually check the password (src/auth.js).
- Decided: no "remember me" for now — keeping the first version small (user agreed).
- Next: hook the same check into the signup form.
```

## When the same problem keeps coming back

If the *same kind* of mistake or error shows up for the **third** time, add one
short note inside `log.md` so future-you stops tripping on it — for example:

```markdown
- Note (seen 3×): tests fail when the dev server is still running on port 3000.
  Next time, stop it first: check `lsof -i :3000` before `npm test`.
```

That's the whole mechanism — no separate error files.

## How `senpai-build` writes here

`senpai-build` (the step-by-step builder) records its progress **in this same
`log.md`** — it must not create a separate progress ledger. The split of
responsibility:

- **`.senpai/current-plan.md`** (owned by `senpai-plan`) is the checklist — its
  `- [ ]` / `- [x]` boxes track which tasks exist and which are finished.
- **`.senpai/log.md`** (this skill) is the running story — after each task
  passes review, `senpai-build` appends one line under the current session's
  entry, e.g. `- Done: Task 3 (password check) — tests pass (commit a1b2c3d,
  review clean)`, plus a line for anything that surprised it or any decision it
  made.

So a later session reads `log.md` to see how far the build actually got and why,
without re-reading the whole plan.

## Splitting out decisions — only if you must

Start with just `log.md`. Only when its "why we decided X" notes pile up enough
that the story gets hard to skim — more than a handful of substantial decisions
each worth their own reasoning — move those reasons into `.senpai/decisions.md`
and leave a one-line pointer in `log.md` (e.g. `- Decisions live in
.senpai/decisions.md`). Until that day comes, one file is the right number.
Don't split preemptively.

## Show the user plain language, always

`.senpai/log.md` is a raw working note that *you* re-read later, so technical
bits — commit hashes, file paths, function names — are fine inside the file.
But when you actually **show** any of it to the person, translate it back into
plain words every time. They should hear "we made the login button check the
password," not "wired `verifyPassword()` into `src/auth.js:42`." The file can be
technical; what you say to the person never is.
