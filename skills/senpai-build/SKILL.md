---
name: senpai-build
description: >
  Builds an already-approved plan (`.senpai/current-plan.md`) one task at a
  time — implement, check, commit, review — and fixes errors at the root
  cause: "이대로 진행" once the plan is approved, "에러 났어", "안 돼",
  "이거 왜 안 돼", "build it", "it broke". Builds only approved tasks; never
  decides whether to keep the result (senpai-finish's job).
---

# Senpai Build

## Overview

Work through the approved plan task by task. For each task: dispatch a fresh
builder to implement just that one task, commit it, then have a fresh reviewer
check it against the plan (spec first, code quality second). A task is done only
when the review is clean. After all tasks, one broad review of the whole branch.
No repetition, nothing speculative, test before trust. (DRY, YAGNI, TDD are
shorthand for you — never show these abbreviations to the person.) A fresh
builder per task keeps each one focused and stops one task's confusion from
leaking into the next.

**Announce at start:** "I'm using senpai-build to build the approved plan one
small step at a time, checking each step before moving on."

## The two hard lines this skill does not cross

- **Only build what was approved.** The tasks live in `.senpai/current-plan.md`
  — the copy's own one if it has it (the real project was blocked from inside
  the copy, see `senpai-remember`), otherwise `$ROOT/.senpai/current-plan.md`
  — and the user already said yes to them (that's `senpai-plan`'s job, done before
  this). Building a task the plan doesn't contain, touching a file no task names,
  or quietly adding "nice to have" work is a **spec violation** — the review
  exists to catch exactly that. If you think the plan is missing something, stop
  and ask the user; do not add it yourself.
- **You do not decide whether to keep the work.** This skill implements and
  reviews inside the isolated copy. Whether any of it gets applied to the real
  project is `senpai-finish`'s call, with the user's explicit yes. Never merge,
  push, or apply to the real project from here.

**Precondition — no plan file.** If `current-plan.md` exists in neither place
(e.g. the user said "에러 났어" or "build it" with no plan in progress), stop
here: route to `senpai-plan` if `.senpai/log.md` has an agreed direction not yet
finished (an `Agreed:` line with no `Finished:` after it), otherwise to
`senpai-brainstorming`. This skill only executes an already-approved plan, it
never invents one.

**Precondition — isolation preferred.** Normally you run inside the isolated
workspace that `senpai-isolate` set up. If you're in the real project checkout
and `senpai-isolate` hasn't run yet, stop and run it first. However, if
`senpai-isolate` already ran and legitimately chose to work in place (user
asked to work in place, sandbox blocked it, or empty folder), that's fine — proceed here
with the understanding that `senpai-finish` is the undo path.

## Continuous execution

Once the plan is approved, execute all tasks without pausing to ask "should I
continue?" between them. The user asked you to build the plan — build it. Stop
only when: a task is genuinely BLOCKED and you can't resolve it, real ambiguity
prevents progress, or all tasks are complete. After each task passes, show the
user **one plain-language line** (see below), then keep going.

## The per-task loop

For every task in the plan, in order:

1. **Dispatch a fresh builder** for just that one task (template below) —
   never two builders at once on the same branch; they clash.
2. Builder implements, tests (TDD), commits, self-reviews, reports its status.
3. **Handle the status** (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT).
4. **Dispatch a fresh reviewer** on the task's diff (template below) — spec
   compliance first, then code quality. Don't tell it what not to flag or
   pre-rate a finding's severity; adjudicate findings in the fix loop.
5. If the review finds Critical/Important issues, **dispatch a fix**, then
   re-review. Repeat until the review is clean.
6. **Record progress** in `.senpai/log.md` and show the user one plain line.
7. Move to the next task.

