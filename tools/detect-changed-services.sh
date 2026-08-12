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

# Reduce target labels down to bare service names the Docker/Helm matrix
# already understands. Adjust this pattern as target names change.
# grep -E ...: Filters the file to keep only deployable targets (matching deploy JARs, service names, or gateway).
# sed -E ...: Converts raw Bazel label paths (e.g., //services/auth-service:auth_service_deploy.jar) down into plain service names (auth-service or gateway).
# sort -u: Removes duplicate names and prints the unique list of impacted services to stdout.
git diff --name-only "$BASE_REF" "$HEAD_REF" \
  | sed -nE '
      s#^services/([a-z0-9-]+)/.*#\1#p;
      s#^gateway(/.*)?$#gateway#p
    ' \
  | sort -u
