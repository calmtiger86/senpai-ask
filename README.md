# senpai-ask

A lightweight skill collection for Claude Code and Codex CLI that acts like a patient senior colleague for people who have never coded, never used a terminal, and never vibe-coded before.

*It's not that this senpai is dying to help you build something — it's just not going to let you overbuild your first project on its watch.* Say what you want, and it asks before it builds.

It does not replace Claude Code's or Codex's own safety and convenience features (permission prompts, checkpoints/rewind, session resume, sandboxing). It sits on top of them: it brainstorms with you before building anything, works in an isolated copy of your project so nothing touches your real files until you approve, breaks work into small reviewed steps, and remembers what you decided across sessions in plain language.

## Skills

- `senpai` — always-on mode that makes sure the right skill runs before any response
- `senpai-brainstorming` — Socratic, one-question-at-a-time design conversation; surfaces hidden decisions before you commit
- `senpai-isolate` — sets up an isolated workspace (native worktree tool if available, git fallback) so your real project is never touched mid-work
- `senpai-plan` — turns an agreed design into small (2-5 minute), reviewable steps
- `senpai-build` — executes the plan step by step, with a fresh review after each step
- `senpai-finish` — verifies everything works, then asks you to keep or discard the work
- `senpai-remember` — plain-language memory of what happened, across sessions

## Safety: what's actually enforced by code

Everything above is plain-language guidance the assistant follows — not code that can force it. The one thing that *is* enforced by code, regardless of what any skill says, is a `PreToolUse` guard hook that blocks two kinds of file access outright:

- **Secret files** — `.env`/`.env.*`, SSH private keys (`id_rsa`, `id_ed25519`), `.pem`/`.key` files, and anything with "secret" or "credential" in its name. Blocked for reading (`Read`, `Grep`), writing (`Write`, `Edit`, `MultiEdit`, `NotebookEdit`), and referencing in a shell command (`Bash`) — including common glob patterns like `.env*` that could expand to one.
- **Control files** — anything under `.claude/`, `.codex/`, or `.claude-plugin/`, so a session can't rewrite the rules it's running under.

This applies inside the isolated workspace too, and regardless of what's been approved — a secret must never leak even when the surrounding change was approved. If you see a tool call denied with a message like *"This looks like a secret file"*, that's this guard, working as intended — not a bug. See `scripts/protect-secrets.js` for the exact patterns and `hooks/scripts/guard.js` for the wiring.

The rest of the safety model — never touching your real project until you say so — comes from `senpai-isolate` (isolated workspace) and `senpai-finish` (the one keep-or-discard decision), not from a file allowlist or approval-token system. See `.planning/DECISIONS.md` for the full reasoning.

## Install

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

**Codex CLI:** install as a Codex plugin pointing at this repository (see Codex's plugin-install docs for the current command — this toolkit ships as a standard Claude Code / Codex-compatible skill plugin, no special setup required).

Then just talk to it normally — say what you want to build, and `senpai` takes it from there.

## License

MIT — see `LICENSE`.
