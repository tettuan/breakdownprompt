#!/bin/bash

# Purpose: Automated version management script for Deno projects
#          - Ensures version consistency between deno.json and src/mod.ts
#          - Handles version bumping (major/minor/patch)
#          - Performs pre-release checks (git status, CI, GitHub Actions)
#          - Manages GitHub tags and JSR version synchronization
#          - Automatically commits and pushes version changes
#
# Usage: ./scripts/bump_version.sh [--major|--minor|--patch]
#        Default: --patch
#
# Flow:
# 1. Version Sync Check
#    - Checks if deno.json and src/mod.ts have matching versions
#    - If mismatch found, updates src/mod.ts to match deno.json
#    - Fails if version sync cannot be achieved
#
# 2. Git Status Check
#    - Ensures no un-staged changes exist
#    - Prevents version bump on dirty working directory
#
# 3. Local CI Check
#    - Runs local_ci.sh to verify code quality
#    - Ensures tests pass before version bump
#
# 4. GitHub Actions Status
#    - Verifies ci.yml and version-check.yml workflows
#    - Ensures all workflows are completed and successful
#
# 5. JSR Version Check
#    - Fetches published versions from JSR
#    - Determines latest released version
#    - Falls back to local version if JSR unavailable
#
# 6. GitHub Tags Cleanup
#    - Fetches all tags from remote
#    - Removes tags that are ahead of latest JSR version
#    - Keeps tags that match published JSR versions
#
# 7. New Version Generation
#    - Increments version based on bump type:
#      * major: X.0.0
#      * minor: x.Y.0
#      * patch: x.y.Z
#
# 8. Version Update
#    - Updates version in both deno.json and src/mod.ts
#    - Uses atomic file operations with temporary files
#    - Shows changes before applying
#
# 9. Version Verification
#    - Verifies both files have the same new version
#    - Ensures version update was successful
#
# 10. Git Commit
#     - Commits version changes with standard message
#     - Includes both deno.json and src/mod.ts
#
# 11. Git Tag
#     - Creates new tag with version (vX.Y.Z)
#
# 12. Push Changes
#     - Pushes commit to main branch
#     - Pushes new tag to remote
#
# Exit Codes:
# 0 - Success
# 1 - Version sync failed
# 1 - Un-staged files exist
# 1 - Local CI failed
# 1 - GitHub Actions not completed
# 1 - Version update failed
# 1 - User aborted

# Default to patch version bump
BUMP_TYPE="patch"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --major)
            BUMP_TYPE="major"
            shift
            ;;
        --minor)
            BUMP_TYPE="minor"
            shift
            ;;
        --patch)
            BUMP_TYPE="patch"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--major|--minor|--patch]"
            exit 1
            ;;
    esac
done

# 1. First, ensure both files have the same version
echo "Checking current versions..."
deno_version=$(deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); console.log(config.version);")
mod_version=$(deno eval "const content = await Deno.readTextFile('mod.ts'); const match = content.match(/export const VERSION = \"([0-9]+\.[0-9]+\.[0-9]+)\"/); console.log(match[1]);")

if [ "$deno_version" != "$mod_version" ]; then
    echo "Version mismatch detected!"
    echo "deno.json version: $deno_version"
    echo "mod.ts version: $mod_version"
    echo "Attempting to sync versions..."
    
    # Create temporary files for atomic updates
    temp_deno=$(mktemp /tmp/deno.XXXXXX)
    temp_mod=$(mktemp /tmp/mod.XXXXXX)
    
    # Ensure temporary files are cleaned up on exit
    trap 'rm -f "$temp_deno" "$temp_mod"' EXIT
    
    # Update version in mod.ts to match deno.json
    deno eval "const content = await Deno.readTextFile('mod.ts'); await Deno.writeTextFile('$temp_mod', content.replace(/export const VERSION = \"[0-9]+\.[0-9]+\.[0-9]+\"/g, 'export const VERSION = \"$deno_version\"'));"
    
    # Show the changes
    echo -e "\nChanges to be made:"
    echo "mod.ts:"
    diff mod.ts "$temp_mod" || true
    
    # Apply the changes atomically
    mv "$temp_mod" mod.ts
    
    # Verify both files have the same version after sync
    mod_version=$(deno eval "const content = await Deno.readTextFile('mod.ts'); const match = content.match(/export const VERSION = \"([0-9]+\.[0-9]+\.[0-9]+)\"/); console.log(match[1]);")
    
    if [ "$deno_version" != "$mod_version" ]; then
        echo "Error: Version sync failed!"
        echo "deno.json version: $deno_version"
        echo "mod.ts version: $mod_version"
        echo "Please fix the version mismatch manually."
        exit 1
    fi
    
    echo "Version sync successful: both files now have version $deno_version"
else
    echo "Version consistency check passed: both files have version $deno_version"
