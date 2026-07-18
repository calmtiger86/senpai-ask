<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>別に手伝いたいわけじゃないけど…同じ仕事を二度するのが嫌なだけ。</em>
</p>

<p align="center">
  <sub><a href="README.md">한국어</a> · <a href="README.en.md">English</a> · <a href="README.zh.md">中文</a></sub>
</p>

---

コーディングもターミナルもバイブコーディングも初めての人のための、Claude Code / Codex CLI スキルコレクション。

Claude CodeやCodexが持つ安全機能（権限確認、チェックポイント、サンドボックス）を置き換えるのではなく、その上に載せるもの — 何かを作る前にまず一緒に整理し、本物のファイルには触れない隔離されたワークスペースで作業し、小さな単位に分けてレビューし、次のセッションでも何を話したか覚えている。

## スキル

| スキル | 役割 |
|--------|------|
| `senpai` | 常にオンの入口 — 話しかければ適切なスキルに繋げる |
| `senpai-brainstorming` | 作る前に一つずつ質問して、隠れた決定事項を引き出す |
| `senpai-isolate` | 本物のプロジェクトに触れない隔離ワークスペースを構築 |
| `senpai-plan` | 合意した設計を2〜5分の小さなステップに分割 |
| `senpai-build` | 計画をステップごとに実行し、各ステップ後にレビュー |
| `senpai-finish` | 完了を確認し、結果を残すか捨てるか聞く |
| `senpai-remember` | 何をしたか、何を決めたか、次のセッションでも記憶 |

## セーフティ

スキルはガイドラインだが、**コードで強制される**ものが一つある — `PreToolUse`ガードフック：

- **秘密ファイルをブロック** — `.env`、SSH鍵、`.pem`/`.key`、名前に「secret」や「credential」を含むファイル。読み取り・書き込み・シェル参照すべてブロック。
- **設定ファイルを保護** — `.claude/`、`.codex/`、`.claude-plugin/`配下のファイルはセッション中に変更不可。

隔離ワークスペース内でも同様に適用される。*"This looks like a secret file"*というメッセージが表示されたら、バグではなくガードが正常に動作している証拠。パターンの詳細は`scripts/protect-secrets.js`、フックの接続は`hooks/scripts/guard.js`を参照。

残りの安全モデル — 承認するまで本物のプロジェクトに触れないこと — は`senpai-isolate`（隔離）と`senpai-finish`（最終決定）が担当する。

## インストール

**Claude Code：**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

**Codex CLI：** このリポジトリをCodexプラグインとしてインストール（Codexのプラグインインストールドキュメントを参照 — 標準的なClaude Code / Codex互換スキルプラグインのため、特別な設定は不要）。

インストール後は普通に話しかけるだけ — 作りたいものを言えば`senpai`が始める。

## ライセンス

MIT — `LICENSE`を参照。
