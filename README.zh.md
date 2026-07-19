<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>又不是想帮你…只是我讨厌同样的事做两遍而已。</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Claude_Code-compatible-111111?style=flat-square" alt="Claude Code">
  <img src="https://img.shields.io/badge/Codex_CLI-compatible-111111?style=flat-square" alt="Codex CLI">
</p>

<p align="center">
  <sub><a href="README.md">한국어</a> · <a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a></sub>
</p>

---

<p align="center">
 <em>当你对 AI 说"帮我做这个"，一个傲娇前辈就会出现问你："你确定要这样做吗？"</em>
</p>

---

<br> 

为从未写过代码、从未用过终端、从未进行过 vibe-coding 的人准备的**头脑风暴式工作设计技能。**

<br> 

> 当你说"帮我做这个"的时候，它不会立刻开始写代码。
>
> **"先提问，通过你的回答来先设计计划。"**
>
> 你到底想做什么？有没有没说出来的意图？真正需要的是什么？整理完了才开始动手。


<br> 

## 为什么需要？

Claude Code 和 Codex 已经是强大的编码 AI，但对于初次使用的人来说有些不习惯的地方。

**1. 不知道怎么详细说明。**
> 当你说"加个登录功能"，它会替你问：邮箱登录还是社交登录？需要密码重置吗？——它**替你问出你自己都没意识到的问题。**

**2. 专业术语太难。**
> 隔离（不碰原始文件的独立副本）、提交（工作存档点）——陌生词汇第一次出现时**一定会用括号解释一次**，之后不再重复。

**3. 不知道怎么留工作记录。**
> 问"上次做到哪了？"，它不会直接甩给你技术日志，而是用人话说：**"登录页设计已确定，下一步是注册流程。"**

除此之外，还会利用 Claude Code / Codex 的原生功能（权限确认、回退、沙盒）来帮助非开发者进行 vibe-coding。


<br> 

## 怎么运作？

直接说话就行，它会自动引导到合适的步骤。


<p align="left">
<code>说出想做的</code> → <code>一起梳理</code> → <code>隔离空间</code> → <code>小步计划</code> → <code>逐步构建</code> → <code>验证</code> → <code>记住</code>
</p>

<br> 

| 步骤 | 技能 | 作用 |
|:----:|------|------|
| **入口** | `senpai` | 始终在线 — 听取请求，连接到合适的技能 |
| **梳理** | `senpai-brainstorming` | 逐个提问，挖出隐藏的意图和想法。一行代码都不写 |
| **隔离** | `senpai-isolate` | 创建项目副本，只在那里单独工作。原始文件绝不触碰 |
| **计划** | `senpai-plan` | 将商定的设计拆分为 2~5 分钟的小任务。批准前什么都不做 |
| **构建** | `senpai-build` | 按步骤逐一执行计划。每步完成后审查。错误在这里修复 |
| **验证** | `senpai-finish` | 实际运行检查，然后问：保留还是丢弃成果？ |
| **记忆** | `senpai-remember` | 用人话记录发生了什么，下次可以直接继续 |


<br> 

---

<br> 

## 安装

**Claude Code：**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```
<p></p>

**Codex CLI：** 将此仓库作为 Codex 插件安装（标准 Claude Code / Codex 兼容技能插件，无需特殊配置）。

<br> 

安装后直接说出你想做的工作或想做的东西就行。说出来，`senpai` 会自动开始。

---

<details>
<summary><strong>安全机制</strong></summary>

<br>

技能是指南，但有一件事**由代码强制执行** — `PreToolUse` 守卫钩子：

- **阻止访问秘密文件** — `.env`、SSH 密钥、`.pem`/`.key`、文件名含 "secret" 或 "credential" 的文件。读取、写入和 shell 引用全部阻止。
- **保护配置文件** — `.claude/`、`.codex/`、`.claude-plugin/` 下的文件在会话中不可修改。

在隔离工作区内同样适用。如果看到 `"This looks like a secret file"`，这不是 bug，而是守卫正常工作。守卫钩子仅在 Claude Code 中运行；在 Codex 中，沙盒承担此角色。

> 最简单也最强大的安全措施是**在你批准之前绝不触碰真实项目。**
> `senpai-isolate`（隔离）和 `senpai-finish`（最终决定）负责这件事。

</details>

<br>


<p align="center">
  <sub>MIT License · Made by <a href="https://www.threads.com/@calmtiger_">CalmTiger</a></sub>
</p>