fi

# 2. Check git status for un-staged files
echo "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: You have un-staged files. Please commit or stash them first."
    git status
    exit 1
fi

echo "Git status check passed: no un-staged files"

# 3. Run local CI check
echo "Running local CI checks..."
if ! ./scripts/local_ci.sh; then
    echo "Error: Local CI checks failed. Please fix the issues before bumping version."
    exit 1
fi

echo "Local CI checks passed"

# 4. Check GitHub Actions status
echo "Checking GitHub Actions status..."
for workflow in "ci.yml" "version-check.yml"; do
    echo "Checking $workflow..."
    gh run list --workflow=$workflow --limit=1 --json status,conclusion | jq -e '.[0].status == "completed" and .[0].conclusion == "success"' > /dev/null

    if [ $? -ne 0 ]; then
        echo "Error: Latest GitHub Actions workflow ($workflow) is either running or failed."
        echo "Please ensure all tests pass before bumping version."
        exit 1
    fi
done

# 5. Check JSR versions and get latest released version
echo "Checking latest version from JSR..."
jsr_versions=$(curl -s https://jsr.io/@tettuan/breakdownprompt/versions | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | sort -V)
latest_jsr_version=$(echo "$jsr_versions" | tail -n 1)

if [ -z "$latest_jsr_version" ]; then
    echo "Warning: Could not determine latest version from JSR, using local version"
    latest_jsr_version=$deno_version
    jsr_versions=$latest_jsr_version
fi

echo "Latest JSR version: $latest_jsr_version"

# 6. Check and handle GitHub tags
echo "Checking GitHub tags..."
git fetch --tags
all_tags=$(git tag -l "v*" | sort -V)

for tag in $all_tags; do
    tag_version=${tag#v}
    # If tag version is ahead of latest JSR version, remove it
    if [ "$(printf '%s\n%s\n' "$tag_version" "$latest_jsr_version" | sort -V | tail -n 1)" = "$tag_version" ] && [ "$tag_version" != "$latest_jsr_version" ]; then
        echo "Removing tag $tag (ahead of latest JSR version $latest_jsr_version)"
        git tag -d "$tag"
        git push origin ":refs/tags/$tag"
    fi
done

# 7. Generate new version number
IFS='.' read -r major minor patch <<< "$latest_jsr_version"

case $BUMP_TYPE in
    "major")
        new_major=$((major + 1))
        new_version="$new_major.0.0"
        ;;
    "minor")
        new_minor=$((minor + 1))
        new_version="$major.$new_minor.0"
        ;;
    "patch")
        new_patch=$((patch + 1))
        new_version="$major.$minor.$new_patch"
        ;;
esac

echo "New version: $new_version"

# 8. Set new version number to both files
# Create temporary files for atomic updates
temp_deno=$(mktemp /tmp/deno.XXXXXX)
temp_mod=$(mktemp /tmp/mod.XXXXXX)

# Ensure temporary files are cleaned up on exit
trap 'rm -f "$temp_deno" "$temp_mod"' EXIT

# Update version in deno.json
deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); config.version = '$new_version'; await Deno.writeTextFile('$temp_deno', JSON.stringify(config, null, 2).trimEnd() + '\n');"

# Update version in mod.ts
deno eval "const content = await Deno.readTextFile('mod.ts'); await Deno.writeTextFile('$temp_mod', content.replace(/export const VERSION = \"[0-9]+\.[0-9]+\.[0-9]+\"/g, 'export const VERSION = \"$new_version\"'));"

# Show the changes
echo -e "\nChanges to be made:"
echo "deno.json:"
diff deno.json "$temp_deno" || true
echo -e "\nmod.ts:"
diff mod.ts "$temp_mod" || true

# Apply the changes atomically
mv "$temp_deno" deno.json
mv "$temp_mod" mod.ts

# 9. Verify both files have the same new version
deno_version=$(deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); console.log(config.version);")
mod_version=$(deno eval "const content = await Deno.readTextFile('mod.ts'); const match = content.match(/export const VERSION = \"([0-9]+\.[0-9]+\.[0-9]+)\"/); console.log(match[1]);")

if [ "$deno_version" != "$mod_version" ] || [ "$deno_version" != "$new_version" ]; then
    echo "Error: Version mismatch detected after applying changes!"
    echo "Expected version: $new_version"
    echo "deno.json version: $deno_version"
    echo "mod.ts version: $mod_version"
    echo "Please fix the version mismatch manually."
    exit 1
fi

echo "Version consistency check passed: both files updated to $new_version"

# 10. Commit both files in the same commit
git add deno.json mod.ts
git commit -m "chore: bump version to $new_version"

# 11. Create and push tag
git tag "v$new_version"

# 12. Push changes and tag
git push origin main
git push origin "v$new_version"

echo "Version bumped to $new_version and tag v$new_version created" 