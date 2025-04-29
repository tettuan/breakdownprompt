# Path Validation Rules

## Overview

This document describes the path validation rules and error messages used in the BreakdownPrompt system. These rules ensure secure and consistent handling of file and directory paths throughout the application.

## Path Validation Rules

### Basic Rules

1. **Empty Paths**
   - Empty paths are not allowed
   - Error message: `"Path cannot be empty"`

2. **Character Set**
   - Allowed characters:
     - Alphanumeric characters (`a-zA-Z0-9`)
     - Forward slash (`/`)
     - Hyphen (`-`)
     - Underscore (`_`)
     - Dot (`.`)
   - Error message: `"Invalid path: Contains invalid characters"`

3. **Path Traversal Prevention**
   - Directory traversal (`..`) is not allowed
   - Error message: `"Invalid path: Contains directory traversal"`

4. **Absolute Paths**
   - Absolute paths (starting with `/`) are generally not allowed
   - Exception: Paths under `/tmp` directory are allowed
   - Error message: `"Invalid path: Absolute paths are not allowed"`

### File Path Specific Rules

1. **File Existence**
   - Path must point to an existing file
   - Error message: `"Path is not a file: {path}"`

2. **File Accessibility**
   - File must be readable
   - Error message: `"File is not readable: {path}"`

### Directory Path Specific Rules

1. **Directory Existence**
   - Path must point to an existing directory
   - Error message: `"Path is not a directory: {path}"`

2. **Directory Accessibility**
   - Directory must be writable
   - Error message: `"Directory is not writable: {path}"`

## Examples

### Valid Paths

```typescript
// File paths
"test.txt";
"path/to/file.txt";
"./file.txt";
"/tmp/test/file.txt";

// Directory paths
"test_dir";
"path/to/dir";
"./dir";
"/tmp/test/dir";
```

### Invalid Paths

```typescript
// File paths
""; // Empty path
"../file.txt"; // Directory traversal
"/absolute/path.txt"; // Absolute path
"path with spaces.txt"; // Contains spaces
"file@name.txt"; // Contains special characters

// Directory paths
""; // Empty path
"../dir"; // Directory traversal
"/absolute/dir"; // Absolute path
"dir with spaces"; // Contains spaces
"dir@name"; // Contains special characters
```

## Implementation Details

The path validation is implemented through several classes:

1. `PathValidator` - Core path validation logic
2. `VariableValidator` - Variable-specific path validation
3. `DefaultVariableValidator` - Default implementation of path validation

### Usage Example

```typescript
import { PathValidator } from "@tettuan/breakdownprompt/validation";

const validator = new PathValidator();

// Validate file path
const isValidFile = validator.validateFilePath("test.txt");

// Validate directory path
const isValidDir = validator.validateDirectoryPath("test_dir");
```

## Error Handling

All path validation errors are thrown as `ValidationError` with descriptive messages. The error messages are designed to be clear and actionable, helping users understand why their path was rejected and how to fix it.

### Common Error Scenarios

1. **Invalid Characters**
   ```typescript
   try {
     validator.validateFilePath("file@name.txt");
   } catch (error) {
     // error.message: "Invalid path: Contains invalid characters"
   }
   ```

2. **Directory Traversal**
   ```typescript
   try {
     validator.validateFilePath("../file.txt");
   } catch (error) {
     // error.message: "Invalid path: Contains directory traversal"
   }
   ```

3. **Absolute Path**
   ```typescript
   try {
     validator.validateFilePath("/etc/passwd");
   } catch (error) {
     // error.message: "Invalid path: Absolute paths are not allowed"
   }
   ```

## Security Considerations

1. **Path Traversal Prevention**
   - Strict validation of path components
   - Rejection of any path containing `..`
   - Normalization of paths before validation

2. **File System Access**
   - Validation of file existence and permissions
   - Prevention of access to system directories
   - Restriction of absolute paths

3. **Input Validation**
   - Strict character set validation
   - Length validation
   - Type checking
