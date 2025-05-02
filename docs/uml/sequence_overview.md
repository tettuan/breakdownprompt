# 全体処理フロー

このシーケンス図は、プロンプト生成処理の全体像を示しています。クライアントからのパラメータを受け取り、内部でパラメータ検証とテンプレート処理を行い、最終的に置換済みのプロンプトまたはエラーメッセージを返却します。処理の成功/失敗に関わらず、常に結果を返却する点が特徴です。

```mermaid
sequenceDiagram
    participant Client
    participant PromptManager
    participant TemplateFile
    participant VariableValidator
    participant PathValidator
    participant PromptResult

    Note over Client,PromptResult: 全体処理フロー
    Client->>PromptManager: generatePrompt(params)
    
    Note over PromptManager: パラメータ検証
    PromptManager->>VariableValidator: validateReservedVariables(params.variables)
    alt 予約変数検証失敗
        VariableValidator-->>PromptManager: error
        PromptManager-->>Client: PromptResult(error)
    end
    VariableValidator-->>PromptManager: valid_variables

    Note over PromptManager: パス検証
    PromptManager->>PathValidator: validateFilePath(params.template_file)
    alt パス検証失敗
        PathValidator-->>PromptManager: error
        PromptManager-->>Client: PromptResult(error)
    end
    PathValidator-->>PromptManager: valid_path

    Note over PromptManager: テンプレート処理
    PromptManager->>TemplateFile: readFile(params.template_file)
    TemplateFile-->>PromptManager: template_content

    Note over PromptManager: 変数処理
    PromptManager->>VariableValidator: extractTemplateVariables(template_content)
    VariableValidator-->>PromptManager: template_variables
    PromptManager->>VariableValidator: matchVariables(template_variables, valid_variables)
    alt 変数照合失敗
        VariableValidator-->>PromptManager: error
        PromptManager-->>Client: PromptResult(error)
    end
    VariableValidator-->>PromptManager: matched_variables

    Note over PromptManager: 変数置換
    PromptManager->>PromptManager: replaceVariables(matched_variables)
    PromptManager-->>Client: PromptResult(success)
``` 