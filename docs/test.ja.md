# テスト

## デバッグモード

### local_ci.sh のデバッグモード

`local_ci.sh` スクリプトでは、以下の方法でデバッグモードを制御できます：

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

# テスト階層構造

```
tests/
├── unit/                    # 単体テスト
│   ├── core/               # コアコンポーネントのテスト
│   │   ├── prompt_manager_test.ts
│   │   ├── prompt_generator_test.ts
│   │   └── variable_replacer_test.ts
│   ├── validation/         # バリデーション関連のテスト
│   │   ├── path_validator_test.ts
│   │   ├── markdown_validator_test.ts
│   │   └── schema_validator_test.ts
│   └── utils/             # ユーティリティのテスト
│       ├── logger_test.ts
│       └── file_utils_test.ts
│
├── integration/            # 統合テスト
│   ├── prompt_flow_test.ts    # プロンプト処理フロー
│   ├── variable_chain_test.ts # 変数連鎖処理
│   └── template_link_test.ts  # テンプレート連携
│
├── system/                # システムテスト
│   ├── end_to_end_test.ts    # エンドツーエンド
│   └── error_handling_test.ts # エラー処理
│
├── security/              # セキュリティテスト
│   ├── path_injection_test.ts # パスインジェクション
│   ├── file_access_test.ts   # ファイルアクセス
│   └── input_validation_test.ts # 入力検証
│
└── fixtures/              # テスト用データ
    ├── input/            # 入力データ
    │   ├── basic.md
    │   ├── structured.md
    │   └── invalid/
    ├── output/           # 期待出力
    │   ├── basic_expected.md
    │   └── structured_expected.md
    ├── schema/           # スキーマ定義
    │   └── test_schema.json
    └── templates/        # テンプレート
        ├── basic.md
        └── structured.md
```

## テスト階層の説明

### 1. 単体テスト (unit/)

- 各コンポーネントの独立した機能テスト
- インターフェースの実装確認
- エッジケースの検証

### 2. 統合テスト (integration/)

- コンポーネント間の連携テスト
- データフローの検証
- エラー伝播の確認

### 3. システムテスト (system/)

- エンドツーエンドのユースケーステスト
- 実際の運用シナリオの検証

### 4. セキュリティテスト (security/)

- パスインジェクション対策
- ファイルアクセス制御
- 入力検証

### 5. テストフィクスチャ (fixtures/)

- テストデータの管理
- 入力/出力のサンプル
- スキーマ定義
- テンプレート例

# エラーメッセージ
- アプリケーションのテストメッセージをENUM定義する
- テストのエラーメッセージ検証は、同じ結果を期待する場合、同じENUMメッセージを利用する
  - エラーメッセージが異なることを確認する場合は、テストに異なるメッセージを記載する
