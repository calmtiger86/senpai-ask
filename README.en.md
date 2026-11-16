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

<p align="center">
 <em>When you tell an AI "build me this," a tsundere senpai shows up and asks: "Is this really what you want to build?"</em>
</p>

---

<br> 

A **brainstorming-first design skill** for people who have never coded, never used a terminal, and never vibe-coded before.

<br> 

> When you say "build me this," it doesn't start writing code right away.
>
> **"It asks first, and designs a plan from your answers."**
>
> What do you actually want? Are there intentions you haven't explained? What do you really need? Only after that's sorted does it start building.


<br> 

## Why does this exist?

Claude Code and Codex are already powerful coding AIs, but there are things first-timers aren't used to.

**1. They don't know how to explain in detail.**
> When you say "add a login feature," it asks for you: email or social login? Do you need password reset? It **asks the questions you didn't know you had.**

**2. Technical jargon is hard.**
> Isolation (a separate copy so your real files aren't touched), commit (a saved checkpoint) — unfamiliar terms always get **a parenthetical explanation once**, then never repeated.

**3. They don't know how to keep work records.**
> Ask "where did we leave off?" and instead of just showing a technical log, it tells you in plain language: **"We finalized the login page design; next is the signup flow."**

Beyond these, it leverages Claude Code / Codex native features (permission prompts, rewind, sandboxing) to help non-developers with vibe-coding.


<br> 

## How does it work?

Just talk to it. It routes your request to the right step automatically.


<p align="left">
<code>Say what you want</code> → <code>Design together</code> → <code>Isolate</code> → <code>Small plan</code> → <code>Build step by step</code> → <code>Verify</code> → <code>Remember</code>
</p>

<br> 

| Step | Skill | What it does |
|:----:|-------|-------------|
| **Entry** | `senpai` | Always on — listens and routes to the right skill |
| **Design** | `senpai-brainstorming` | One question at a time, surfaces hidden intentions and ideas. Writes zero code |
| **Isolate** | `senpai-isolate` | Creates a copy of your project to work in separately. Originals never touched |
| **Plan** | `senpai-plan` | Breaks the agreed design into small 2–5 min tasks. Nothing built until approved |
| **Build** | `senpai-build` | Executes the plan one step at a time. Reviews after each. Errors fixed here |
| **(If stuck)** | `senpai-unstuck` | When the same problem repeats three times, offers a fresh angle (simplify, investigate, sideways). Returns to building once unblocked |
| **Verify** | `senpai-finish` | Actually runs it to check, then asks: keep or discard the result? |
| **Remember** | `senpai-remember` | Stores what happened in plain language so you can pick up next time |


<br> 

---

<br> 

## Install

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

To update, run these two lines in your terminal, then restart Claude Code.

```bash
claude plugin marketplace update senpai-ask
claude plugin update senpai-ask@senpai-ask
```

Marketplaces you add yourself have auto-update turned off by default. To get updates automatically, open `/plugin` in Claude Code and choose **Marketplaces** → `senpai-ask` → **Enable auto-update**.
<p></p>

**Codex:**

```bash
codex plugin marketplace add calmtiger86/senpai-ask
codex plugin add senpai-ask@senpai-ask
```

If Codex asks whether to allow the senpai hook, allow it — that turns senpai mode on at the start of each session. The skills still work without it.
Codex may show an approval prompt when senpai makes a git save point (commit) or a working copy, because its sandbox protects the `.git` folder. Approve it to continue.

To update, run this and restart Codex:

```bash
codex plugin marketplace upgrade senpai-ask
```

The Codex extension for editors such as VS Code doesn't support plugins. To use senpai there, copy just the skills (no hook). Don't combine this with the plugin — the same skills would show up twice.

```bash
git clone https://github.com/calmtiger86/senpai-ask.git /tmp/senpai-ask && \
  mkdir -p ~/.agents/skills && \
  cp -r /tmp/senpai-ask/skills/* ~/.agents/skills/ && \
  rm -rf /tmp/senpai-ask
```

If you copied just the skills, run the same command again to update.

<br> 

**Usage:**

- **Claude Code** — Just say what you want to build or work on. `senpai` takes it from there.
- **Codex** — Just say what you want to build. `senpai` picks it up. To call it directly, type `$` or open `/skills` and pick `senpai-ask:senpai` (`senpai` if you copied just the skills).

> **To ensure auto-routing:** Create an `AGENTS.md` file in your project folder with this one line:
>
> ```
> Route coding requests through the senpai skill first.
> ```

---

<details>
<summary><strong>Safety</strong></summary>

<br>

> The simplest and most powerful safety measure is **never touching your real project until you approve.**
> `senpai-isolate` (isolation) and `senpai-finish` (final decision) handle this.

Secret file protection (`.env`, etc.) is handled by Claude Code / Codex's built-in permission system.

</details>

<br>


<p align="center">
  <sub>MIT License · Made by <a href="https://www.threads.com/@calmtiger_">CalmTiger</a></sub>
</p>
