---
name: breakdownlogger-implement-logger
description: Use when implementing features, adding code, or placing BreakdownLogger in source. Guides KEY naming, placement strategy, and validation. Trigger words - 'implement', '実装', 'add logger', 'ロガー追加', 'KEY naming', 'validate usage'.
allowed-tools: Read, Grep, Glob, Bash
---

# Implement Logger

KEY 命名とロガー配置はデバッグ精度を決める設計判断なので、命名重複・配置ミス・本番混入を事前に防ぐ。

## 1. KEY Discovery

重複 KEY はフィルタリングを壊すので、新規作成前に既存 KEY を検索する。

```bash
grep -rn 'new BreakdownLogger(' --include='*.ts' | grep -oP '"[^"]*"' | sort -u
```

既存 KEY がカバー → 再利用 / 広すぎ → sub-key 作成 / なし → 命名ルールで新規 / 一時調査 → `fix-<issue>` prefix（調査後削除）

## 2. KEY Naming

`LOG_KEY=...` で毎回タイプするフィルタハンドルなので、プロジェクトで1方式を選び一貫させる。

| 方式 | 用途 | 例 |
|------|------|-----|
| By feature | ユーザー向け機能 | `auth`, `payment` |
| By layer | データフロー問題 | `controller`, `service` |
| By flow | 横断プロセス | `order-auth`, `order-stock` |

制約: lowercase kebab-case、汎用名(`util`,`helper`)禁止、名前空間は prefix(`auth-token`)、一時キーは `fix-<id>`。

## 3. Placement

データは境界で変換されるので、4境界点（引数受信後・値返却前・外部呼出前後・エラーハンドラ内）に配置する。

タイトループ内(出力洪水)・全行後(ナレーション)・`data`パラムなし(根本原因不可視)・循環参照オブジェクト(`[Object]`化) は禁止。

## 4. Writing Style

`LOG_LENGTH` は末尾切り詰めなので、重要情報を先頭40字に置く。message=何が起きたか、data=証拠。

```typescript
logger.debug("Timeout: DB conn exceeded 30s", { host });
```

## 5. Validation

テスト専用なので、非テストファイルの import を検出する: `deno run --allow-read jsr:@tettuan/breakdownlogger/validate [target-dir]`

実戦パターンは `docs/usage.md` §4,§5,§6,§9 参照。
