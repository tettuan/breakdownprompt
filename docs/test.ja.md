# テスト

## デバッグモード

### bump_version.sh のデバッグモード

`bump_version.sh` スクリプトでは、以下の方法でデバッグモードを制御できます：

1. 通常実行（デバッグモードなし）:

```bash
./scripts/bump_version.sh
```

2. デバッグモードで実行:

```bash
DEBUG=true ./scripts/bump_version.sh
```

デバッグモードの動作：

- デフォルトではデバッグモードは無効

- `DEBUG=true` を指定すると、スクリプト開始時からデバッグモードが有効

- エラー発生時は自動的にデバッグモードが有効になり、詳細な情報が表示される

### local_ci.sh のデバッグモード

`local_ci.sh` スクリプトでも同様にデバッグモードを制御できます：

1. 通常実行（デバッグモードなし）:

```bash
./scripts/local_ci.sh
```

2. デバッグモードで実行:

```bash
DEBUG=true ./scripts/local_ci.sh
```

デバッグモードの動作：

- デフォルトではデバッグモードは無効
- `DEBUG=true` を指定すると、スクリプト開始時からデバッグモードが有効
- 以下のエラー時に自動的にデバッグモードが有効になります：
  - deno.lock の再生成失敗
  - フォーマットチェックの失敗
  - リントチェックの失敗
  - テストの失敗

# 階層構造

tests/fixtures/ ├── input/ # 入力用のテストファイル │ └── test.md ├── output/ #
出力用のテストファイル │ ├── test_output.md │ ├── output__.md │ ├── structured._ │ └── ... ├──
schema/ # スキーマファイル │ └── schema.json └── templates/ # テンプレートファイル
