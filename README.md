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
  <img src="https://img.shields.io/badge/Codex-compatible-111111?style=flat-square" alt="Codex">
</p>

<p align="center">
  <sub><a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh.md">中文</a></sub>
</p>

---

<p align="center">
 <em>"이거 만들어줘"라고 AI에게 말하면 츤데레 선배가 나타나 묻습니다. "이렇게 만들고 싶은거 맞아?"</em>
</p>

---

<br> 

코딩도, 터미널도, 바이브코딩도 처음인 사람을 위한 **Brainstorming 방식의 작업 설계 스킬.**

<br> 

> "이거 만들어줘"라고 말하면 바로 코드부터 짜는 게 아니라,
>
> **"먼저 물어보고, 답변을 통해 계획을 먼저 설계합니다."**
>
> 뭘 만들고 싶은 건지, 설명하지 않은 의도가 있는지, 진짜 필요한 건 뭔지. 정리가 끝나야 그제서야 만들기 시작합니다.


<br> 

## 왜 필요한가?

Claude Code나 Codex는 이미 강력한 코딩 AI지만, 처음 쓰는 사람에게 익숙하지 않은 것이 있습니다.

**1. 자세히 설명하는 방법을 모른다.**
> "로그인 기능 만들어줘"라고 했을 때, 이메일 로그인인지 소셜 로그인인지, 비밀번호 재설정은 필요한지, 본인도 모르던 결정을 **대신 물어봐줍니다.**

**2. 전문용어가 어렵다.**
> 격리(원본을 건드리지 않는 별도 복사본), 커밋(작업 저장점)처럼, 낯선 단어가 나올 때 **괄호로 한 번씩 꼭 설명**해주고 이후엔 반복하지 않습니다.

**3. 작업 기록을 남기는 방법을 모른다.**
> "지난번에 어디까지 했지?"라고 물으면, 기술 로그를 그냥 보여주는게 아니라 사람 말로 **"로그인 페이지 디자인까지 정했고, 다음은 회원가입 흐름"** 이라고 알려줍니다.

이 외에도 Claude Code / Codex의 네이티브 기능(권한 확인, 되돌리기, 샌드박스)을 활용해서 비개발자의 바이브코딩을 돕습니다.


<br> 

## 어떻게 작동하는가?

말 하면 알아서 맞는 단계로 안내합니다. 흐름은 이렇습니다.


<p align="left">
<code>하고 싶은 것 말하기</code> → <code>같이 정리</code> → <code>격리 공간</code> → <code>작은 계획</code> → <code>한 단계씩 만들기</code> → <code>확인</code> → <code>기억</code>
</p>

<br> 

| 단계 | 스킬 | 하는 일 |
|:----:|------|---------|
| **입구** | `senpai` | 항상 켜져 있음 — 요청을 듣고 맞는 스킬로 연결 |
| **같이 정리** | `senpai-brainstorming` | 한 번에 하나씩 질문하면서 숨은 의도와 생각을 꺼냄. 코드는 한 줄도 안 씀 |
| **격리** | `senpai-isolate` | 진짜 프로젝트 복사본을 만들어서 거기서만 별도 작업. 원본은 마지막에 반영할지 정할 때까지 그대로 |
| **계획** | `senpai-plan` | 합의된 작업 설계를 2~5분짜리 작은 단위의 작업으로 쪼갬. 승인 전까지 안 만듦 |
| **만들기** | `senpai-build` | 계획대로 만들고 리뷰. 작은 변경은 리뷰 한 번, 큰 변경은 단계마다 리뷰. 에러 나면 여기서 잡음 |
| **(막혔을 때)** | `senpai-unstuck` | 같은 문제가 세 번 반복되면 다른 각도(단순화·조사·다른 방향)로 제안. 풀리면 다시 만들기로 복귀 |
| **확인** | `senpai-finish` | 다 됐는지 실제로 돌려보고, 결과물을 살릴지 버릴지 물어봄 |
| **기억** | `senpai-remember` | 뭘 했고 뭘 정했는지, 다음에 이어서 할 수 있게 사람 말로 저장 |


<br> 

---

<br> 

## 설치

| 환경 | 지원 | 설치 방법 |
|---|---|---|
| Claude Code 터미널 | 지원 | 아래 명령 |
| Claude 데스크톱 앱(로컬·SSH 세션) | 지원 | 아래 명령(SSH 세션은 접속한 컴퓨터에서 실행) |
| VS Code의 Claude Code 확장 | 지원 | `/plugins` → Marketplaces 탭 |
| Codex 터미널 | 지원 | 아래 명령 |
| Codex 데스크톱 앱 | 시험 지원 | 아래 명령 또는 앱의 Plugins 탭 |
| 편집기의 Codex 확장 | 스킬만(훅 없음) | 스킬 폴더 복사(아래) |
| claude.ai 웹의 클라우드 세션, 데스크톱 앱의 WSL 세션 | 미지원 | 플러그인을 불러오지 않습니다 |

