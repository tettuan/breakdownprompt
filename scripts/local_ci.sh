#!/bin/bash

# Function to enable debug mode
enable_debug() {
    echo "Enabling debug mode..."
    set -x
}

# Function to disable debug mode
disable_debug() {
    set +x
}

# Handle DEBUG environment variable
if [ "${DEBUG:-false}" = "true" ]; then
    echo "Debug mode enabled via DEBUG environment variable"
    enable_debug
else
    disable_debug
fi

# Remove old lockfile
echo "Removing old deno.lock..."
rm -f deno.lock

# Regenerate deno.lock
echo "Regenerating deno.lock..."
if ! deno cache --reload mod.ts; then
    echo "Error: Failed to regenerate deno.lock"
    enable_debug
    exit 1
fi

# Run checks
echo "Running format check..."
if ! deno fmt --check; then
    echo "Error: Format check failed"
    enable_debug
    exit 1
fi

echo "Running lint..."
if ! deno lint; then
    echo "Error: Lint check failed"
    enable_debug
    exit 1
fi

echo "Running tests..."
if ! deno test --allow-env --allow-write --allow-read; then
    echo "Error: Tests failed"
    enable_debug
    exit 1
fi

echo "Local checks completed successfully." 