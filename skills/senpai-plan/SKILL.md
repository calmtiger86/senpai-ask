---
name: senpai-plan
description: >
  Turns an agreed direction into small (2–5 minute), checkable tasks and
  gets the person's yes before any code — "계획 보여줘", "어떻게 만들 거야?",
  "2번 단계 바꿔줘", "show me the plan". Writes only the plan, never product
  code (senpai-build's job), and never approves its own plan.
---

# Senpai Plan

## Overview

Turn an agreed design into a plan of small, independently testable tasks, then get the user to approve it. Write the plan so a builder with zero context for this codebase can do each task: which files to touch, the names other tasks rely on, the constraints, and a check that proves the task works. Don't write the code itself — the builder writes it. No repetition, nothing speculative, test before trust, commit often. (DRY, YAGNI, TDD are shorthand for you — never show these abbreviations to the person.)

**This skill's boundary — two hard lines:**

- **It plans and gets approval. It does not build.** Writing the plan document is fine (that markdown file is the deliverable). Writing product code, running the implementation, editing real source files — that is `senpai-build`, the next skill. Do not start it here.
- **The AI never approves its own plan.** Approval is always an explicit act by the user. There is no path from "I wrote the plan" to "so I'll start building." The user says yes first, every time.

**Announce at start:** "I'm using senpai-plan to turn the agreed design into small, reviewable steps for you to approve."

**Context:** If working in an isolated workspace, it should have been set up via `senpai-isolate` before this. The plan is written for execution inside that workspace.

## Step 0: Detect your environment and approval path

Before anything else, figure out how you will get the plan approved at the end. This decides which native path you use so you never reinvent one.

Detect two things:

1. **Are you in Plan Mode?** (Claude Code's — the one with `ExitPlanMode`.) You are in Plan Mode if the harness is holding edits until you present a plan — i.e. an `ExitPlanMode` tool is available and file writes are gated on plan approval. If so, `ExitPlanMode` is your approval path (the most native one — this very interaction, where the tool won't let you build until the user approves, is Plan Mode).
2. **Which assistant are you?** Claude Code (has `ExitPlanMode` / `AskUserQuestion` tools) or Codex (neither of those; it may have `request_user_input`).

Map to an approval path — you'll use it at the very end, in the Final Approval Gate:

| Environment | Approval path |
|---|---|
| Claude Code, already in Plan Mode | Present the plan and call `ExitPlanMode` to get approval. Most native — prefer this. |
| Claude Code, not in Plan Mode | Show a short text summary, then call `AskUserQuestion` with choices: "Proceed as-is" / "I want changes" / "Cancel". |
| Codex | Show the plan as text and ask whether to proceed, change, or cancel — with `request_user_input` if it's in your tools — then end your turn and wait. Codex's Plan mode (`/plan`) doesn't allow writing files; if the person is in it, save the plan once they leave it. |

**Optional tip (not required):** if you got here from brainstorming and there are two genuinely different approaches worth building out separately, in Claude Code you can mention `/branch` (fork this conversation to try one direction without losing the other). Offer it only if a real fork would help — don't push it.

## Scope Check

If the design covers multiple independent subsystems, it should have been split during brainstorming. If it wasn't, say so and suggest one plan per subsystem — each plan should produce working, testable software on its own. Don't quietly cram unrelated systems into one plan.

## File Structure

Before defining tasks, map which files get created or modified and what each is responsible for. This is where decomposition gets locked in.

- Each file has one clear responsibility. Prefer smaller, focused files over large ones that do too much.
- Files that change together live together. Split by responsibility, not by technical layer.
- In an existing codebase, follow established patterns. Don't unilaterally restructure; if a file you're touching has grown unwieldy, a split is reasonable.

This structure informs the task breakdown. Each task should produce self-contained changes that make sense on their own.

## Task Right-Sizing

A task is the smallest unit that carries its own test cycle and is worth a fresh reviewer's gate. Fold setup, config, scaffolding, and docs into the task whose deliverable needs them. Split only where a reviewer could meaningfully reject one task while approving its neighbor. Each task ends with an independently testable deliverable.

Aim for tasks of about 2–5 minutes of work each; split one that bundles two
deliverables.

## Small or full?

Decide before writing tasks. **Small:** one or two tasks touching one or two
files, and none of `senpai-brainstorming`'s hard-to-undo signals came up.
**Full:** anything else. Write it in the header (`**Size:** small` or
`**Size:** full`) — `senpai-build` reads it and doesn't judge again. A small
plan is just the header and its tasks (no Approach or Tech lines). Either way,
the person approves it.

## Plan Document Header

**Every plan starts with this header:**

```markdown
# [Feature Name] Plan

> **For the builder:** REQUIRED NEXT SKILL: use senpai-build to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not start building until the user has approved this plan.

**Goal:** [One sentence describing what this builds]

**Size:** [small | full — see "Small or full?"]

**Approach:** [2-3 sentences about how]

**Tech:** [Key technologies/libraries]

## Global Constraints

[The design's project-wide requirements — version floors, dependency limits,
naming and copy rules, platform requirements — one line each, exact values
copied verbatim from the agreed design. Every task's requirements implicitly
include this section.]

---
```

## Task Structure

Each task shows the plain-language summary first (for the user), then the technical detail (for the builder).

````markdown
### Task N: [Component Name]

**In plain language:** [one line — what this task makes work, and how you'll
know it worked, with no jargon. e.g. "Makes the login button actually check
the password, and proves it by testing a right and a wrong password."]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py` (the function or section)
- Test: `tests/exact/path/to/test.py`

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter and
  return types. A task's builder sees only their own task; this block is how
  they learn the names and types neighboring tasks use.]

**Do:** [What to change, in a few plain sentences: the behavior, the edge
cases, anything a builder could get wrong. Name functions, values, and
messages exactly where they matter — but don't write the code; the builder
writes it.]

**Check:** [How to prove it works, runnable exactly as written. With a test
runner: the test to write first and what it asserts, the command, and the
expected result (fails before, passes after). Without one — e.g. a static
page with no build step — the command or page to open, what to do, and what
correct output looks like; `senpai-finish` treats "no tests" as a valid state.]

- [ ] Build it, run the Check, commit
````

## No vague tasks

Every task must give the builder what it needs. These are **plan failures** —
never write them:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "handle edge cases" without saying which
- "Similar to Task N" (the builder may read tasks out of order — say it again)
- A task without a Check that runs exactly as written
- Names used across tasks that no task's Interfaces defines

## Where to save the plan

Save one short plan file at the **real project root** (same location as
`log.md` — use the `git worktree list --porcelain` snippet from
`senpai-remember`):

```
$ROOT/.senpai/current-plan.md
```

Don't commit it. If the real project can't be written from inside the copy,
save it in the copy's `.senpai/` instead (`senpai-remember` explains when);
`senpai-build` looks there first.

**Timing:** save this file *after* the user approves — not before. In Plan
Mode, file writes are gated on approval, so present the plan first, get the
yes, then write the file. Outside Plan Mode the order doesn't matter, but
keep it consistent: approve first, save second.

One lightweight file, not a vault or a dated archive tree. Keep the
schema minimal (the header + tasks above) and don't duplicate what
`senpai-remember` stores; this file is just the plan the builder follows, and
it's replaced next time you plan. Don't invent extra directories.

## Self-Review

After writing the complete plan, look at the agreed design with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

1. **Design coverage:** Skim each part of the agreed design. Can you point to a task that implements it? List any gaps and add the missing task.
2. **Vague-task scan:** Search the plan for the failures in "No vague tasks" above. Fix them.
3. **Type consistency:** Do the types, signatures, and names in later tasks match what earlier tasks defined? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug — fix it.

Fix issues inline; no need to re-review.

## Minimality Self-Review (the whole plan)

Now step back from the individual tasks and check the plan **as a whole** — before you show it to anyone. The goal is to cut anything that's in the plan "just in case." Walk these rungs and **stop at the first that holds** for each proposed task or piece of scope:

1. **Does this feature really need to exist right now?** Speculative "we might need it later" = cut it, and say so in one line.
2. **Does a standard tool or library already do it?** Use that instead of a custom task.
3. **Does a native platform feature already cover it?** (A DB constraint over app code, `<input type="date">` over a custom picker, the assistant's own permission/rewind over a hand-rolled guard.)
4. **Does something already in the project do it?** Reuse it instead of adding a new task.
5. **Can it be one line?** Then it's one line, not a multi-step task.
6. **Only then:** the minimum set of tasks that actually works.

If any task survives only as insurance, delete it here. A smaller plan the user fully understands beats a thorough one they don't.

**Never cut these for the sake of smallness:** anything the user explicitly asked for and approved, and anything touching security, privacy, data-loss prevention, auth boundaries, or payment safety. Minimality trims speculation, not safety.

## Final Approval Gate

Before you present the plan, run this five-question self-check. If any answer is "no" (or "not sure"), fix that part first — re-check it with the user if needed — **before** showing the plan:

1. Does the user actually understand this?
2. Is this feature needed now?
3. (This is the planning stage) Are the completion criteria clear?
4. Has the scope quietly grown beyond what we agreed during brainstorming?
5. Is there a smaller way to do this?

When all five hold, present the plan for approval using the path you picked in Step 0:

- **All paths — show the person this first:** goal + the plain-language line
  per task (the "In plain language" field from each task). This is what the
  person actually reads and approves. The full technical plan lives in
  `.senpai/current-plan.md` for the builder — it is not the approval surface.
- **Claude Code, in Plan Mode:** show the plain summary above, then call `ExitPlanMode`.
- **Claude Code, not in Plan Mode:** show the plain summary, then call `AskUserQuestion` with "Proceed as-is" / "I want changes" / "Cancel".
- **Codex:** show the plain summary, ask whether to proceed, change, or cancel, and wait for the answer.

**The invariant:** you cannot move to `senpai-build` until the user has approved. You do not approve on their behalf, and you do not treat "I finished writing the plan" as approval. If they ask for changes, revise and re-present. Only an explicit yes from the user opens the next step.

## After Approval — Execution Handoff

Once (and only once) the user approves: if there's no isolated copy yet
(Plan Mode kept `senpai-isolate` from running), run `senpai-isolate` first —
approval of the plan is not a go-ahead to edit the real project. Then save the
plan to `.senpai/current-plan.md` and hand off to `senpai-build`. Use the safe default
(step-by-step with a review after each task) without asking the person to
choose an execution strategy — that's a mechanical decision they can't
meaningfully make. Just say plainly:

**"Plan approved — I'll build it now and check the work as I go."**

Then hand off to `senpai-build`. Do not begin building in this skill.
