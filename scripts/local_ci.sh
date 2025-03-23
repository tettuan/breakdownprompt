#!/bin/bash

# Remove old lockfile
echo "Removing old deno.lock..."
rm -f deno.lock

# Regenerate deno.lock
echo "Regenerating deno.lock..."
deno cache --reload mod.ts

# Run checks
echo "Running format check..."
deno fmt --check

echo "Running lint..."
deno lint

echo "Running tests..."
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read

echo "Local checks completed successfully." 