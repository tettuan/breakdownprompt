#!/bin/bash

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

# Check if there are any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Get the latest commit hash
latest_commit=$(git rev-parse HEAD)

# Check GitHub Actions status for all workflows
echo "Checking GitHub Actions status..."
for workflow in "ci.yml" "version-check.yml"; do
    echo "Checking $workflow..."
    gh run list --workflow=$workflow --limit=1 --json status,conclusion,headSha | jq -e '.[0].status == "completed" and .[0].conclusion == "success" and .[0].headSha == "'$latest_commit'"' > /dev/null

    if [ $? -ne 0 ]; then
        echo "Error: Latest GitHub Actions workflow ($workflow) has not completed successfully."
        echo "Please ensure all tests pass before bumping version."
        exit 1
    fi
done

# Try to get latest version from JSR
echo "Checking latest version from JSR..."
# Get all JSR versions to know what has been published
jsr_versions=$(curl -s https://jsr.io/@tettuan/breakdownprompt/versions | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | sort -V)
latest_jsr_version=$(echo "$jsr_versions" | tail -n 1)

if [ -z "$latest_jsr_version" ]; then
    echo "Warning: Could not determine latest version from JSR, using local version"
    # Read current version from deno.json
    latest_jsr_version=$(deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); console.log(config.version);")
    # If we can't get versions from JSR, assume all tags are published
    jsr_versions=$(git tag -l "v*" | sed 's/^v//' | sort -V)
fi

echo "Latest JSR version: $latest_jsr_version"

# Get all GitHub tags
echo "Checking GitHub tags..."
git fetch --tags
all_tags=$(git tag -l "v*" | sort -V)

# Remove only tags that are newer than latest JSR version
for tag in $all_tags; do
    tag_version=${tag#v}
    # Check if version is newer than latest JSR version
    if [ "$(printf '%s\n%s\n' "$tag_version" "$latest_jsr_version" | sort -V | tail -n 1)" = "$tag_version" ]; then
        echo "Removing tag $tag (newer than latest JSR version $latest_jsr_version)"
        git tag -d "$tag"
        git push origin ":refs/tags/$tag"
    fi
done

# Split version into major.minor.patch
IFS='.' read -r major minor patch <<< "$latest_jsr_version"

# Increment version based on bump type
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

# Show current versions
echo "Current versions:"
echo "deno.json: $(deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); console.log(config.version);")"
echo "mod.ts: $(grep -o 'export const VERSION = "[0-9]\+\.[0-9]\+\.[0-9]\+"' src/mod.ts | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')"

# Create temporary files for atomic updates
temp_deno=$(mktemp)
temp_mod=$(mktemp)

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

# Ask for confirmation before proceeding with version updates
read -p "Do you want to proceed with updating versions to $new_version? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Version bump aborted. No files have been modified."
    rm "$temp_deno" "$temp_mod"
    exit 1
fi

# Apply the changes atomically
mv "$temp_deno" deno.json
mv "$temp_mod" src/mod.ts

# Verify both files have the same version after applying changes
deno_version=$(deno eval "const config = JSON.parse(await Deno.readTextFile('deno.json')); console.log(config.version);")
mod_version=$(grep -o 'export const VERSION = "[0-9]\+\.[0-9]\+\.[0-9]\+"' src/mod.ts | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

if [ "$deno_version" != "$mod_version" ]; then
    echo "Error: Version mismatch detected after applying changes!"
    echo "deno.json version: $deno_version"
    echo "mod.ts version: $mod_version"
    echo "Please fix the version mismatch manually."
    exit 1
fi

echo "Version consistency check passed: both files updated to $new_version"

# Ask for confirmation before proceeding with git operations
read -p "Do you want to proceed with creating git tag v$new_version? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Version bump aborted. Files have been modified but not committed."
    exit 1
fi

# Commit the version changes
git add deno.json src/mod.ts
git commit -m "chore: bump version to $new_version"

# Create and push tag
git tag "v$new_version"
git push origin "v$new_version"

echo "Version bumped to $new_version and tag v$new_version created" 