**Small plan** (`**Size:** small` in the plan header): build each task yourself
in this session — no builder subagent: implement, run the task's Check, commit.
After the last task, dispatch **one** fresh reviewer over the whole diff
(`git diff <start>..HEAD`, `<start>` = the commit before the first task),
tier scaled to the diff. You wrote the code, so the review can't be yours — if
you have no way to dispatch a subagent, do it as Step 0's fallback says: a
separate, deliberate pass over the diff. That one review replaces the per-task
reviews and the final whole-branch review; if it finds Critical/Important
issues, fix them and review again until clean. Commit as the builder template's
step 5 says (files by name, never `git add -A`, nothing under `.senpai/`).
Switch to the full loop if a task needs a file the plan didn't name (stop and
ask first, as always) or the same step fails twice. If a hard-to-undo signal
shows up, stop and ask the person before going on. A plan with no `**Size:**`
line is full.

After the last task of a full plan: **one broad review of the whole branch**
(below).

## Step 0: Detect how you dispatch subagents

Before Task 1, figure out how you'll run each builder and reviewer. Use the
platform's native way; never reinvent one.

- **Claude Code:** dispatch each builder and reviewer with your session's
  native subagent-dispatch tool (currently named `Agent`; tool names can
  change between versions, so if that name isn't available, look for whatever
  tool spawns an isolated subagent). Give each one only what it needs for its
  task — never your whole session history. This is the normal path.
  Subagents may run in the background: wait for each one's completion notice
  before using its result or starting the next task.

- **Codex:** if your Codex version supports delegating to subagents, use
  that. Before the first commit, tell the person in one plain sentence that
  Codex may ask them to approve saving each step — its sandbox keeps `.git`
  read-only.

  **Fallback if that isn't there.** If your environment has no working
  subagent dispatch — or it behaves differently than expected — don't fight it.
  **Gracefully drop to sequential execution in this same session:** do each
  task yourself, one at a time, in order — implement, test, commit — and then do
  the review as a **separate, deliberate pass** with fresh eyes (re-read the
  diff from scratch and apply the same spec + quality rubric below) before
  starting the next task. You lose the truly-fresh context a subagent gives, so
  be stricter about treating the review as its own step, not a rubber stamp. The
  quality gate stays; only the mechanism changes.

- **Any other platform:** if you see a native subagent/parallel-task mechanism,
  use it. If not, use the same sequential fallback above.

The loop, the reviews, and the gates below are identical no matter which path
you're on. Only *how you dispatch* changes.

## Model selection (relative tiers only)

Use the least powerful model that can do each role — it's cheaper and faster.
Never hard-code a model name; reason in relative tiers.

- **Mechanical task** (one or two files, clear spec and check) → the
  **cheapest** tier.
- **Integration / judgment task** (several files, coordination, debugging) →
  the **standard** tier.
- **Design / architecture task**, and **the final whole-branch review** → the
  **most capable** tier.
- **Reviewers** → scale to the diff's size and risk. A tiny mechanical diff
  doesn't need the top tier; a subtle change does.

**Always name the tier explicitly when you dispatch.** If you leave the model
unspecified, the subagent silently inherits your session's model — usually the
most capable and most expensive one — which quietly defeats this whole section.

## Dispatching a builder

Hand the builder its one task and the context it can't infer. Fill this in:

```
Implement Task N: [task name] — model tier: [cheapest | standard | most capable]

Your task (from the approved plan):
[paste this task's block from .senpai/current-plan.md — the plain-language
line, Files, Interfaces, Do, and Check]

Where this fits:
[one or two lines — what this task is part of, and anything from earlier tasks
it depends on: exact names, signatures, and types it consumes]

Before you start: if anything about the requirements, approach, or assumptions
is unclear, ask now. Ask again anytime during the work — don't guess.

Your job:
1. Implement exactly what the task specifies — nothing extra (YAGNI).
2. Follow TDD if the task says to: write the failing test, watch it fail, then
   the minimal code to pass.
3. Only touch the files this task names. If you find yourself needing a file the
   task doesn't list, stop and report it — don't silently expand scope.
4. Run the focused test while iterating; run the fuller suite once before you
   commit.
5. Commit your work. Stage the files this task names, by name — never
   `git add -A`, and never anything under `.senpai/`. In Codex, run
   `git commit` as an escalated command (`require_escalated`) — a plain run
   fails with a permission error. If it's refused or still fails, stop and
   report it; don't move on with the task uncommitted.
6. Self-review with fresh eyes, then report.

Self-review before reporting:
- Completeness: did I implement everything the task asked, and handle its edge
  cases?
- Discipline: did I build ONLY what was asked, add nothing extra, and follow the
  existing code's patterns?
- Quality: clear names, clean code, explicit error handling?
- Tests: do they check real behavior (not mocks)? Is the test output clean (no
  stray warnings)?
Fix anything you find before reporting.

Report back with ONLY:
- Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commits (short SHA + subject)
- One-line test summary (e.g. "7/7 passing, output clean")
- Any concerns
If BLOCKED or NEEDS_CONTEXT, say exactly what you're stuck on and what would
unblock you. Never quietly ship work you're unsure about.
```

