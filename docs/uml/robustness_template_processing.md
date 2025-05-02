# テンプレート処理のロバストネス図

このロバストネス図は、テンプレート処理における変数検出と置換の流れを示しています。特に、予約変数とテンプレート変数の照合プロセスを明確に表現しています。

```mermaid
robustnessDiagram
    actor Client
    boundary "PromptManager" as PM
    control "TemplateProcessor" as TP
    control "VariableValidator" as VV
    control "VariableMatcher" as VM
    entity "TemplateFile" as TF
    entity "ReservedVariables" as RV
    entity "TemplateVariables" as TV

    Client -> PM: generatePrompt(template_file, variables)
    PM -> TP: processTemplate(template_file)
    TP -> TF: readFile()
    TF --> TP: template_content

    Note over TP,VV: 予約変数の検証
    TP -> VV: validateReservedVariables(variables)
    VV -> RV: getReservedVariableKeys()
    RV --> VV: reserved_variable_keys
    VV --> TP: validation_result

    Note over TP,VM: テンプレート変数の抽出と照合
    TP -> VM: extractTemplateVariables(template_content)
    VM --> TP: template_variables
    TP -> VM: matchVariables(template_variables, reserved_variable_keys)
    VM --> TP: matched_variables

    Note over TP: 変数置換処理
    TP -> TP: replaceVariables(matched_variables)
    TP --> PM: processed_content
    PM --> Client: prompt_result
```

## 説明

1. **境界と制御**
   - `PromptManager`: システムの境界を表し、クライアントとのインターフェースを提供
   - `TemplateProcessor`: テンプレート処理の制御ロジックを担当
   - `VariableValidator`: 予約変数の検証ロジックを担当
   - `VariableMatcher`: 変数の照合ロジックを担当

2. **エンティティ**
   - `TemplateFile`: テンプレートファイルの内容を保持
   - `ReservedVariables`: 予約変数の定義を保持
   - `TemplateVariables`: テンプレート内の変数を保持

3. **処理フロー**
   - 予約変数の検証
     - 予約変数のキーリストを取得
     - 変数の型と値の検証を実行
   - テンプレート変数の抽出と照合
     - テンプレートから変数記述を抽出
     - 予約変数との照合を実行
   - 変数置換処理
     - 照合済みの変数のみを置換

4. **特徴**
   - 予約変数とテンプレート変数を明確に区別
   - 予約変数の検証を独立したステップとして実装
   - 照合プロセスで両者の整合性を確認
   - 一致しない変数は無視される 