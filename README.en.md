<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>It's not like I want to help — I just hate doing the same work twice.</em>
</p>

<p align="center">
  <sub><a href="README.md">한국어</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh.md">中文</a></sub>
</p>

---

A lightweight skill collection for Claude Code and Codex CLI, for people who have never coded, never used a terminal, and never vibe-coded before.

It doesn't replace Claude Code's or Codex's own safety features (permission prompts, checkpoints, sandboxing). It sits on top: brainstorms with you before building anything, works in an isolated copy so your real files stay untouched until you approve, breaks work into small reviewed steps, and remembers what you decided across sessions.

## Skills

| Skill | What it does |
|-------|-------------|
| `senpai` | Always-on entry point — routes your request to the right skill |
| `senpai-brainstorming` | One question at a time before building; surfaces hidden decisions |
| `senpai-isolate` | Sets up an isolated workspace so your real project is never touched mid-work |
| `senpai-plan` | Turns an agreed design into small (2–5 min), reviewable steps |
| `senpai-build` | Executes the plan step by step, with a review after each step |
| `senpai-finish` | Verifies everything works, then asks you to keep or discard |
| `senpai-remember` | Plain-language memory of what happened, across sessions |

## Safety

Skills are guidance, but one thing is **enforced by code** — a `PreToolUse` guard hook:

- **Secret files blocked** — `.env`, SSH keys, `.pem`/`.key`, anything with "secret" or "credential" in its name. Read, write, and shell references all blocked.
- **Control files protected** — anything under `.claude/`, `.codex/`, or `.claude-plugin/` can't be rewritten mid-session.

This applies inside the isolated workspace too. If you see *"This looks like a secret file"*, that's the guard working as intended — not a bug. See `scripts/protect-secrets.js` for patterns and `hooks/scripts/guard.js` for wiring.

The rest of the safety model — never touching your real project until you say so — comes from `senpai-isolate` (isolation) and `senpai-finish` (the keep-or-discard decision).

## Install

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

**Codex CLI:** Install as a Codex plugin pointing at this repository (see Codex's plugin-install docs — this ships as a standard Claude Code / Codex-compatible skill plugin, no special setup required).

Then just talk to it — say what you want to build and `senpai` takes it from there.

## License

MIT — see `LICENSE`.
