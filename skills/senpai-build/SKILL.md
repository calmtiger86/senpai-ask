---
name: senpai-build
description: Use to execute an already-approved plan in `.senpai/current-plan.md`, one task at a time — implement a task, commit it, review it (does it match the plan, is it well built), and only then move on. Errors that come up during a task are found and fixed here, at the root cause. This skill only builds tasks the user already approved; it never invents new work, and it never decides whether to keep the result (that is senpai-finish's job).
---

# Senpai Build

## Overview

Work through the approved plan task by task. For each task: dispatch a fresh
builder to implement just that one task, commit it, then have a fresh reviewer
check it against the plan (spec first, code quality second). A task is done only
when the review is clean. After all tasks, one broad review of the whole branch.
DRY. YAGNI. TDD. A fresh builder per task keeps each one focused and stops one
task's confusion from leaking into the next.

**Announce at start:** "I'm using senpai-build to build the approved plan one
small step at a time, checking each step before moving on."

## The two hard lines this skill does not cross

- **Only build what was approved.** The tasks live in `.senpai/current-plan.md`
  and the user already said yes to them (that's `senpai-plan`'s job, done before
  this). Building a task the plan doesn't contain, touching a file no task names,
  or quietly adding "nice to have" work is a **spec violation** — the review
  exists to catch exactly that. If you think the plan is missing something, stop
  and ask the user; do not add it yourself.
- **You do not decide whether to keep the work.** This skill implements and
  reviews inside the isolated copy. Whether any of it gets applied to the real
  project is `senpai-finish`'s call, with the user's explicit yes. Never merge,
  push, or apply to the real project from here.

**Precondition — isolation.** Run this only inside the isolated workspace that
`senpai-isolate` set up. If you are not in one (the real project checkout), stop
and run `senpai-isolate` first. Building directly in the real project defeats
the whole safety model.

## Continuous execution

Once the plan is approved, execute all tasks without pausing to ask "should I
continue?" between them. The user asked you to build the plan — build it. Stop
only when: a task is genuinely BLOCKED and you can't resolve it, real ambiguity
prevents progress, or all tasks are complete. After each task passes, show the
user **one plain-language line** (see below), then keep going.

## The per-task loop

For every task in the plan, in order:

1. **Dispatch a fresh builder** for just that one task (template below).
2. Builder implements, tests (TDD), commits, self-reviews, reports its status.
3. **Handle the status** (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT).
4. **Dispatch a fresh reviewer** on the task's diff (template below) — spec
   compliance first, then code quality.
5. If the review finds Critical/Important issues, **dispatch a fix**, then
   re-review. Repeat until the review is clean.
6. **Record progress** in `.senpai/log.md` and show the user one plain line.
7. Move to the next task.

After the last task: **one broad review of the whole branch** (below).

## Step 0: Detect how you dispatch subagents

Before Task 1, figure out how you'll run each builder and reviewer. Use the
platform's native way; never reinvent one.

- **Claude Code:** dispatch each builder and reviewer with your session's
  native subagent-dispatch tool (currently named `Agent`; tool names can
  change between versions, so if that name isn't available, look for whatever
  tool spawns an isolated subagent). Give each one only what it needs for its
  task — never your whole session history. This is the normal path.

- **Codex CLI:** if your Codex version supports delegating to subagents, use
  that.

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

- **Mechanical task** (one or two files, the plan already contains the code to
  write, clear spec) → the **cheapest** tier. It's transcription plus testing.
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
line, the Files list, the Interfaces block, and every step with its code]

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
5. Commit your work.
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
Compare the diff to what was requested:
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
note it (see the log section). If the cause turns out to be the plan itself
being wrong, stop and bring it back to the user — don't quietly rewrite the plan.

## Recording progress — in `.senpai/log.md`, not a new file

Conversation memory doesn't survive compaction, so progress lives in a file.
This toolkit keeps that in the **one** running log, `.senpai/log.md` — do **not**
create a separate progress ledger. Responsibilities split cleanly:

- `.senpai/current-plan.md` (owned by `senpai-plan`) is the **checklist** — its
  `- [ ]` / `- [x]` boxes track which tasks exist and which are finished. Tick a
  task's box when its review comes back clean.
- `.senpai/log.md` (owned by `senpai-remember`) is the **running story** — after
  each task passes review, append one line under the current session's entry,
  e.g. `- Done: Task 3 (password check) — tests pass (commit a1b2c3d, review clean)`.
  Add a second line for anything that surprised you or any decision you made.

Write to the **real** project's `.senpai/`, not the throwaway copy's, so it
survives keep-or-discard (the first entry of `git worktree list` is the real
project root). **Recovery after compaction:** re-read `.senpai/log.md` and
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

When all tasks are built and the final review is clean, you're done building —
but **you do not keep or apply the work.** Hand off to `senpai-finish`, which
runs the result to confirm it works and then decides with the user whether to
keep it or throw it away. Tell the user plainly, e.g.:

> "All the steps are built and checked. Next I'll actually run it and we'll
> decide together whether to keep this or start over — that's the finish step."

Do not merge, push, or apply anything to the real project here.

## Red flags

**Never:**
- Build a task the approved plan doesn't contain, or touch a file no task names.
  That's a scope violation — it must be caught in review, not shipped.
- Add "nice to have" work the user didn't approve. Silent scope growth is the
  thing the review's Extra/spec check exists to stop.
- Run outside the isolated copy from `senpai-isolate`, or merge/apply to the
  real project (that's `senpai-finish`).
- Start building on the real main branch without the user's explicit consent.
- Skip a review, or accept a review missing either verdict (spec AND quality).
- Move to the next task with open Critical/Important findings.
- Dispatch two builder subagents in parallel on the same branch (they'll clash).
- Leave a subagent's model unspecified (it inherits the priciest one).
- Patch a symptom instead of the root cause when something breaks.
- Create a separate progress ledger — progress goes in `.senpai/log.md`.
- Re-dispatch a task the log already marks complete (check after any compaction).
- Tell the reviewer what *not* to flag or pre-rate a finding's severity — let it
  raise the issue and adjudicate it in the loop.

**Always:**
- Confirm you're in the isolated copy before Task 1.
- Build only the approved tasks, in order, one at a time.
- Review every task (spec first, quality second) and loop until clean.
- Name the model tier on every dispatch.
- Record each finished task in `.senpai/log.md` and show the user one plain line.
- End with a whole-branch review, then hand off to `senpai-finish`.
