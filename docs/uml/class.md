```mermaid
classDiagram
    namespace Application {
        class PromptManager {
            +generatePrompt(params: PromptParams): PromptResult
            -validateParams(params: PromptParams): boolean
            -loadTemplate(params: PromptParams): string
            -findUnknownVariables(template: string): string[]
            -validatePath(path: string): boolean
            -normalizePath(path: string): string
            -writeToStdout(content: string): void
        }

        class PromptGenerator {
            -template: string
            -variables: Map<string, VariableReplacer>
            +parseTemplate(template: string): void
            +replaceVariables(result: PromptResult, values: Map<string, unknown>): void
            -validateVariables(values: Map<string, unknown>): boolean
        }

        class VariableReplacer {
            <<interface>>
            +replace(value: unknown): string
            +validate(value: unknown): boolean
        }

        class SchemaFileReplacer {
            +replace(value: unknown): string
            +validate(value: unknown): boolean
            -validatePath(path: string): boolean
            -normalizePath(path: string): string
        }

        class InputMarkdownReplacer {
            +replace(value: unknown): string
            +validate(value: unknown): boolean
            -validateMarkdown(content: string): boolean
            -sanitizeMarkdown(content: string): string
        }

        class InputMarkdownFileReplacer {
            +replace(value: unknown): string
            +validate(value: unknown): boolean
            -validatePath(path: string): boolean
            -normalizePath(path: string): string
        }

        class DestinationPathReplacer {
            +replace(value: unknown): string
            +validate(value: unknown): boolean
            -validatePath(path: string): boolean
            -normalizePath(path: string): string
        }

        class PromptParams {
            +prompt_file_path: string
            +variables: Map<string, unknown>
        }

        class PromptResult {
            +content: string
            +status: "success" | "error"
            +error: string
            +isError(): boolean
            +static error(message: string): PromptResult
            +static success(content: string): PromptResult
        }
    }

    namespace Test {
        class BreakdownLogger {
            +debug(message: string): void
            +info(message: string): void
            +warn(message: string): void
            +error(message: string): void
        }

        class PromptManagerTest {
            -logger: BreakdownLogger
            +testGeneratePrompt(): void
            +testValidateParams(): void
            +testLoadTemplate(): void
        }

        class PromptGeneratorTest {
            -logger: BreakdownLogger
            +testParseTemplate(): void
            +testReplaceVariables(): void
        }

        class VariableReplacerTest {
            -logger: BreakdownLogger
            +testReplace(): void
            +testValidate(): void
        }
    }

    PromptManager --> PromptGenerator
    PromptGenerator --> VariableReplacer
    VariableReplacer <|.. SchemaFileReplacer
    VariableReplacer <|.. InputMarkdownReplacer
    VariableReplacer <|.. InputMarkdownFileReplacer
    VariableReplacer <|.. DestinationPathReplacer
    PromptManager --> PromptParams
    PromptGenerator --> PromptResult

    PromptManagerTest --> BreakdownLogger
    PromptGeneratorTest --> BreakdownLogger
    VariableReplacerTest --> BreakdownLogger
```
