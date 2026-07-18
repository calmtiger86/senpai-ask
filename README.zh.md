<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>又不是想帮你…只是我讨厌同样的事做两遍而已。</em>
</p>

<p align="center">
  <sub><a href="README.md">한국어</a> · <a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a></sub>
</p>

---

为从未写过代码、从未用过终端、从未进行过 vibe-coding 的人准备的 Claude Code / Codex CLI 技能集合。

不替代 Claude Code 或 Codex 自带的安全功能（权限确认、检查点、沙盒），而是在其之上增加一层 — 在构建任何东西之前先一起梳理，在不触碰真实文件的隔离工作区中工作，拆分成小单元逐步审查，并在下次会话中记住之前做了什么决定。

## 技能

| 技能 | 作用 |
|------|------|
| `senpai` | 始终在线的入口 — 说话就会自动连接到合适的技能 |
| `senpai-brainstorming` | 构建前逐个提问，挖出隐藏的决策点 |
| `senpai-isolate` | 搭建不触碰真实项目的隔离工作区 |
| `senpai-plan` | 将商定的设计拆分为 2~5 分钟的小步骤 |
| `senpai-build` | 按步骤逐一执行计划，每步完成后审查 |
| `senpai-finish` | 确认一切正常，然后问你保留还是丢弃 |
| `senpai-remember` | 记住做了什么、决定了什么，跨会话保留 |

## 安全机制

技能是指南，但有一件事**由代码强制执行** — `PreToolUse` 守卫钩子：

- **阻止访问秘密文件** — `.env`、SSH 密钥、`.pem`/`.key`、文件名含 "secret" 或 "credential" 的文件。读取、写入和 shell 引用全部阻止。
- **保护配置文件** — `.claude/`、`.codex/`、`.claude-plugin/` 下的文件在会话中不可修改。

在隔离工作区内同样适用。如果看到 *"This looks like a secret file"* 消息，这不是 bug，而是守卫正常工作。详细模式见 `scripts/protect-secrets.js`，钩子连接见 `hooks/scripts/guard.js`。

其余安全模型 — 在你批准之前绝不触碰真实项目 — 由 `senpai-isolate`（隔离）和 `senpai-finish`（最终决定）负责。

## 安装

**Claude Code：**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

**Codex CLI：** 将此仓库作为 Codex 插件安装（参考 Codex 的插件安装文档 — 这是标准的 Claude Code / Codex 兼容技能插件，无需特殊配置）。

安装后直接说话就行 — 说出你想做的，`senpai` 会自动开始。

## 许可证

MIT — 见 `LICENSE`。
