# Testing

## Debug Mode

### Debug Mode in local_ci.sh

The `local_ci.sh` script can be controlled in debug mode using the following methods:

1. Normal execution (without debug mode):

```bash
./scripts/local_ci.sh
```

2. Execution with debug mode:

```bash
DEBUG=true ./scripts/local_ci.sh
```

Debug mode behavior:

- Debug mode is disabled by default
- When `DEBUG=true` is specified, debug mode is enabled from the start of the script
- Debug mode is automatically enabled in the following error cases:
  - deno.lock regeneration failure
  - Format check failure
  - Lint check failure
  - Test failure

# Test Hierarchy Structure

```
tests/
├── unit/                    # Unit tests
│   ├── core/               # Core component tests
│   │   ├── prompt_manager_test.ts
│   │   ├── prompt_generator_test.ts
│   │   └── variable_replacer_test.ts
│   ├── validation/         # Validation related tests
│   │   ├── path_validator_test.ts
│   │   ├── markdown_validator_test.ts
│   │   └── schema_validator_test.ts
│   └── utils/             # Utility tests
│       ├── logger_test.ts
│       └── file_utils_test.ts
│
├── integration/            # Integration tests
│   ├── prompt_flow_test.ts    # Prompt processing flow
│   ├── variable_chain_test.ts # Variable chain processing
│   └── template_link_test.ts  # Template integration
│
├── system/                # System tests
│   ├── end_to_end_test.ts    # End-to-end
│   └── error_handling_test.ts # Error handling
│
├── security/              # Security tests
│   ├── path_injection_test.ts # Path injection
│   ├── file_access_test.ts   # File access
│   └── input_validation_test.ts # Input validation
│
└── fixtures/              # Test data
    ├── input/            # Input data
    │   ├── basic.md
    │   ├── structured.md
    │   └── invalid/
    ├── output/           # Expected output
    │   ├── basic_expected.md
    │   └── structured_expected.md
    ├── schema/           # Schema definitions
    │   └── test_schema.json
    └── templates/        # Templates
        ├── basic.md
        └── structured.md
```

## Test Hierarchy Explanation

### 1. Unit Tests (unit/)

- Independent functionality testing of each component
- Interface implementation verification
- Edge case validation

### 2. Integration Tests (integration/)

- Component interaction testing
- Data flow verification
- Error propagation confirmation

### 3. System Tests (system/)

- End-to-end use case testing
- Real-world operation scenario validation

### 4. Security Tests (security/)

- Path injection prevention
- File access control
- Input validation

### 5. Test Fixtures (fixtures/)

- Test data management
- Input/output samples
- Schema definitions
- Template examples

# Error Messages

- Define application test messages as ENUMs
- When verifying error messages in tests, use the same ENUM message when expecting the same result
  - When verifying that error messages are different, specify different messages in the test
