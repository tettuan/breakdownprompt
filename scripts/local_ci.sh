#!/bin/bash

# ============================================================================
# local_ci.sh
#
# Purpose:
#   - Run all Deno tests in the project with strict permissions and debug logging.
#   - Ensure all tests pass before running formatting and lint checks.
#   - Mimics the CI flow locally to catch issues before commit, push, or merge.
#
# Intent:
#   - Enforce Deno's security model by explicitly specifying required permissions.
#   - Provide clear debug output for troubleshooting test failures.
#   - Automatically regenerate the lockfile to ensure dependency consistency.
#   - Recursively discover and run all *_test.ts files in the tests/ directory.
#   - Only proceed to lint and format checks if all tests pass.
#   - Exit immediately on any error, with helpful debug output if DEBUG=true.
#
# Type Checking Strategy:
#   - Two-phase type checking for optimal performance and error detection:
#     1. Batch Mode: Quick check of all TypeScript files
#        - All files are checked in a single deno check command
#        - Fast feedback for clean codebases
#     2. Individual Mode: Detailed check on batch failure
#        - Automatically triggered when batch check fails
#        - Checks each file individually to pinpoint errors
#        - Provides specific error messages for each file
#
# Error Handling Strategy:
#   - Two-phase test execution for better error diagnosis:
#     1. Normal Mode: Quick run to identify failing tests
#        - Minimal output for successful tests
#        - Fast feedback loop for developers
#     2. Debug Mode: Detailed investigation of failures
#        - Automatically triggered for failing tests
#        - Provides comprehensive error context
#        - Includes guidance for systematic error resolution
#   
#   This approach helps developers:
#   - Quickly identify the exact point of failure
#   - Get detailed context only when needed
#   - Follow a structured approach to fixing issues
#   - Maintain test sequence awareness
#   - Add more test cases if root cause is unclear
#
# Usage:
#   bash scripts/local_ci.sh
#   # or, with debug output:
#   DEBUG=true bash scripts/local_ci.sh
#
# Maintenance:
#   - If you encounter an error:
#       1. Run with DEBUG=true to get detailed output:
#            DEBUG=true bash scripts/local_ci.sh
#       2. Review the error message and the failing test file.
#       3. Fix the test or the application code as needed, following the order:
#            Initial loading → Use case entry → Conversion → Output → Integration → Edge case
#       4. Re-run this script until all checks pass.
#   - The script expects Deno test files to be named *_test.ts and located under tests/.
#   - Permissions are set as per Deno best practices: all flags precede the test file(s).
#   - For more details, see project rules and documentation.
#
# This script is working as intended and follows Deno and project conventions.
# ============================================================================

# Function to enable debug mode
enable_debug() {
    echo "
===============================================================================
>>> SWITCHING TO DEBUG MODE <<<
==============================================================================="
    set -x
}

# Function to disable debug mode
disable_debug() {
    set +x
    echo "
===============================================================================
>>> DEBUG MODE DISABLED <<<
==============================================================================="
}

# Function to handle permission errors
handle_permission_error() {
    local test_file=$1
    local error_message=$2

    if [[ $error_message == *"Requires run access"* ]]; then
        echo "
===============================================================================
>>> PERMISSION ERROR DETECTED - RETRYING WITH --allow-run <<<
===============================================================================
Error: Missing run permission in $test_file
Adding --allow-run flag and retrying..."
        if ! LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read --allow-run "$test_file"; then
            handle_error "$test_file" "Test failed even with --allow-run permission" "true"
        fi
        return 0
    fi
    return 1
}

# Function to handle errors
handle_error() {
    local test_file=$1
    local error_message=$2
    local is_debug=$3

    # Try to handle permission errors first
    if handle_permission_error "$test_file" "$error_message"; then
        return 0
    fi

    if [ "$is_debug" = "true" ]; then
        echo "
===============================================================================
>>> ERROR IN DEBUG MODE <<<
===============================================================================
Error: $error_message in $test_file
Note: Remaining tests have been interrupted due to this failure.
Tests are executed sequentially to maintain dependency order and consistency.

Please:
  1. Fix errors one at a time, starting with this test
  2. Run tests for the fixed component before moving to the next error
  3. If root cause is unclear, consider adding more test cases
==============================================================================="
    else
        echo "
===============================================================================
>>> ERROR DETECTED - RETRYING IN DEBUG MODE <<<
===============================================================================
Error: $error_message in $test_file
Retrying with debug mode..."
        if ! LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read --allow-run "$test_file"; then
            handle_error "$test_file" "Test failed in debug mode" "true"
        fi
    fi
    exit 1
}

