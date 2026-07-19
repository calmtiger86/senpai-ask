---
name: senpai-remember
description: >
  Plain-language memory that carries a coding project across sessions — the
  coding-project check-in / check-out. Runs automatically at the start of a
  session to recall where things were left off ("last time we got to here…"),
  and again when a session wraps up to save a few lines about what happened and
  why. Use when the user says "이어서 하자", "지난번에 어디까지 했지",
  "저장해줘", "오늘 여기까지", or the English "continue", "where did we leave
  off", "remember this", "save where we are", "that's it for today". Native
  /resume and `codex resume` restore the exact session; this skill adds
  the human story across many sessions that those don't keep.
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
out* by saving a few lines about what happened. Some setups already have their
own lightweight check-in / check-out commands for non-coding work (often
something like `/ci` and `/co`) — this skill does not replace those. It is the
coding-project counterpart, extended with the things a coding project needs to
remember: the decisions behind the code and the errors that keep coming back.
If a project has no such commands, this skill simply is the check-in/check-out.

**Two hard lines this skill does not cross:**

- It writes **only its own memory notes** under `.senpai/` (`log.md`, and
  optionally `decisions.md`). It never writes or edits product code, never
  scaffolds anything, never runs the build.
- It never changes any approval or "go" state. Keeping or discarding real work
  is `senpai-finish`'s call; approving a plan is `senpai-plan`'s. This skill
  only records and recalls. Pure memory.

## Two layers: let the native tools do the native job

Two different kinds of "remembering" exist. Don't reinvent the first one.

| What the person wants | What actually does it |
|---|---|
| Jump back into the *exact* session — the precise commands and files from before | **Native tools.** Claude Code: `/resume` (pick a past session). Codex CLI: `codex resume` (`--last`, `--all`, or search). |
| Remember the *story* across many sessions — what got built weeks ago and **why** | **This skill's `.senpai/log.md`.** |

`/resume` (or `codex resume`) reopens one exact past session; it can't tell you
why login was dropped three weeks ago in a *different* session, because that
reasoning lived in a session that's now closed and not the one being resumed.
That accumulated, plain-language thread is exactly what this skill keeps. So
when the person wants to retrace *precisely* where they were, point them at
the native feature in one line ("in Claude Code, `/resume` reopens the exact
session") — don't rebuild it. This skill fills the gap the native tools leave:
the human narrative that spans sessions.

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
throwaway copy. If `senpai-isolate` put you in an isolated worktree, the log
still belongs to the real project so it survives whether the work is later kept
or discarded. Locate the main project root and write there:

```bash
# First entry of `git worktree list` is always the main working tree.
# Use sub() to drop the "worktree " prefix, not $2/awk field-splitting --
# field-splitting truncates any path containing a space (e.g. "My Project").
ROOT=$(git worktree list --porcelain 2>/dev/null | awk '/^worktree /{sub(/^worktree /,""); print; exit}')
# Memory lives at "$ROOT/.senpai/". With no worktree, that's just the project root.
```

If writing to `$ROOT/.senpai/` fails (sandbox restricts writes outside the
current workspace), fall back to `.senpai/` in the current working directory.
The data survives locally either way; it just won't be visible from the main
checkout until the work is applied.

## Starting a session — recall first, automatically

At the start of a session, **without being asked**, check for `.senpai/log.md`:

- **It exists:** read the last entry (or two) and open with a short, plain
  recap, then ask whether to continue — for example:

  > "Last time we got the login button to actually check the password, and
  > decided to skip 'remember me' for now. Next up was the signup form. Want to
  > pick that up, or do something else?"

  Keep it to a few sentences. Lead with where things stood and what was next;
  offer to continue.

- **It doesn't exist:** this is a first session. Say nothing about past work —
  don't invent a history. Just start fresh.

(This assumes `senpai`'s session-start hook has already routed here. If the
person opens with "이어서 하자" / "where did we leave off", do the same thing.)

## Milestones — save immediately, don't wait for session end

When another skill passes a milestone (an agreed design from brainstorming, an
approved plan from senpai-plan), append one line to `.senpai/log.md` right
away — don't wait for the person to say "저장해줘" or close the session.
Non-developers close windows without saving; milestones are the lifeline.

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

```markdown
# Project log

## 2026-07-18
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

That's the whole mechanism. **Do not** create separate error or playbook files
(`ERR-0001.md`, `PB-0001.md`, an error index, and so on). A short "seen 3×"
note in `log.md` carries the same lesson without the file sprawl.

## How `senpai-build` writes here

`senpai-build` (the step-by-step builder) records its progress **in this same
`log.md`** — it must not create a separate progress ledger. (The original
tooling kept a standalone `progress.md`; this toolkit deliberately does not, to
keep the file count down.) The split of responsibility:

- **`.senpai/current-plan.md`** (owned by `senpai-plan`) is the checklist — its
  `- [ ]` / `- [x]` boxes track which tasks exist and which are finished.
- **`.senpai/log.md`** (this skill) is the running story — after each task it
  finishes, `senpai-build` appends one line under the current session's entry,
  e.g. `- Done: Task 3 (password check) — tests pass`, plus a line for anything
  that surprised it or any decision it made.

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

## Red flags

**Never:**
- Recreate a multi-file memory vault (per-topic notes, separate error/playbook
  files, an index). Two files at most: `log.md`, and `decisions.md` only if
  needed.
- Write or edit product code, scaffold anything, or run the build. Memory only.
- Change any approval or keep/discard state — that's `senpai-plan` and
  `senpai-finish`, never here.
- Touch `.senpai/current-plan.md` beyond reading it.
- Reinvent `/resume` or `codex resume` — point to them instead.
- Invent past history when `.senpai/log.md` doesn't exist yet.
- Paste raw log lines (hashes, paths) at the person without translating.

**Always:**
- Recall at the start of a session, save at the end — automatically.
- Keep each entry to a few plain-language lines: did / decided / next.
- Write memory to the *real* project root, so it survives keep-or-discard.
- Roll repeated-error lessons and build progress into `log.md`, not new files.
