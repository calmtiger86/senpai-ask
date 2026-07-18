<p align="center">
  <img src="assets/senpai_ask.png" width="200" alt="senpai-ask">
</p>

<h1 align="center">senpai-ask</h1>

<p align="center">
  <em>딱히 도와주고 싶은 건 아닌데… 내가 일 두번 하는게 싫어서 그래.</em>
</p>

<p align="center">
  <sub><a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh.md">中文</a></sub>
</p>

---

코딩도, 터미널도, 바이브코딩도 처음인 사람을 위한 Claude Code / Codex CLI 스킬 모음.

Claude Code나 Codex가 이미 갖고 있는 안전장치(권한 확인, 되돌리기, 샌드박스)를 대체하는 게 아니라 그 위에 얹는 것 — 뭘 만들기 전에 먼저 같이 정리하고, 진짜 파일은 건드리지 않는 격리 공간에서 작업하고, 작은 단위로 쪼개서 리뷰하고, 다음 세션에도 무슨 얘기했는지 기억한다.

## 스킬

| 스킬 | 하는 일 |
|------|---------|
| `senpai` | 항상 켜져 있는 입구 — 말 걸면 알아서 맞는 스킬로 연결 |
| `senpai-brainstorming` | 만들기 전에 한 번에 하나씩 질문하면서 숨은 결정들을 꺼냄 |
| `senpai-isolate` | 진짜 프로젝트는 안 건드리는 격리 작업 공간 세팅 |
| `senpai-plan` | 합의된 설계를 2~5분짜리 작은 단계로 쪼갬 |
| `senpai-build` | 계획을 한 단계씩 실행하고, 매 단계 끝나면 리뷰 |
| `senpai-finish` | 다 됐는지 확인하고, 결과를 살릴지 버릴지 물어봄 |
| `senpai-remember` | 뭘 했는지, 뭘 정했는지 다음 세션에도 기억 |

## 안전장치

스킬은 가이드라인이지만, **코드로 강제되는** 한 가지가 있다 — `PreToolUse` 가드 훅:

- **비밀 파일 차단** — `.env`, SSH 키, `.pem`/`.key`, 이름에 "secret"이나 "credential"이 들어간 파일. 읽기·쓰기·쉘 참조 전부 차단.
- **설정 파일 보호** — `.claude/`, `.codex/`, `.claude-plugin/` 안의 파일은 세션 중 수정 불가.

격리 작업 공간 안에서도 동일하게 적용된다. `"This looks like a secret file"` 메시지가 뜨면 버그가 아니라 이 가드가 정상 작동하는 것. 자세한 패턴은 `scripts/protect-secrets.js`, 훅 연결은 `hooks/scripts/guard.js` 참고.

나머지 안전 모델 — 승인 전까지 진짜 프로젝트를 안 건드리는 것 — 은 `senpai-isolate`(격리)와 `senpai-finish`(최종 결정)가 담당한다.

## 설치

**Claude Code:**

```
/plugin marketplace add calmtiger86/senpai-ask
/plugin install senpai-ask@senpai-ask
```

**Codex CLI:** 이 저장소를 Codex 플러그인으로 설치 (Codex의 플러그인 설치 문서 참고 — 표준 Claude Code / Codex 호환 스킬 플러그인이라 별도 설정 불필요).

설치 후 그냥 말 걸면 된다 — 만들고 싶은 걸 말하면 `senpai`가 알아서 시작한다.

## 라이선스

MIT — `LICENSE` 참고.
