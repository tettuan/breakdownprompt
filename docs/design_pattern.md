# System Design Document

## 1. System Overview

The Prompt Management System is a framework for template-based prompt generation and variable substitution. It takes template files and variable parameters as input, performs validation and substitution processing, and generates the final prompt.

> This system aims to improve prompt reusability and maintainability. By separating templates and variables, prompt changes become easier, and by ensuring type safety of variables, runtime errors are prevented.

## 2. Core Components

> Each component is designed based on the Single Responsibility Principle. In particular, by separating validation and substitution processing, the role of each component is clarified, improving testability and maintainability.

### 2.1 Prompt Manager (PromptManager)

#### Responsibilities

- Parameter validation and management
- Template processing coordination
- Variable substitution processing coordination
- Centralized error handling

#### Behavior

1. Parameter Validation
   - Verification of required parameters
   - Variable name format checking (complies with [Variable Definition](./variables.md))
   - Path validity verification

2. Template Processing
   - Template file loading
   - Markdown format validation
   - Variable extraction and validation (matching with reserved variables and template variables)

3. Variable Substitution Processing
   - Type-based validation execution (complies with [Type Definition](./type_of_variables.md))
   - Variable substitution
   - Error handling

### 2.2 Prompt Generator (PromptGenerator)

#### Responsibilities

- Template parsing and variable extraction
- Variable substitution processing execution
- Generation of substitution results

#### Behavior

1. Template Parsing
   - Detection of `{variable_name}` patterns (complies with naming rules in [Variable Definition](./variables.md))
   - Variable extraction and listing
   - Matching with reserved variables

2. Variable Substitution
   - Type-based validation for each variable
   - Variable substitution execution
   - Generation of substitution results

### 2.3 Validator Group

> The validator group is a component specialized in input validation. It ensures type safety and detects errors from invalid inputs early, thereby improving system reliability.

#### 2.3.1 Variable Validator (VariableValidator)

##### Responsibilities

- Variable name format checking (complies with naming rules in [Variable Definition](./variables.md))
- Variable type validation (complies with [Type Definition](./type_of_variables.md))
- Markdown format validation

##### Behavior

1. Variable Name Validation
   - Alphanumeric and underscore only
   - First character must be a letter
   - Case sensitivity
   - Matching with reserved variables

2. Type Validation
   - Path type variable validation
   - Markdown type variable validation
   - Validation based on type definitions

#### 2.3.2 Path Validator (PathValidator)

##### Responsibilities

- File path validation (complies with [Path Validation Rules](./path_validation.md))
- Directory path validation
- Path normalization

##### Behavior

1. Path Validation
   - Existence check (complies with [Path Validation Rules](./path_validation.md))
   - Format checking
   - Normalization processing
   - Security validation (preventing path traversal, etc.)

### 2.4 File Utility (FileUtils)

#### Responsibilities

- File reading and writing
- Path manipulation
- File system operations

#### Behavior

1. File Operations
   - Template file loading
   - Output file writing
   - Path normalization

## 3. Processing Flow

> The processing flow executes in the order of parameter validation → template processing → variable substitution. If an error occurs at any step, processing is immediately interrupted and an error message is returned. This prevents processing continuation in an invalid state.

### 3.1 Parameter Validation Flow

1. Required Parameter Check
   - `template_file` existence verification
   - `variables` existence verification

2. Variable Name Validation
   - Naming rule check (complies with [Variable Definition](./variables.md))
   - Duplicate check
   - Matching with reserved variables

3. Path Validation
   - Template file path validation (complies with [Path Validation Rules](./path_validation.md))
   - Path validation in variables
   - Security validation

### 3.2 Template Processing Flow

1. File Loading
   - Template file loading
   - Encoding verification

2. Markdown Validation
   - Format checking
   - Special character processing

3. Variable Extraction
   - Variable pattern detection (complies with notation in [Variable Definition](./variables.md))
   - Variable list generation
   - Matching with reserved variables

### 3.3 Variable Substitution Flow

1. Type Validation
   - Path type variable validation (complies with [Type Definition](./type_of_variables.md))
   - Markdown type variable validation
   - Reserved variable type checking

2. Substitution Processing
   - Variable substitution
   - Result generation

## 4. Error Handling

> Error handling emphasizes early error detection and appropriate error message provision. When an error occurs, processing is immediately interrupted and specific solutions are presented to the user, thereby improving debugging efficiency.

### 4.1 Error Types

1. Validation Errors
   - Parameter validation errors
   - Variable name validation errors
   - Path validation errors
   - Markdown validation errors

2. File System Errors
   - File read/write errors
   - Path operation errors

### 4.2 Error Handling Policy

1. Immediate Interruption
   - Immediate processing interruption upon error
   - Return error message

2. Error Messages
   - Specific error content
   - Error location identification
   - Solution presentation

## 5. Security Measures

> Security measures are designed based on the principle of least privilege. In particular, by minimizing security risks in path operations and file operations, system safety is ensured.

### 5.1 Path Operations

- Path injection countermeasures (complies with [Path Validation Rules](./path_validation.md))
- Relative path restrictions
- Special character processing
- Directory traversal prevention

### 5.2 File Operations

- Principle of least privilege
- Access permission verification (complies with [Path Validation Rules](./path_validation.md))
- File operation restrictions

## 6. Testing Strategy

> The testing strategy adopts a phased approach from unit testing to integration testing and use case testing. In particular, it emphasizes validation and error handling testing to ensure system reliability.

### 6.1 Test Hierarchy

1. Unit Tests
   - Component functionality testing
   - Validation testing

2. Integration Tests
   - Component interaction testing
   - Error handling testing

3. Use Case Tests
   - Real usage scenario testing
   - Edge case testing

### 6.2 Debugging Features

- Test-specific logger
- Log level control
- Detailed error information
