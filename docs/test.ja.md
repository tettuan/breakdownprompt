# テスト

## デバッグモード

`local_ci.sh` スクリプトでは、以下の方法でデバッグモードを制御できます：

1. 通常実行: `./scripts/local_ci.sh`
2. デバッグモード: `DEBUG=true ./scripts/local_ci.sh`

デバッグモードは、deno.lock再生成失敗、テスト失敗、フォーマット/リントチェック失敗時に自動的に有効になります。

# テスト階層構造

テスト階層は、単体テストからシステムテストまで、段階的に機能を検証する構造を採用しています。各階層は独立して実行可能で、下位のテストが上位のテストの基盤となります。特に、変数の関係性の検証に重点を置き、以下の点を強化しています：

1. 予約変数とテンプレート変数の関係性
2. variables パラメータの制約と検証
3. 変数置換処理の完全性

```
tests/
├── 01_unit/                    # 単体テスト
│   ├── 01_validation/         # バリデーション関連のテスト
│   │   ├── 01_path_validator_test.ts      # パス検証
│   │   ├── 02_variable_validator_test.ts  # 変数名検証
│   │   ├── 03_absolute_path_validator_test.ts # 絶対パス検証
│   │   ├── 04_parameter_validator_test.ts # パラメータ検証
│   │   └── 05_reserved_variable_test.ts   # 予約変数検証
│   ├── 02_templates/          # テンプレート関連のテスト
│   │   ├── 01_template_file_test.ts       # テンプレートファイル処理
│   │   ├── 02_template_validation_test.ts # テンプレート検証
│   │   └── 03_template_assets_test.ts     # テンプレートアセット
│   ├── 03_utils/             # ユーティリティのテスト
│   │   ├── 01_logger_test.ts              # ログ出力
│   │   └── 02_file_utils_test.ts          # ファイル操作
│   └── 04_core/              # コアコンポーネントのテスト
│       ├── 01_variable_matcher_test.ts    # 変数照合処理
│       ├── 02_variable_replacer_test.ts   # 変数置換処理
│       └── 03_prompt_manager_test.ts      # プロンプト管理の基本機能
│
├── 02_integration/            # 統合テスト
│   ├── 01_template_processing_test.ts     # テンプレート処理フロー
│   ├── 02_variable_chain_test.ts          # 変数連鎖処理
│   ├── 03_parameter_flow_test.ts          # パラメータ処理フロー
│   └── 04_variable_validation_flow.ts     # 変数検証フロー
│
├── 03_system/                # システムテスト
│   ├── 01_end_to_end_test.ts              # エンドツーエンド
│   ├── 02_error_handling_test.ts          # エラー処理
│   ├── 03_variable_replacement_test.ts    # 変数置換システム
│   └── 04_variable_edge_cases_test.ts     # 変数エッジケース
│
└── 00_fixtures/              # テスト用データ
    ├── 01_templates/         # テンプレートファイル
    │   ├── 01_basic.md       # 基本的なテンプレート
    │   ├── 02_with_variables.md  # 変数を含むテンプレート
    │   ├── 03_basic.txt      # テキスト形式のテンプレート
    │   ├── 04_basic.yml      # YAML形式のテンプレート
    │   ├── 05_invalid/       # 無効なテンプレート
    │   └── 06_reserved_vars/ # 予約変数テンプレート
    ├── 02_variables/         # 変数データ
    │   ├── 01_valid.json     # 有効な変数セット
    │   ├── 02_invalid.json   # 無効な変数セット
    │   └── 03_reserved.json  # 予約変数セット
    └── 03_expected/          # 期待出力
        ├── 01_basic_output.md    # 基本的な出力例
        ├── 02_variable_output.md # 変数置換後の出力例
        └── 03_reserved_output.md # 予約変数出力例
```

## テスト実行順序

1. フィクスチャの準備 (00_fixtures/)
   - テストデータの準備
   - 後続のテストで必要なデータの確保

2. 単体テスト (01_unit/)
   - バリデーション
   - テンプレート
   - ユーティリティ
   - コアコンポーネント

3. 統合テスト (02_integration/)
   - コンポーネント間の連携
   - フローの検証

4. システムテスト (03_system/)
   - エンドツーエンドテスト
   - エラー処理
   - 変数置換システム

# エラーメッセージ

- テストメッセージはENUMで定義
- 同じ結果を期待する場合は同じENUMメッセージを使用
- エラーメッセージが異なることを確認する場合は、テストに異なるメッセージを記載

## デバッグ出力

```typescript
import { BreakdownLogger } from "@tettuan/breakdownlogger";
const logger = new BreakdownLogger();
logger.debug("テスト実行開始", { testName: "example" });
```

ログレベル: debug, info, warn, error

## エラー処理とデバッグ

1. デバッグログの確認
2. テスト環境の状態確認
3. 関連テストケースの実行
4. エラー再現手順の文書化

# スケルトンコードの構築順序

1. テストディレクトリ構造に従いファイル作成
2. テスト項目を先に記述
3. テストが失敗する記述を入れる
4. コメントで意図や目的を記載
