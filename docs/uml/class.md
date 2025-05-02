```mermaid
classDiagram
    namespace Application {
        class PromptManager {
            +generatePrompt(params: PromptParams): PromptResult
            -validateParams(params: PromptParams): boolean
            -processTemplate(params: PromptParams): string
            -handleError(message: string): PromptResult
            -validateReservedVariables(variables: Map<string, string>): boolean
            -extractTemplateVariables(template: string): string[]
        }

        class PromptGenerator {
            -template: string
            -variables: Map<string, string>
            +parseTemplate(template: string): string[]
            +replaceVariables(variables: Map<string, string>): string
        }

        class TemplateFile {
            -content: string
            -extension: string
            +readFile(path: string): void
            +validateExtension(): boolean
            +getContent(): string
            +static isValidExtension(extension: string): boolean
            +replaceVariable(content: string, variable: string, value: string): string
        }

        class BaseReservedVariable {
            <<abstract>>
            #name: string
            #type: string
            +getName(): string
            +getType(): string
            +validate(value: unknown): boolean
            +process(value: unknown): string
            #normalizeValue(value: unknown): unknown
            #validateValue(value: unknown): boolean
            #convertValue(value: unknown): string
        }

        class ReservedVariable {
            <<interface>>
            +getName(): string
            +getType(): string
            +validate(value: unknown): boolean
            +process(value: unknown): string
        }

        class SchemaFileVariable {
            +name: "schema_file"
            +type: "file_path"
            #validateValue(value: unknown): boolean
            #convertValue(value: unknown): string
        }

        class InputTextVariable {
            +name: "input_text"
            +type: "text_content"
            #validateValue(value: unknown): boolean
            #convertValue(value: unknown): string
        }

        class InputTextFileVariable {
            +name: "input_text_file"
            +type: "file_path"
            #validateValue(value: unknown): boolean
            #convertValue(value: unknown): string
        }

        class DestinationPathVariable {
            +name: "destination_path"
            +type: "directory_path"
            #validateValue(value: unknown): boolean
            #convertValue(value: unknown): string
        }

        class VariableValidator {
            +validateVariableName(name: string): boolean
            +validateVariableType(name: string, value: string): boolean
            +validateReservedVariables(variables: Map<string, string>): boolean
            +validateReservedVariableKeys(variables: Map<string, string>): boolean
            +validateReservedVariableValues(variables: Map<string, string>): boolean
            +matchVariables(template_vars: string[], reserved_vars: string[]): string[]
            +validateFilePath(path: string): boolean
            +validateDirectoryPath(path: string): boolean
        }

        class PathValidator {
            +validateFilePath(path: string): boolean
            +validateDirectoryPath(path: string): boolean
            +normalizePath(path: string): string
        }

        class FileUtils {
            +readFile(path: string): string
            +writeFile(path: string, content: string): void
            +exists(path: string): boolean
            +isReadable(path: string): boolean
            +getExtension(path: string): string
        }

        class PromptParams {
            +template_file: string
            +variables: Map<string, string>
        }

        class PromptResult {
            +success: boolean
            +prompt?: string
            +error?: string
            +static success(prompt: string): PromptResult
            +static error(message: string): PromptResult
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
            +testProcessTemplate(): void
            +testValidateReservedVariables(): void
        }

        class PromptGeneratorTest {
            -logger: BreakdownLogger
            +testParseTemplate(): void
            +testReplaceVariables(): void
        }

        class TemplateFileTest {
            -logger: BreakdownLogger
            +testReadFile(): void
            +testValidateExtension(): void
            +testInvalidExtension(): void
            +testReplaceVariable(): void
        }

        class ValidatorTest {
            -logger: BreakdownLogger
            +testVariableValidator(): void
            +testPathValidator(): void
        }
    }

    PromptManager --> PromptGenerator
    PromptManager --> TemplateFile
    PromptManager --> VariableValidator
    PromptManager --> PathValidator
    PromptManager --> FileUtils
    PromptManager --> PromptParams
    PromptManager --> PromptResult

    PromptGenerator --> VariableValidator
    PromptGenerator --> PathValidator

    TemplateFile --> FileUtils

    ReservedVariable <|.. BaseReservedVariable
    BaseReservedVariable <|-- SchemaFileVariable
    BaseReservedVariable <|-- InputTextVariable
    BaseReservedVariable <|-- InputTextFileVariable
    BaseReservedVariable <|-- DestinationPathVariable

    VariableValidator --> ReservedVariable

    PromptManagerTest --> BreakdownLogger
    PromptGeneratorTest --> BreakdownLogger
    TemplateFileTest --> BreakdownLogger
    ValidatorTest --> BreakdownLogger
```
