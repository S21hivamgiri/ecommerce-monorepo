# This script uses bazel-diff to compare Bazel target graphs between 
# two Git commits (base-ref and head-ref)

#!/usr/bin/env bash
# Uses bazel-diff (https://github.com/Tinder/bazel-diff) to work out which
# deployable service targets are actually impacted between two git refs,
# instead of rebuilding all 14 services on every push.
#
# Usage: tools/detect-changed-services.sh <base-ref> <head-ref>
# Prints one service name per line, e.g.:
#   auth-service
#   catalog-service

# set -e: Exit immediately if any command exits with a non-zero status.
# set -u: Treat unset variables as an error and exit immediately.
# set -o pipefail: Return the exit code of the last command in a pipeline that failed (non-zero).
set -euo pipefail

# Assigns the first CLI parameter ($1) to BASE_REF and the second ($2) to HEAD_REF.
# The :? construct prints the "usage..." error message and exits if either argument is missing.
BASE_REF="${1:?usage: detect-changed-services.sh <base-ref> <head-ref>}"
HEAD_REF="${2:?usage: detect-changed-services.sh <base-ref> <head-ref>}"

# BAZEL_BIN: Finds and stores the absolute path to the local bazel executable.
# WORKDIR: Saves the current working directory path.
# TMP: Creates a unique temporary directory (e.g., /tmp/tmp.12345) to hold temporary checkout files and generated JSONs.
BAZEL_BIN="$(command -v bazel)"
WORKDIR="$(pwd)"
TMP="$(mktemp -d)"

# Sets an exit signal handler (EXIT). When the script finshes (successfully or on failure), it automatu=ically cleans up the temporary directory and removes the created Git worktree.
trap 'rm -rf "$TMP"; git worktree remove --force "$TMP/base-checkout" 2>/dev/null || true' EXIT

# Hash the target graph as of the base ref, in an isolated worktree so this
# doesn't disturb the checkout the rest of the job is using.
# Creates a temporary islated copy (a Git worktree) of your repoitory at the BASE_REF commit inside $TMP/base-checkout, leaving your active working directory untouched.
git worktree add "$TMP/base-checkout" "$BASE_REF" > /dev/null
# Runs commands inside a subshell so directory navigation (cd) doesn't affect the parent script.
#bazel-diff generate-hashes: Analyzes the Bazel target graph at the base commit and exports a JSON map (starting_hashes.json) of all targets and their content hashes.

(
  cd "$TMP/base-checkout"
  bazel-diff generate-hashes -w "$TMP/base-checkout" -b "$BAZEL_BIN" "$TMP/starting_hashes.json"
)

# Hash the target graph as of the head ref (the current checkout).
#Ensures the active workspace is on the HEAD_REF commit (suppressing standard output and error messages).
git checkout "$HEAD_REF" > /dev/null 2>&1 || true

# Generates a second JSON hash map (final_hashes.json) representing the state of Bazel targets at the target HEAD_REF commit.
bazel-diff generate-hashes -w "$WORKDIR" -b "$BAZEL_BIN" "$TMP/final_hashes.json"

# Compares starting_hashes.json against final_hashes.json.
#Writes every Bazel target label affected by code changes into impacted_targets.txt (e.g., //services/auth-service:auth_service_deploy.jar).
bazel-diff get-impacted-targets \
  -sh "$TMP/starting_hashes.json" \
  -fh "$TMP/final_hashes.json" \
  -o "$TMP/impacted_targets.txt"

# Reduce target labels down to bare service names the Docker/Helm matrix
# already understands. Adjust this pattern as target names change.
# grep -E ...: Filters the file to keep only deployable targets (matching deploy JARs, service names, or gateway).
# sed -E ...: Converts raw Bazel label paths (e.g., //services/auth-service:auth_service_deploy.jar) down into plain service names (auth-service or gateway).
# sort -u: Removes duplicate names and prints the unique list of impacted services to stdout.
grep -E '_deploy\.jar$|_service$|^//gateway:gateway$' "$TMP/impacted_targets.txt" \
  | sed -E 's#^//services/([a-z-]+):.*#\1#; s#^//gateway:gateway$#gateway#' \
  | sort -u
