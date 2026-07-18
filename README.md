<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>딱히 도와주고 싶은 건 아니고.. 내가 일 두번 하는게 싫어서 그래.</em>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Claude_Code-compatible-111111?style=flat-square" alt="Claude Code">
  <img src="https://img.shields.io/badge/Codex_CLI-compatible-111111?style=flat-square" alt="Codex CLI">
</p>

<p align="center">
  <sub><a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh.md">中文</a></sub>
</p>

---

##"이거 만들어줘"라고 AI에게 말하면 츤데레 선배가 나타나 묻습니다. "이렇게 만들고 싶은거 맞아?"


코딩도, 터미널도, 바이브코딩도 처음인 사람을 위한 **Brainstorming 방식의 작업 설계 스킬.**

(Claude Code / Codex CLI 지원)

> "이거 만들어줘"라고 말하면 바로 코드부터 짜는 게 아니라,
>
> **"먼저 물어보고, 답변을 통해 계획을 먼저 설계합니다."**
>
> 뭘 만들고 싶은 건지, 설명하지 않은 의도가 있는지, 진짜 필요한 건 뭔지. 정리가 끝나야 그제서야 만들기 시작합니다.

---

## 왜 필요한가?

Claude Code나 Codex는 이미 강력한 코딩 AI지만, 처음 쓰는 사람에게 익숙하지 않은 것이 있습니다.

**1. 자세히 설명하는 방법을 모른다.**
> "로그인 기능 만들어줘"라고 했을 때, 이메일 로그인인지 소셜 로그인인지, 비밀번호 재설정은 필요한지, 본인도 모르던 결정을 **대신 물어봐줍니다.**

**2. 전문용어가 어렵다.**
> 격리(원본을 건드리지 않는 별도 복사본), 커밋(작업 저장점)처럼, 낯선 단어가 나올 때 **괄호로 한 번씩 꼭 설명**해주고 이후엔 반복하지 않습니다.

**3. 작업 기록을 남기는 방법을 모른다.**
> "지난번에 어디까지 했지?"라고 물으면, 기술 로그를 그냥 보여주는게 아니라 사람 말로 **"로그인 페이지 디자인까지 정했고, 다음은 회원가입 흐름"** 이라고 알려줍니다.

이 외에도 Claude Code / Codex의 네이티브 기능(권한 확인, 되돌리기, 샌드박스)을 활용해서 비개발자의 바이브코딩을 돕습니다.

---

## 어떻게 작동하는가?

말 하면 알아서 맞는 단계로 안내합니다. 흐름은 이렇습니다.


<p align="left">
<code>하고 싶은 것 말하기</code> → <code>같이 정리</code> → <code>격리 공간</code> → <code>작은 계획</code> → <code>한 단계씩 만들기</code> → <code>확인</code> → <code>기억</code>
</p>


| 단계 | 스킬 | 하는 일 |
|:----:|------|---------|
| **입구** | `senpai` | 항상 켜져 있음 — 요청을 듣고 맞는 스킬로 연결 |
| **같이 정리** | `senpai-brainstorming` | 한 번에 하나씩 질문하면서 숨은 의도와 생각을 꺼냄. 코드는 한 줄도 안 씀 |
| **격리** | `senpai-isolate` | 진짜 프로젝트 복사본을 만들어서 거기서만 별도 작업. 원본은 절대 안 건드림 |
| **계획** | `senpai-plan` | 합의된 작업 설계를 2~5분짜리 작은 단위의 작업으로 쪼갬. 승인 전까지 안 만듦 |
| **만들기** | `senpai-build` | 계획을 한 단계씩 실행. 매 단계 끝나면 리뷰. 에러 나면 여기서 잡음 |
| **확인** | `senpai-finish` | 다 됐는지 실제로 돌려보고, 결과물을 살릴지 버릴지 물어봄 |
| **기억** | `senpai-remember` | 뭘 했고 뭘 정했는지, 다음에 이어서 할 수 있게 사람 말로 저장 |

---

<details>
<summary><strong>안전장치</strong></summary>

<br>

스킬은 가이드라인이지만, **코드로 강제되는** 것이 하나 있습니다 — `PreToolUse` 가드 훅:

- **비밀 파일 차단** — `.env`, SSH 키, `.pem`/`.key`, 이름에 "secret"이나 "credential"이 들어간 파일. 읽기·쓰기·쉘 참조 전부 차단.
- **설정 파일 보호** — `.claude/`, `.codex/`, `.claude-plugin/` 안의 파일은 세션 중 수정 불가.

격리 공간 안에서도 동일하게 적용됩니다. `"This looks like a secret file"` 메시지가 뜨면 버그가 아니라 이 가드가 정상 작동하는 것입니다.

> 가장 단순하면서 강력한 안전장치는 **승인 전까지 진짜 프로젝트를 안 건드리는 것**입니다.
> `senpai-isolate`(격리)와 `senpai-finish`(최종 결정)가 담당합니다.

</details>

## 설치

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```
<p></p>

**Codex CLI:** 이 저장소를 Codex 플러그인으로 설치 (Codex의 플러그인 설치 문서 참고 — 표준 Claude Code / Codex 호환 스킬 플러그인이라 별도 설정 불필요).

설치 후 그냥 하고 싶은 작업이나 만들고 싶은 것을 말하면 됩니다. 만들고 싶은 걸 말하면 `senpai`가 알아서 시작합니다.

---

<p align="center">
  <sub>MIT License · Made by <a href="https://www.threads.com/@calmtiger_">CalmTiger</a></sub>
</p>
