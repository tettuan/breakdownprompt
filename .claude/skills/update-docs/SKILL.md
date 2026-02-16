---
name: update-docs
description: Use when implementing new features, changing behavior, or modifying the public API. Documents changes in README and relevant docs.
allowed-tools: [Read, Edit, Grep, Glob, Bash]
---

# Documentation Update

ユーザー向け変更を発見可能にするため、変更種別に応じたドキュメント箇所を更新する。

## Decision Matrix

| 変更種別 | 更新先 |
|----------|--------|
| 新 public API (型/関数/クラス) | README.md (簡潔), docs/api_reference.md (詳細), mod.ts (export + JSDoc) |
| 新機能 | README.md, docs/user_guide.md (複雑な場合) |
| 動作変更 | README.md (既存記述更新), CHANGELOG.md |
| 変数システム変更 | README.md, docs/variables.ja.md / docs/type_of_variables.ja.md |
| 内部変更 | .claude/CLAUDE.md (開発ワークフローに影響する場合のみ) |

手順: `git diff --name-only` → 変更分類 → 該当ドキュメント更新 → コード例の動作確認。簡潔・例示優先・検索可能を守る。内部実装詳細・一時的ワークアラウンド・デバッグ専用オプションは記載しない。
