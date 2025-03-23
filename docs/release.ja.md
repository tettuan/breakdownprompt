# リリース手順

## 概要

このドキュメントでは、GitHub Actionsを使用してJSRにパブリッシュする手順を説明します。

## 前提条件

- GitHub Actionsが有効化されていること
- リポジトリに`v*`形式のタグがプッシュされていること

## リリースプロセス

### 1. バージョン番号の決定

- パッチバージョン（0.0.X）: バグ修正
- マイナーバージョン（0.X.0）: 後方互換性のある機能追加
- メジャーバージョン（X.0.0）: 破壊的変更

### 2. タグの作成とプッシュ

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

### 3. 自動パブリッシュ

- タグがプッシュされると、GitHub Actionsが自動的に実行されます
- 以下の手順が自動的に実行されます：
  1. Denoのセットアップ
  2. キャッシュの更新（`deno.lock`の再生成）
  3. ロックファイルの変更をコミット
  4. JSRへのパブリッシュ

### 4. パブリッシュ失敗時の対応

パブリッシュが失敗した場合、以下の手順で再試行できます：

1. 失敗したタグを削除

```bash
git tag -d vX.Y.Z
git push origin :refs/tags/vX.Y.Z
```

2. 同じバージョンでタグを再作成

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

## 注意事項

- パブリッシュ前に`deno.json`の設定が正しいことを確認してください
- パブリッシュに失敗した場合、新しいバージョン番号を付与する必要はありません
- 未コミットの変更がある場合、パブリッシュは失敗します

## トラブルシューティング

### ロックファイルのバージョンエラー

```bash
error: Unsupported lockfile version '4'. Try upgrading Deno or recreating the lockfile
```

このエラーが発生した場合：

1. ローカルで`deno.lock`を削除
2. `deno cache src/mod.ts`を実行して新しいロックファイルを生成
3. 変更をコミットしてプッシュ

### 未コミットの変更エラー

```bash
error: Aborting due to uncommitted changes. Check in source code or run with --allow-dirty
```

このエラーが発生した場合：

1. ローカルの変更をコミット
2. リモートにプッシュ
3. タグを再作成してプッシュ
