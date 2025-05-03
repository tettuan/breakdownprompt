#!/bin/bash

# Purpose: Bump version number in deno.json and src/mod.ts, ensuring version consistency
#          and proper handling of GitHub tags and JSR releases.
#
# Flow:
# 1. Version Sync Check
#    - Check if deno.json and src/mod.ts have the same version
#    - Exit if versions don't match
#
# 2. Git Status Check
#    - Check if there are any un-staged files
#    - Exit if un-staged files exist
#
# 3. GitHub Actions Status
#    - Check if all workflows (ci.yml, version-check.yml) are completed and successful
#    - Exit if any workflow is running or failed
#
# 4. JSR Version Check
#    - Get all published versions from JSR
#    - Determine latest released version
#    - Use local version if JSR is unavailable
#
# 5. GitHub Tags Handling
#    - Fetch all tags from remote
#    - Remove tags that are ahead of latest JSR version
#    - Keep tags that match JSR versions
#
# 6. New Version Generation
#    - Generate new version based on bump type (major/minor/patch)
#    - Increment appropriate version number
#
# 7. Version Update
#    - Create temporary files for atomic updates
#    - Update version in both deno.json and src/mod.ts
#    - Show changes before applying
#    - Ask for confirmation
#
# 8. Version Verification
#    - Verify both files have the same new version
#    - Exit if versions don't match
#
# 9. Git Commit
#    - Commit both files in a single commit
#    - Use standard commit message format
#
# 10. Git Tag
#     - Create tag with new version
#
# 11. Push Changes
#     - Push commit to main branch
#     - Push tag to remote
#
# Exit Codes:
# 0 - Success
# 1 - Version mismatch
# 1 - Un-staged files exist
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
mod_version=$(grep -o 'export const VERSION = \"[0-9]\+\.[0-9]\+\.[0-9]\+\"' src/mod.ts | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

if [ "$deno_version" != "$mod_version" ]; then
    echo "Error: Version mismatch detected!"
    echo "deno.json version: $deno_version"
    echo "mod.ts version: $mod_version"
    echo "Please fix the version mismatch first."
    exit 1
fi

echo "Version consistency check passed: both files have version $deno_version"

# 2. Check git status for un-staged files
echo "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: You have un-staged files. Please commit or stash them first."
    git status
    exit 1
fi

echo "Git status check passed: no un-staged files"

# 3. Check GitHub Actions status
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

# 4. Check JSR versions and get latest released version
echo "Checking latest version from JSR..."
jsr_versions=$(curl -s https://jsr.io/@tettuan/breakdownprompt/versions | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | sort -V)
latest_jsr_version=$(echo "$jsr_versions" | tail -n 1)

if [ -z "$latest_jsr_version" ]; then
    echo "Warning: Could not determine latest version from JSR, using local version"
    latest_jsr_version=$deno_version
    jsr_versions=$latest_jsr_version
fi

echo "Latest JSR version: $latest_jsr_version"

# 5. Check and handle GitHub tags
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

# 6. Generate new version number
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

# 7. Set new version number to both files
# Create temporary files for atomic updates
temp_deno=$(mktemp /tmp/deno.XXXXXX)
temp_mod=$(mktemp /tmp/mod.XXXXXX)

# Ensure temporary files are cleaned up on exit
trap 'rm -f "$temp_deno" "$temp_mod"' EXIT

# Update version in deno.json
deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); config.version = '$new_version'; await Deno.writeTextFile('$temp_deno', JSON.stringify(config, null, 2).trimEnd() + '\n');"

# Update version in src/mod.ts
sed "s/export const VERSION = \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/export const VERSION = \"$new_version\"/" src/mod.ts > "$temp_mod"

# Show the changes
echo -e "\nChanges to be made:"
echo "deno.json:"
diff deno.json "$temp_deno" || true
echo -e "\nmod.ts:"
diff src/mod.ts "$temp_mod" || true

# Ask for confirmation before proceeding
read -p "Do you want to proceed with updating versions to $new_version? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Version bump aborted. No files have been modified."
    exit 1
fi

# Apply the changes atomically
mv "$temp_deno" deno.json
mv "$temp_mod" src/mod.ts

# 8. Verify both files have the same new version
deno_version=$(deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); console.log(config.version);")
mod_version=$(grep -o 'export const VERSION = \"[0-9]\+\.[0-9]\+\.[0-9]\+\"' src/mod.ts | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

if [ "$deno_version" != "$mod_version" ] || [ "$deno_version" != "$new_version" ]; then
    echo "Error: Version mismatch detected after applying changes!"
    echo "Expected version: $new_version"
    echo "deno.json version: $deno_version"
    echo "mod.ts version: $mod_version"
    echo "Please fix the version mismatch manually."
    exit 1
fi

echo "Version consistency check passed: both files updated to $new_version"

# 9. Commit both files in the same commit
git add deno.json src/mod.ts
git commit -m "chore: bump version to $new_version"

# 10. Create and push tag
git tag "v$new_version"

# 11. Push changes and tag
git push origin main
git push origin "v$new_version"

echo "Version bumped to $new_version and tag v$new_version created" 