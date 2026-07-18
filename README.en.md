<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>It's not like I want to help — I just hate doing the same work twice.</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Claude_Code-compatible-111111?style=flat-square" alt="Claude Code">
  <img src="https://img.shields.io/badge/Codex_CLI-compatible-111111?style=flat-square" alt="Codex CLI">
</p>

<p align="center">
  <sub><a href="README.md">한국어</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh.md">中文</a></sub>
</p>

---

A **brainstorming-first design skill** for Claude Code and Codex CLI, for people who have never coded, never used a terminal, and never vibe-coded before.

> When you say "build me this," it doesn't start writing code right away.
>
> **"It asks first, and designs a plan from your answers."**
>
> What do you actually want? Are there intentions you haven't explained? What do you really need? Only after that's sorted does it start building.

## Why does this exist?

Claude Code and Codex are already powerful coding AIs, but there are things first-timers aren't used to.

**1. They don't know how to explain in detail.**
> When you say "add a login feature," it asks for you: email or social login? Do you need password reset? It **asks the questions you didn't know you had.**

**2. Technical jargon is hard.**
> Isolation (a separate copy so your real files aren't touched), commit (a saved checkpoint) — unfamiliar terms get **a one-time parenthetical explanation**, then never repeated.

**3. They don't know how to keep work records.**
> Ask "where did we leave off?" and instead of a technical log, it tells you in plain language: **"We finalized the login page design; next is the signup flow."**

Beyond these three, it doesn't replace Claude Code / Codex native features (permission prompts, rewind, sandboxing) — it uses them as-is.

## How does it work?

Just talk to it. It routes your request to the right step automatically.

<p align="center">
  <code>Say what you want</code> → <code>Design together</code> → <code>Isolate</code> → <code>Small plan</code> → <code>Build step by step</code> → <code>Verify</code> → <code>Remember</code>
</p>

| Step | Skill | What it does |
|:----:|-------|-------------|
| **Entry** | `senpai` | Always on — listens and routes to the right skill |
| **Design** | `senpai-brainstorming` | One question at a time, surfaces hidden intentions and ideas. Writes zero code |
| **Isolate** | `senpai-isolate` | Creates a copy of your project to work in separately. Originals never touched |
| **Plan** | `senpai-plan` | Breaks the agreed design into small 2–5 min tasks. Nothing built until approved |
| **Build** | `senpai-build` | Executes the plan one step at a time. Reviews after each. Errors fixed here |
| **Verify** | `senpai-finish` | Actually runs it to check, then asks: keep or discard the result? |
| **Remember** | `senpai-remember` | Stores what happened in plain language so you can pick up next time |

<details>
<summary><strong>Safety</strong></summary>

<br>

Skills are guidance, but one thing is **enforced by code** — a `PreToolUse` guard hook:

- **Secret files blocked** — `.env`, SSH keys, `.pem`/`.key`, anything with "secret" or "credential" in its name. Read, write, and shell references all blocked.
- **Control files protected** — anything under `.claude/`, `.codex/`, or `.claude-plugin/` can't be rewritten mid-session.

This applies inside the isolated workspace too. If you see `"This looks like a secret file"`, that's the guard working as intended — not a bug.

> The simplest and most powerful safety measure is **never touching your real project until you approve.**
> `senpai-isolate` (isolation) and `senpai-finish` (final decision) handle this.

</details>

## Install

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

**Codex CLI:** Install as a Codex plugin pointing at this repository (see Codex's plugin-install docs — standard Claude Code / Codex-compatible skill plugin, no special setup required).

Then just say what you want to build or work on. Say it, and `senpai` takes it from there.

---

<p align="center">
  <sub>MIT License · Made by <a href="https://github.com/calmtiger86">CalmTiger</a></sub>
</p>