# Function to handle type check errors
handle_type_error() {
    local error_type=$1
    local error_message=$2

    echo "
===============================================================================
>>> TYPE CHECK FAILED: $error_type <<<
===============================================================================
Please review:
1. Project rules and specifications in docs/ directory
2. Deno's type system documentation at https://deno.land/manual/typescript
3. External library documentation for any imported packages

Remember to:
- Check type definitions in your code
- Verify type compatibility with external dependencies
- Review TypeScript configuration in deno.json

Error details: $error_message
==============================================================================="
    exit 1
}

# Function to handle format errors
handle_format_error() {
    local error_message=$1

    echo "
===============================================================================
>>> FORMAT CHECK FAILED <<<
===============================================================================
Please review:
1. Project formatting rules in docs/ directory
2. Deno's style guide at https://deno.land/manual/tools/formatter
3. Format settings in deno.json

To auto-fix formatting issues:
  $ deno fmt

Remember to:
- Format checks are applied to all supported files (TypeScript, JavaScript, Markdown, YAML, etc.)
- Check for any custom formatting rules in the project
- Ensure your editor's formatting settings align with the project

Error details: $error_message
==============================================================================="
    exit 1
}

# Function to handle lint errors
handle_lint_error() {
    local error_message=$1

    echo "
===============================================================================
>>> LINT CHECK FAILED <<<
===============================================================================
Please review:
1. Project linting rules in docs/ directory
2. Deno's linting rules at https://deno.land/manual/tools/linter
3. Lint configuration in deno.json

Remember to:
- Check for common code style issues
- Review best practices for Deno development
- Verify any custom lint rules specific to the project

Error details: $error_message
==============================================================================="
    exit 1
}

# Function to handle JSR type check errors
handle_jsr_error() {
    local error_output=$1
    
    # Check if error is due to uncommitted changes
    if echo "$error_output" | grep -q "Aborting due to uncommitted changes"; then
        echo "
===============================================================================
>>> INTERNAL ERROR: JSR CHECK CONFIGURATION <<<
===============================================================================
Error: JSR check failed with uncommitted changes despite --allow-dirty flag

This is likely a bug in the CI script. Please:
1. Report this issue
2. As a temporary workaround, commit your changes

Technical details:
- Command used: npx jsr publish --dry-run --allow-dirty
- Error: $error_output
==============================================================================="
        exit 1
    fi

    # Handle actual type check errors
    echo "
===============================================================================
>>> JSR TYPE CHECK FAILED <<<
===============================================================================
Error: JSR publish dry-run failed

Common causes:
1. Version constraints in import statements
2. Package name format in deno.json
3. File paths and naming conventions
4. Type definition errors

Next steps:
1. Review type definitions in your code
2. Check import statement versions
3. Verify package.json configuration

Error details: $error_output

For more details:
- JSR publishing guide: https://jsr.io/docs/publishing
- Project documentation in docs/ directory
==============================================================================="
    exit 1
}

# Handle DEBUG environment variable
if [ "${DEBUG:-false}" = "true" ]; then
    echo "
===============================================================================
>>> DEBUG MODE ENABLED VIA ENVIRONMENT VARIABLE <<<
==============================================================================="
    enable_debug
else
    disable_debug
fi

# Remove old lockfile and regenerate
echo "Removing old deno.lock..."
rm -f deno.lock

echo "Regenerating deno.lock..."
if ! deno cache --reload mod.ts; then
    handle_error "mod.ts" "Failed to regenerate deno.lock" "false"
fi

# Comprehensive type checking
echo "Running comprehensive type checks..."

# Check main entry points
echo "Checking entry points..."
for entry_point in mod.ts cli.ts main.ts; do
    if [ -f "$entry_point" ]; then
        if ! deno check "$entry_point"; then
            handle_error "$entry_point" "Type check failed" "false"
        fi
    fi
done

# First phase: Batch check all TypeScript files
echo "Checking library files (batch mode)..."
ts_files=$(find src -name "*.ts" -not -name "*.test.ts")
if ! deno check $ts_files; then
    echo "