## Handling the builder's status

- **DONE** — proceed to the review.
- **DONE_WITH_CONCERNS** — read the concerns first. If they're about
  correctness or scope, resolve them before reviewing. If they're just
  observations ("this file is getting big"), note them and review.
- **NEEDS_CONTEXT** — give the missing context and re-dispatch.
- **BLOCKED** — figure out why: a context gap → add context and re-dispatch; not
  enough reasoning power → re-dispatch on a more capable tier; task too large →
  split it; the plan itself is wrong → stop and ask the user. Never make the
  same model retry the same task unchanged, and never ignore an escalation.

## Reviewing a task

After a builder reports DONE, get the diff for that task and hand it to a fresh
reviewer. Get the diff with plain git (no special tooling needed):

```bash
git diff <base>..HEAD          # <base> = the commit you noted BEFORE this task
git diff --stat <base>..HEAD   # (never HEAD~1 — that drops all but the last commit)
```

Fill in the reviewer dispatch:

```
Review Task N (spec compliance + code quality) — model tier: [scale to the diff]

What was requested:
[paste the same task block from the plan the builder worked from]

Global constraints that bind this task (copy verbatim from the plan's Global
Constraints — exact values, formats, and relationships):
[...]

The diff to review:
[paste the `git diff <base>..HEAD` output, or its file path]

Do NOT trust the builder's report — treat it as unverified claims and check them
against the diff yourself. A stated rationale ("left it out per YAGNI") never
lowers a finding's severity; judge the code on its merits. This is read-only:
don't change the working tree, index, or branch.

### Part 1 — Spec compliance
Compare the diff to what was requested — the task's Do, Files, Interfaces, and
Check. The plan has no code to match line by line; judge whether the diff does
what Do says, and run the Check if it changes no files.
- Missing: requirements skipped or claimed but not actually implemented.
- Extra: anything built that the plan did not ask for — over-engineering,
  unrequested "nice to haves", files no task named. **This is the same question
  as: did the scope quietly grow beyond what the user approved?** The user said
  yes to a specific plan; anything past it is a spec violation, however small or
  well-intentioned. Flag it here.
- Misunderstood: right feature built the wrong way.
If a requirement can't be verified from this diff alone (it lives in unchanged
code), say so as a ⚠️ item rather than crawling the codebase.

### Part 2 — Code quality
- Clean separation, explicit error handling, DRY without premature abstraction,
  edge cases handled.
- Tests verify real behavior, not mocks; the task's edge cases are covered.
- Each file has one clear responsibility. Flag files this change made large;
  don't flag pre-existing size.

Cite file:line for every finding. Categorize by real severity:
- Critical / Important = the task can't be trusted until it's fixed (wrong or
  fragile behavior, a missed requirement, swallowed errors, a test that asserts
  nothing, verbatim duplicated logic).
- Minor = polish, "coverage could be broader".
Acknowledge what was done well, then list issues.

Report:
- Spec compliance: ✅ compliant | ❌ issues (list them) | ⚠️ can't verify (list)
- Strengths
- Issues by severity (Critical / Important / Minor), each with file:line
- Task quality: Approved | Needs fixes
```

**Both verdicts are required.** A report missing either the spec verdict or the
quality verdict is not a passing review. Don't accept "close enough" on spec —
if the reviewer found spec issues, the task is not done.

