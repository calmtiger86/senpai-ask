---
name: senpai-plan
description: Use when brainstorming has produced an agreed design and you need to turn it into small (2-5 minute), reviewable steps and get the user's approval — before any code is written. This skill writes and gets approval for a plan; it never writes product code (that is senpai-build's job) and never approves its own plan (only the user can).
---

# Senpai Plan

## Overview

Turn an agreed design into a plan of bite-sized, independently testable steps, then get the user to approve it. Write the plan assuming the implementer has zero context for this codebase: which files to touch, the actual code and tests, exact commands and expected output. No repetition, nothing speculative, test before trust, commit often. (DRY, YAGNI, TDD are shorthand for you — never show these abbreviations to the person.)

**This skill's boundary — two hard lines:**

- **It plans and gets approval. It does not build.** Writing the plan document is fine (that markdown file is the deliverable). Writing product code, running the implementation, editing real source files — that is `senpai-build`, the next skill. Do not start it here.
- **The AI never approves its own plan.** Approval is always an explicit act by the user. There is no path from "I wrote the plan" to "so I'll start building." The user says yes first, every time.

**Announce at start:** "I'm using senpai-plan to turn the agreed design into small, reviewable steps for you to approve."

**Context:** If working in an isolated workspace, it should have been set up via `senpai-isolate` before this. The plan is written for execution inside that workspace.

## Step 0: Detect your environment and approval path

Before anything else, figure out how you will get the plan approved at the end. This decides which native path you use so you never reinvent one.

Detect two things:

1. **Are you in Plan Mode?** (Claude Code only.) You are in Plan Mode if the harness is holding edits until you present a plan — i.e. an `ExitPlanMode` tool is available and file writes are gated on plan approval. If so, `ExitPlanMode` is your approval path (the most native one — this very interaction, where the tool won't let you build until the user approves, is Plan Mode).
2. **Which assistant are you?** Claude Code (has `ExitPlanMode` / `AskUserQuestion` tools) or Codex CLI (no Plan Mode concept, no such tools).

Map to an approval path — you'll use it at the very end, in the Final Approval Gate:

| Environment | Approval path |
|---|---|
| Claude Code, already in Plan Mode | Present the plan and call `ExitPlanMode` to get approval. Most native — prefer this. |
| Claude Code, not in Plan Mode | Show a short text summary, then call `AskUserQuestion` with choices: "Proceed as-is" / "I want changes" / "Cancel". |
| Codex CLI | No Plan Mode. Show the plan as text and ask plainly whether to proceed, change, or cancel. Same intent as above — only the rendering is plain text. |

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

## Bite-Sized Step Granularity

**Each step is one action (2-5 minutes):**

- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Write the minimal code to make the test pass" — step
- "Run the tests and make sure they pass" — step
- "Commit" — step

If a step would take much longer than five minutes or bundles two actions, split it.

## Plan Document Header

**Every plan starts with this header:**

```markdown
# [Feature Name] Plan

> **For the builder:** REQUIRED NEXT SKILL: use senpai-build to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not start building until the user has approved this plan.

**Goal:** [One sentence describing what this builds]

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
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Interfaces:**
- Consumes: [what this task uses from earlier tasks — exact signatures]
- Produces: [what later tasks rely on — exact function names, parameter and
  return types. A task's builder sees only their own task; this block is how
  they learn the names and types neighboring tasks use.]

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

(The Python/pytest blocks above are only an illustration of shape — use the language, test runner, and commands that actually match the user's project.)

## No Placeholders

Every step must contain the actual content the builder needs. These are **plan failures** — never write them:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without the actual test code)
- "Similar to Task N" (repeat the code — the builder may read tasks out of order)
- Steps that say what to do without showing how (code steps need code blocks)
- References to types, functions, or methods not defined in any task

## Where to save the plan

Save one short plan file at the **real project root** (same location as
`log.md` — use the `git worktree list --porcelain` snippet from
`senpai-remember`):

```
.senpai/current-plan.md
```

This ensures the plan is visible from both the real project and any isolated
copy. One lightweight file, not a vault or a dated archive tree. Keep the
schema minimal (the header + tasks above) and don't duplicate what
`senpai-remember` stores; this file is just the plan the builder follows, and
it's replaced next time you plan. Don't invent extra directories.

## Self-Review

After writing the complete plan, look at the agreed design with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

1. **Design coverage:** Skim each part of the agreed design. Can you point to a task that implements it? List any gaps and add the missing task.
2. **Placeholder scan:** Search the plan for the red flags in "No Placeholders" above. Fix them.
3. **Type consistency:** Do the types, signatures, and names in later tasks match what earlier tasks defined? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug — fix it.

Fix issues inline; no need to re-review.

## Minimality Self-Review (the whole plan)

Now step back from the individual tasks and check the plan **as a whole** — before you show it to anyone. Same spirit as `ponytail`: the goal is to cut anything that's in the plan "just in case." Walk these rungs and **stop at the first that holds** for each proposed task or piece of scope:

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
- **Codex CLI:** show the plain summary and ask whether to proceed, change, or cancel.

**The invariant:** you cannot move to `senpai-build` until the user has approved. You do not approve on their behalf, and you do not treat "I finished writing the plan" as approval. If they ask for changes, revise and re-present. Only an explicit yes from the user opens the next step.

## After Approval — Execution Handoff

Once (and only once) the user approves, offer how to execute — both routes go through `senpai-build`:

**"Plan approved and saved to `.senpai/current-plan.md`. Two ways to build it:**

**1. Step-by-step with a fresh reviewer (recommended)** — a fresh builder handles each task, with a review between tasks. Slower per task, but each step gets checked before the next.

**2. Straight through with checkpoints** — build several tasks in a row, pausing at checkpoints for you to review.

**Which would you like?"**

Then hand off to `senpai-build` with the chosen approach. Do not begin building in this skill.
