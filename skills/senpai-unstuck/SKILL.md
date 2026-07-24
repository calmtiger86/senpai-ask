---
name: senpai-unstuck
description: >
  Use when the person is stuck — the same approach keeps failing, they don't
  know what to try next, or they say "막혔어", "모르겠어", "왜 안 되는지
  모르겠어", "다른 방법 없어?", "I'm stuck", "no idea", "any other way?",
  "nothing works". Brings three fresh perspectives to break the deadlock,
  then picks the most promising one to try.
---

# Senpai Unstuck

When a beginner hits a wall, they don't need more of the same thinking — they
need a different angle. This skill gives three quick perspectives on the
problem, picks the best one, and gets back to work.

**Say this to the person:**

> "We're going in circles, so let me step back and look at this differently."

## When this skill activates

- The same error or approach has failed 3+ times in `senpai-build`
- The person says they're stuck or asks for a different approach
- `senpai-build` routes here after repeated failures on the same task

## Step 1: Name what's stuck

In one plain sentence, state the problem and what's been tried. This is for
the person — they should recognize it:

> "We've tried fixing the login error by changing the password check three
> times, but it keeps failing because the session isn't being saved."

## Step 2: Three perspectives

Think through the problem from three angles. Present each as a short paragraph
(2–3 sentences max) with a **concrete next step** — not abstract advice:

| Perspective | Asks | Example |
|---|---|---|
| **Simplifier** | "Can we make this simpler?" | Remove complexity, use defaults, try the minimal version, skip the feature entirely |
| **Investigator** | "What don't we actually know?" | Read the error more carefully, add a log line, check an assumption we never verified |
| **Sideways thinker** | "Is there a completely different way?" | Different library, different architecture, reframe the problem |

Don't force all three if one clearly doesn't apply. Two real perspectives
beat three padded ones.

## Step 3: Recommend and try

Pick the most promising angle, say why in one sentence, and try it:

> "The investigator angle looks best — we assumed the session is saved, but we
> never actually checked. Let me add one log line to see what's happening."

If the person prefers a different angle, go with theirs.

Then route back to wherever the work was happening (`senpai-build`, usually).
Record what angle worked in `.senpai/log.md` so the same dead end isn't
retried next session.

## What this is NOT

- Not a deep research tool — it's a quick reframe, not a literature review.
- Not a replacement for debugging — it feeds back into `senpai-build`.
- Not a team of subagents — it's you thinking from different angles in one
  response.

## Red flags

**Never:**
- Spend more than one response on the perspectives — this is a quick unlock,
  not an investigation.
- Try all three approaches at once — pick one, try it, come back if needed.
- Use this as a stalling tactic when the real answer is "ask the user."
- Stay here — get back to building as soon as you have a direction.

**Always:**
- Name what's been tried and why it failed before proposing new angles.
- Give concrete next steps with actual commands or code, not abstract advice.
- Record what worked (or didn't) in `.senpai/log.md`.
- Get back to building quickly — the goal is to unblock, not to philosophize.