직접 시험한 환경은 Claude Code 터미널과 Codex 터미널입니다. Claude 데스크톱 앱의 로컬 세션은 터미널과 같은 설정을 써서 터미널에서 설치한 플러그인을 그대로 불러옵니다. VS Code와 Codex 데스크톱 앱은 각 제품 문서를 기준으로 적었습니다.

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

Claude 데스크톱 앱의 로컬 세션은 터미널과 같은 설정을 쓰므로, 위 명령으로 설치하면 앱에서도 쓸 수 있습니다. SSH 세션이라면 접속한 컴퓨터에서 위 명령을 실행하세요. VS Code에서는 입력창에 `/plugins`를 쳐서 여는 **Manage plugins** 화면의 **Marketplaces** 탭에서 `calmtiger86/senpai-ask`를 추가하고 senpai-ask를 설치합니다.

업데이트는 터미널에서 아래 두 줄을 실행한 뒤 Claude Code를 다시 시작하면 됩니다.

```bash
claude plugin marketplace update senpai-ask
claude plugin update senpai-ask@senpai-ask
```

직접 추가한 마켓플레이스는 자동 업데이트가 기본으로 꺼져 있습니다. 자동으로 받으려면 Claude Code에서 `/plugin`을 열고 **Marketplaces** → `senpai-ask` → **Enable auto-update**를 고르세요.
<p></p>

**Codex:**

```bash
codex plugin marketplace add calmtiger86/senpai-ask
codex plugin add senpai-ask@senpai-ask
```

Codex가 senpai 훅을 실행해도 되는지 물으면 허락해 주세요. 그래야 세션을 시작할 때마다 senpai 모드가 켜집니다. 허락하지 않아도 스킬은 쓸 수 있습니다.
Codex에서는 Git 저장점(커밋)이나 작업 복사본을 만들 때 승인 창이 뜰 수 있습니다. Codex 샌드박스가 `.git` 폴더를 보호하기 때문이니 승인하면 됩니다.

업데이트는 아래 명령을 실행한 뒤 Codex를 다시 시작하면 됩니다.

```bash
codex plugin marketplace upgrade senpai-ask
```

VS Code 같은 편집기의 Codex 확장은 플러그인을 지원하지 않습니다. 편집기에서 쓰려면 스킬만 복사하세요(훅은 없습니다). 플러그인과 함께 설치하면 같은 스킬이 두 번 보이니 둘 중 하나만 쓰세요.

```bash
git clone https://github.com/calmtiger86/senpai-ask.git /tmp/senpai-ask && \
  mkdir -p ~/.agents/skills && \
  cp -r /tmp/senpai-ask/skills/* ~/.agents/skills/ && \
  rm -rf /tmp/senpai-ask
```

스킬만 복사한 경우에는 같은 명령을 다시 실행하면 업데이트됩니다.

<br> 

**사용법:**

- **Claude Code** — 설치 후 그냥 하고 싶은 작업이나 만들고 싶은 것을 말하면 됩니다. `senpai`가 알아서 시작합니다.
- **Codex** — 만들고 싶은 것을 말하면 `senpai`가 시작합니다. 직접 부르려면 `$`를 입력하거나 `/skills`를 열어 `senpai-ask:senpai`를 고르세요(스킬만 복사했다면 `senpai`, 데스크톱 앱에서는 `$` 대신 `@`).

> **자동 라우팅을 확실히 하려면:** 프로젝트 폴더에 `AGENTS.md` 파일을 만들고 아래 한 줄을 넣어두세요.
>
> ```
> 코딩 관련 요청은 senpai 스킬을 먼저 거쳐 주세요.
> ```

---

<details>
<summary><strong>안전장치</strong></summary>

<br>

> 가장 단순하면서 강력한 안전장치는 **승인 전까지 진짜 프로젝트를 안 건드리는 것**입니다.
> `senpai-isolate`(격리)와 `senpai-finish`(최종 결정)가 담당합니다.

비밀 파일(`.env` 등) 보호는 Claude Code / Codex의 자체 권한 시스템에 맡깁니다.

</details>

<br>


<p align="center">
  <sub>MIT License · Made by <a href="https://www.threads.com/@calmtiger_">CalmTiger</a></sub>
</p>
