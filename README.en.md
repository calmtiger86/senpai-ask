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

When you say "build me this," it doesn't start writing code right away — it **asks first**. What do you actually want? What decisions are hiding under that request? What do you really need? Only after that's sorted does it start building.

## Why this exists

Claude Code and Codex are already powerful, but three things are missing for first-timers:

1. **Surfaces hidden decisions first** — When you say "add a login feature," it asks: email or social login? Do you need password reset? It asks the questions you didn't know you had.
2. **Explains jargon once** — isolation (a separate copy so your real files aren't touched), commit (a saved checkpoint) — unfamiliar terms get a one-time parenthetical explanation, then never repeated.
3. **Remembers across sessions in plain language** — Ask "where did we leave off?" and instead of a technical log, it tells you: "We finalized the login page design; next is the signup flow."

Beyond these three, it doesn't replace Claude Code / Codex native features (permission prompts, rewind, sandboxing) — it **sits on top of them.**

## How it works

Just talk to it. It routes your request to the right step automatically:

```
Talk → Design together → Isolate → Plan small → Build step by step → Verify → Remember
```

| Step | Skill | What it does |
|------|-------|-------------|
| Entry | `senpai` | Always on — listens and routes to the right skill |
| Design | `senpai-brainstorming` | One question at a time, surfaces hidden decisions. Writes zero code |
| Isolate | `senpai-isolate` | Creates a copy of your project to work in. Originals never touched |
| Plan | `senpai-plan` | Breaks the agreed design into small 2–5 min steps. Nothing built until approved |
| Build | `senpai-build` | Executes the plan one step at a time. Reviews after each. Errors fixed here |
| Verify | `senpai-finish` | Actually runs it to check, then asks: keep or discard? |
| Remember | `senpai-remember` | Stores what happened in plain language so you can pick up next time |

## Safety

Skills are guidance, but one thing is **enforced by code** — a `PreToolUse` guard hook:

- **Secret files blocked** — `.env`, SSH keys, `.pem`/`.key`, anything with "secret" or "credential" in its name. Read, write, and shell references all blocked.
- **Control files protected** — anything under `.claude/`, `.codex/`, or `.claude-plugin/` can't be rewritten mid-session.

This applies inside the isolated workspace too. If you see *"This looks like a secret file"*, that's the guard working as intended — not a bug.

The rest of the safety model — never touching your real project until you say so — comes from `senpai-isolate` (isolation) and `senpai-finish` (the keep-or-discard decision).

## Install

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

**Codex CLI:** Install as a Codex plugin pointing at this repository (see Codex's plugin-install docs — standard Claude Code / Codex-compatible skill plugin, no special setup required).

Then just talk to it — say what you want to build and `senpai` takes it from there.

## License

MIT — see `LICENSE`.