===============================================================================
>>> BATCH CHECK FAILED - SWITCHING TO INDIVIDUAL CHECKS <<<
==============================================================================="
    # Second phase: Individual check on failure
    echo "Checking library files (individual mode)..."
    echo "$ts_files" | while read -r file; do
        if ! deno check "$file"; then
            handle_error "$file" "Type check failed" "false"
        fi
    done
fi

# Try JSR type check with --allow-dirty if available
echo "Running JSR type check..."
if ! error_output=$(npx jsr publish --dry-run --allow-dirty 2>&1); then
    handle_jsr_error "$error_output"
fi

# Function to run a single test file
run_single_test() {
    local test_file=$1
    local is_debug=${2:-false}
    local error_output
    
    if [ "$is_debug" = "true" ]; then
        echo "
===============================================================================
>>> RUNNING TEST IN DEBUG MODE: $test_file <<<
==============================================================================="
        if ! error_output=$(LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read --allow-run "$test_file" 2>&1); then
            handle_error "$test_file" "$error_output" "true"
            return 1
        fi
    else
        echo "Running test: $test_file"
        if ! error_output=$(deno test --allow-env --allow-write --allow-read --allow-run "$test_file" 2>&1); then
            handle_error "$test_file" "$error_output" "false"
            return 1
        fi
        echo "✓ $test_file"
    fi
    return 0
}

# Function to run all tests with all permissions
run_all_tests() {
    local is_debug=${1:-false}
    local error_output
    
    if [ "$is_debug" = "true" ]; then
        echo "
===============================================================================
>>> RUNNING ALL TESTS IN DEBUG MODE WITH ALL PERMISSIONS <<<
==============================================================================="
        if ! error_output=$(LOG_LEVEL=debug deno test -A 2>&1); then
            handle_error "all tests" "$error_output" "true"
            return 1
        fi
    else
        echo "Running all tests with all permissions..."
        if ! error_output=$(deno test -A 2>&1); then
            handle_error "all tests" "$error_output" "false"
            return 1
        fi
        echo "✓ All tests passed with all permissions"
    fi
    return 0
}

# Function to process tests in a directory
process_test_directory() {
    local dir=$1
    local is_debug=${2:-false}
    local test_count=0
    local error_count=0
    
    echo "Processing directory: $dir"
    
    # First process direct test files in sorted order
    for test_file in $(find "$dir" -maxdepth 1 -name "*_test.ts" | sort); do
        if [ -f "$test_file" ]; then
            ((test_count++))
            if ! run_single_test "$test_file" "$is_debug"; then
                ((error_count++))
                return 1
            fi
        fi
    done
    
    # Then process subdirectories in sorted order
    for subdir in $(find "$dir" -mindepth 1 -maxdepth 1 -type d | sort); do
        if ! process_test_directory "$subdir" "$is_debug"; then
            return 1
        fi
    done
    
    return 0
}

# Main execution flow
echo "Starting test execution..."

# Process all tests hierarchically
if ! process_test_directory "tests" "${DEBUG:-false}"; then
    echo "Test execution stopped due to failure."
    exit 1
fi

# ここで全テスト通過後にまとめて全テスト実行
echo "All individual tests passed. Running all tests with all permissions..."
if ! run_all_tests "${DEBUG:-false}"; then
    echo "Test execution stopped due to failure in all-permissions test."
    exit 1
fi

echo "All tests passed. Running type check..."
if ! deno check mod.ts; then
    handle_type_error "mod.ts" "$(deno check mod.ts 2>&1)"
fi

echo "Running JSR type check..."
if ! error_output=$(npx jsr publish --dry-run --allow-dirty 2>&1); then
    handle_jsr_error "$error_output"
fi

echo "Running format check..."
if ! deno fmt --check; then
    echo "
===============================================================================
>>> FORMAT CHECK FAILED <<<
===============================================================================
Please review:
1. Project formatting rules in docs/ directory
2. Deno's style guide at https://deno.land/manual/tools/formatter
3. Format settings in deno.json

To auto-fix formatting issues:
  $ deno fmt

Remember to:
- Format checks are applied to all supported files (TypeScript, JavaScript, Markdown, YAML, etc.)
- Check for any custom formatting rules in the project
- Ensure your editor's formatting settings align with the project

Error details: $(deno fmt --check 2>&1)
==============================================================================="
    handle_format_error "$(deno fmt --check 2>&1)"
fi

echo "Running lint..."
if ! deno lint; then
    handle_lint_error "$(deno lint 2>&1)"
fi

echo "✓ Local checks completed successfully." 