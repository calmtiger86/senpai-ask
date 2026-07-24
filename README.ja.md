<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>別に手伝いたいわけじゃないけど…同じ仕事を二度するのが嫌なだけ。</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Claude_Code-compatible-111111?style=flat-square" alt="Claude Code">
  <img src="https://img.shields.io/badge/Codex_CLI-compatible-111111?style=flat-square" alt="Codex CLI">
</p>

<p align="center">
  <sub><a href="README.md">한국어</a> · <a href="README.en.md">English</a> · <a href="README.zh.md">中文</a></sub>
</p>

---

<p align="center">
 <em>AIに「これ作って」と言うと、ツンデレな先輩が現れて聞きます。「本当にこう作りたいの？」</em>
</p>

---

<br> 

コーディングもターミナルもバイブコーディングも初めての人のための、**ブレインストーミング方式の作業設計スキル。**

<br> 

> 「これ作って」と言っても、すぐにコードを書き始めない。
>
> **「まず聞いて、答えをもとに計画を先に設計します。」**
>
> 何を作りたいのか、説明していない意図があるのか、本当に必要なものは何か。整理が終わって初めて作り始めます。


<br> 

## なぜ必要か？

Claude CodeやCodexはすでに強力なコーディングAIですが、初めて使う人には慣れていないことがあります。

**1. 詳しく説明する方法がわからない。**
> 「ログイン機能を作って」と言った時、メールログインかソーシャルログインか、パスワードリセットは必要か — 自分でも気づいていなかった決定を**代わりに聞いてくれます。**

**2. 専門用語が難しい。**
> 隔離（元のファイルに触れない別のコピー）、コミット（作業の保存ポイント）のように、初めて出てきた時は**必ず括弧で一度説明**し、以降は繰り返しません。

**3. 作業記録の残し方がわからない。**
> 「前回どこまでやったっけ？」と聞けば、技術ログをただ見せるのではなく人の言葉で**「ログインページのデザインまで決めた。次は会員登録フロー」**と教えてくれます。

これ以外にも、Claude Code / Codexのネイティブ機能（権限確認、巻き戻し、サンドボックス）を活用して、非開発者のバイブコーディングを助けます。


<br> 

## どう動くか？

話しかければ自動的に適切なステップに案内します。


<p align="left">
<code>やりたいことを言う</code> → <code>一緒に整理</code> → <code>隔離空間</code> → <code>小さな計画</code> → <code>一歩ずつ作る</code> → <code>確認</code> → <code>記憶</code>
</p>

<br> 

| ステップ | スキル | 役割 |
|:--------:|--------|------|
| **入口** | `senpai` | 常にオン — リクエストを聞いて適切なスキルに接続 |
| **整理** | `senpai-brainstorming` | 一つずつ質問して隠れた意図や考えを引き出す。コードは一行も書かない |
| **隔離** | `senpai-isolate` | プロジェクトのコピーを作ってそこでだけ作業。元のファイルには絶対触れない |
| **計画** | `senpai-plan` | 合意した設計を2〜5分の小さな作業に分割。承認まで何も作らない |
| **作成** | `senpai-build` | 計画を一歩ずつ実行。各ステップ後にレビュー。エラーはここで修正 |
| **(詰まったら)** | `senpai-unstuck` | 同じ問題が3回繰り返されたら別の角度（単純化・調査・別方向）を提案。解決したら作成に戻る |
| **確認** | `senpai-finish` | 実際に動かして確認し、成果物を残すか捨てるか聞く |
| **記憶** | `senpai-remember` | 何をしたか人の言葉で保存。次回そのまま続けられる |


<br> 

---

<br> 

## インストール

**Claude Code：**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```
<p></p>

**Codex CLI：**

```bash
git clone https://github.com/calmtiger86/senpai-ask.git /tmp/senpai-ask && \
  cp -r /tmp/senpai-ask/skills/* ~/.codex/skills/ && \
  rm -rf /tmp/senpai-ask
```

各スキルがCodex標準パス（`~/.codex/skills/<name>/SKILL.md`）に個別インストールされます。
Claude CodeフックはCodexでは実行されないため無視して構いません。
更新時も同じコマンドを再実行するだけです。

<br> 

**使い方：**

- **Claude Code** — やりたい作業や作りたいものを話すだけ。`senpai`が始めます。
- **Codex CLI** — 作りたいものを話せば`senpai`が始めます。自動ルーティングが動かない場合は`/senpai`で直接呼び出してください。

> **自動ルーティングを確実にするには：** プロジェクトフォルダに`AGENTS.md`ファイルを作り、以下の一行を入れてください。
>
> ```
> コーディング関連のリクエストはsenpaiスキルを最初に経由してください。
> ```

---

<details>
<summary><strong>セーフティ</strong></summary>

<br>

スキルはガイドラインですが、**コードで強制される**ものが一つあります — `PreToolUse`ガードフック：

- **秘密ファイルをブロック** — `.env`、SSH鍵、`.pem`/`.key`、名前に「secret」や「credential」を含むファイル。読み取り・書き込み・シェル参照すべてブロック。
- **設定ファイルを保護** — `.claude/`、`.codex/`、`.claude-plugin/`内のファイルはセッション中に変更不可。

隔離ワークスペース内でも同様に適用されます。`"This looks like a secret file"`が表示されたら、バグではなくガードが正常に動作している証拠です。ガードフックはClaude Codeでのみ実行されます。Codexではサンドボックスと承認モードがこの役割を担います。

> 最もシンプルで強力な安全装置は、**承認するまで本物のプロジェクトに触れないこと**です。
> `senpai-isolate`（隔離）と`senpai-finish`（最終決定）が担当します。

</details>

<br>


<p align="center">
  <sub>MIT License · Made by <a href="https://www.threads.com/@calmtiger_">CalmTiger</a></sub>
</p>
