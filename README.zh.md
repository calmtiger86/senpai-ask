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
  <img src="https://img.shields.io/badge/Codex-compatible-111111?style=flat-square" alt="Codex">
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
| **隔离** | `senpai-isolate` | 创建项目副本，只在那里单独工作。原始文件在最后决定是否应用之前保持不变 |
| **计划** | `senpai-plan` | 将商定的设计拆分为 2~5 分钟的小任务。批准前什么都不做 |
| **构建** | `senpai-build` | 按计划构建并审查——小改动审查一次，大改动每步审查。错误在这里修复 |
| **(卡住时)** | `senpai-unstuck` | 同样的问题反复三次时，从不同角度（简化·调查·另辟蹊径）提出建议。解决后回到构建 |
| **验证** | `senpai-finish` | 实际运行检查，然后问：保留还是丢弃成果？ |
| **记忆** | `senpai-remember` | 用人话记录发生了什么，下次可以直接继续 |


<br> 

---

<br> 

## 安装

| 环境 | 支持 | 安装方式 |
|---|---|---|
| 终端中的 Claude Code | 支持 | 下面的命令 |
| Claude 桌面应用（本地、SSH 会话） | 支持 | 下面的命令（SSH 会话请在所连接的电脑上运行） |
| VS Code 的 Claude Code 扩展 | 支持 | `/plugins` → Marketplaces 标签页 |
| 终端中的 Codex | 支持 | 下面的命令 |
| Codex 桌面应用 | 试验性支持 | 下面的命令，或应用的 Plugins 标签页 |
| 编辑器中的 Codex 扩展 | 仅技能（无钩子） | 复制技能文件夹（见下文） |
| claude.ai 网页的云端会话、桌面应用的 WSL 会话 | 不支持 | 不加载插件 |

我们直接测试过终端中的 Claude Code 和 Codex。Claude 桌面应用的本地会话与终端使用相同的设置，会直接加载在终端中安装的插件。VS Code 和 Codex 桌面应用两行依据各产品的文档。

**Claude Code：**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

Claude 桌面应用的本地会话与终端使用相同的设置，所以用上面的命令安装后，在应用中也能使用。如果是 SSH 会话，请在所连接的电脑上运行上面的命令。在 VS Code 中，在输入框输入 `/plugins` 打开 **Manage plugins** 界面，在 **Marketplaces** 标签页添加 `calmtiger86/senpai-ask` 并安装 senpai-ask。

更新时，在终端运行下面两行命令，然后重启 Claude Code。

```bash
claude plugin marketplace update senpai-ask
claude plugin update senpai-ask@senpai-ask
```

自己添加的插件市场默认关闭自动更新。如需自动更新，请在 Claude Code 中打开 `/plugin`，选择 **Marketplaces** → `senpai-ask` → **Enable auto-update**。
<p></p>

**Codex：**

```bash
codex plugin marketplace add calmtiger86/senpai-ask
codex plugin add senpai-ask@senpai-ask
```

如果 Codex 询问是否允许运行 senpai 钩子，请允许。这样每次开始会话时都会开启 senpai 模式。不允许也可以使用技能。
在 Codex 中，senpai 创建 Git 保存点（提交）或工作副本时可能会弹出批准提示。这是因为 Codex 沙盒保护着 `.git` 文件夹，批准即可继续。

更新时运行下面的命令，然后重启 Codex。

```bash
codex plugin marketplace upgrade senpai-ask
```

VS Code 等编辑器中的 Codex 扩展不支持插件。要在编辑器中使用，只需复制技能（不含钩子）。不要与插件同时安装，否则同样的技能会出现两次。

```bash
git clone https://github.com/calmtiger86/senpai-ask.git /tmp/senpai-ask && \
  mkdir -p ~/.agents/skills && \
  cp -r /tmp/senpai-ask/skills/* ~/.agents/skills/ && \
  rm -rf /tmp/senpai-ask
```

如果只复制了技能，重新运行相同命令即可更新。

<br> 

**使用方法：**

- **Claude Code** — 直接说出你想做的工作或想做的东西就行。`senpai` 会自动开始。
- **Codex** — 说出想做的东西，`senpai` 会自动开始。要直接调用，输入 `$` 或打开 `/skills`，选择 `senpai-ask:senpai`（只复制技能时为 `senpai`；桌面应用中用 `@` 代替 `$`）。

> **确保自动路由：** 在项目文件夹中创建 `AGENTS.md` 文件，写入以下一行：
>
> ```
> 编码相关请求请先经过 senpai 技能。
> ```

**临时关闭：** 创建下面的文件后，从下一个会话起 senpai 不会主动介入（直接调用仍然可用）。删除该文件即可恢复，插件仍保持安装。

```bash
touch ~/.claude/.senpai-off   # 关闭（Codex 为 ~/.codex/.senpai-off）
rm ~/.claude/.senpai-off      # 重新开启
```

---

<details>
<summary><strong>安全机制</strong></summary>

<br>

> 最简单也最强大的安全措施是**在你批准之前绝不触碰真实项目。**
> `senpai-isolate`（隔离）和 `senpai-finish`（最终决定）负责这件事。

秘密文件（`.env` 等）的保护由 Claude Code / Codex 的内置权限系统负责。

</details>

<br>


<p align="center">
  <sub>MIT License · Made by <a href="https://www.threads.com/@calmtiger_">CalmTiger</a></sub>
</p>