**On ⚠️ "can't verify" items:** you hold the plan and cross-task context the
reviewer doesn't. Resolve each one yourself before marking the task complete. If
it turns out to be a real gap, treat it as a failed spec review and send it back.

## The fix loop

If the review has Critical or Important findings, dispatch **one** fix (not one
per finding) with the full list. The fix must re-run the tests covering its
change and report the results — the report is the test evidence. Then re-review
(both verdicts again). Repeat until the review is clean. Record Minor findings
in `.senpai/log.md` and point the final whole-branch review at them so it can
decide which to fix before finishing. Only move to the next task once the review
is clean.

## When a step breaks — fix the cause, not the symptom

There is no separate debugging skill; errors during a build are handled right
here, at the step that broke. When a test or the build fails, find the **root
cause** before changing anything — don't patch the symptom (don't loosen a test
to make it pass, don't swallow the error, don't special-case the one input that
failed). If the same kind of error shows up a third time, that's a signal to
note it (see `senpai-remember`). If the cause turns out to be the plan itself
being wrong, stop and bring it back to the user — don't quietly rewrite the plan.

**Stuck after three attempts on the same problem?** If the same error or
approach has failed three times and you can't find the root cause, don't keep
hammering. Switch to `senpai-unstuck` for a fresh angle, then come back.

## Recording progress — in `.senpai/log.md`, not a new file

When a task's review comes back clean (small plan: once its Check passes and
it's committed), tick its box in `current-plan.md` and
append `- Done: Task N (<name>) — tests pass (commit <sha>, review clean)` to
`.senpai/log.md`, plus a line for anything surprising or decided (the log's
rules live in `senpai-remember`). Write where `senpai-remember` says: the
real project's `.senpai/`, or the copy's own `.senpai/` when the real project
is blocked from inside the copy (`senpai-finish` carries those lines home).
**Recovery after compaction:**
re-read that `.senpai/log.md` and
`git log`. Tasks the log marks done are done — do not re-dispatch them; resume at
the first task not yet marked complete. Trust the log and git over your memory.

## Show the user one plain line per task

After each task passes review, tell the user — in words a total beginner
understands — what was checked and that it passed. One line, no jargon:

> "Task 3 done: the login button now actually checks the password. I tested it
> with a right password and a wrong one — it let the right one in and blocked the
> wrong one."

Not: "wired `verifyPassword()` into `src/auth.js:42`, 7/7 green." The log file
can be technical; what you *say* to the user never is.

## The final whole-branch review

After every task is complete, do one broad review of the entire branch — this is
the merge-level check the per-task gates don't replace.

- **With subagents:** dispatch one final reviewer on the **most capable** tier,
  over the whole branch's diff (`git diff <branch-start>..HEAD`, where
  `<branch-start>` is `git merge-base <main-branch> HEAD`). Include the Minor
  findings you logged along the way so it can triage which to fix before
  finishing. If it returns findings, dispatch **one** fix with the complete
  list — not one fixer per finding.
- **On Codex CLI (optional):** you can replace the final review with the native
  **`/review`** command — a read-only, prioritized review that changes nothing in
  the tree. It's a natural fit for this last, whole-branch pass.
- **Sequential fallback:** do the final review yourself as a deliberate, fresh
  pass over the whole-branch diff, applying the same rubric.

## Handing off to senpai-finish

Before handing off, make sure the plan's checks have run on the finished copy —
the last task's run counts if nothing changed after it. Keep what you saw
(output, screenshot) and the commit it ran on (`git rev-parse --short HEAD`):
`senpai-finish` shows that to the person instead of running it again.

When all tasks are built and the final review is clean, you're done building —
but **you do not keep or apply the work.** Hand off to `senpai-finish`, which
runs the result to confirm it works and then decides with the user whether to
keep it or throw it away. Tell the user plainly, e.g.:

> "All the steps are built and checked. Next I'll actually run it and we'll
> decide together whether to keep this or start over — that's the finish step."

Do not merge, push, or apply anything to the real project here.
