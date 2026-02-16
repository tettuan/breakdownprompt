---
name: local-ci
description: Run local CI checks before merge or push. Use when user says 'CI', 'ローカルCI', or before creating PRs.
allowed-tools: [Bash, Read]
---

push 前にエラーを検出するため、`scripts/local_ci.sh` を実行する（エラー時は `DEBUG=true scripts/local_ci.sh`）。

## Pipeline Stages

lock 再生成 → type check → JSR dry-run → tests → fmt check → lint

全チェック pass まで push しない。
