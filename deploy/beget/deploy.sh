#!/usr/bin/env bash

set -Eeuo pipefail

readonly ARTIFACT_DIR="${1:-.beget-artifact}"

fail() {
  printf 'Deployment error: %s\n' "$*" >&2
  exit 1
}

require_variable() {
  local name="$1"
  [[ -n "${!name:-}" ]] || fail "required CI/CD variable ${name} is missing"
}

require_variable BEGET_SSH_HOST
require_variable BEGET_SSH_USER
require_variable BEGET_SSH_PORT
require_variable BEGET_DEPLOY_PATH
require_variable BEGET_HEALTHCHECK_URL
require_variable SSH_PRIVATE_KEY
require_variable SSH_KNOWN_HOSTS
require_variable CI_COMMIT_SHA

[[ "$BEGET_SSH_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || fail 'BEGET_SSH_HOST contains unsupported characters'
[[ "$BEGET_SSH_USER" =~ ^[A-Za-z0-9_-]+$ ]] || fail 'BEGET_SSH_USER contains unsupported characters'
[[ "$BEGET_SSH_PORT" =~ ^[0-9]{1,5}$ ]] || fail 'BEGET_SSH_PORT must be a number from 1 to 65535'
(( BEGET_SSH_PORT >= 1 && BEGET_SSH_PORT <= 65535 )) || fail 'BEGET_SSH_PORT must be a number from 1 to 65535'
[[ "$BEGET_HEALTHCHECK_URL" =~ ^https://[A-Za-z0-9.-]+(:[0-9]+)?/[^[:space:]]*$ ]] ||
  fail 'BEGET_HEALTHCHECK_URL must be an HTTPS URL without whitespace'
[[ "$CI_COMMIT_SHA" =~ ^[0-9a-f]{40}$ ]] || fail 'CI_COMMIT_SHA must be a full Git commit SHA'

# A Beget shared-hosting home has the form /home/<shard>/<account>. Requiring
# two additional path components makes broad rsync --delete targets impossible.
[[ "$BEGET_DEPLOY_PATH" =~ ^/home/[a-z]/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+(/[A-Za-z0-9._-]+)+$ ]] ||
  fail 'BEGET_DEPLOY_PATH must look like /home/u/account/site/app'
[[ "$BEGET_DEPLOY_PATH" != *'/../'* && "$BEGET_DEPLOY_PATH" != *'/./'* && "$BEGET_DEPLOY_PATH" != *'//'* ]] ||
  fail 'BEGET_DEPLOY_PATH must be canonical and cannot contain dot segments'

[[ -d "$ARTIFACT_DIR" ]] || fail "artifact directory does not exist: ${ARTIFACT_DIR}"
[[ -f "$ARTIFACT_DIR/server.js" ]] || fail "standalone artifact has no server.js: ${ARTIFACT_DIR}"
[[ -f "$SSH_PRIVATE_KEY" ]] || fail 'SSH_PRIVATE_KEY must be a file-type CI/CD variable'
[[ -f "$SSH_KNOWN_HOSTS" ]] || fail 'SSH_KNOWN_HOSTS must be a file-type CI/CD variable'

install -d -m 700 "$HOME/.ssh"
install -m 600 "$SSH_KNOWN_HOSTS" "$HOME/.ssh/known_hosts"
chmod 400 "$SSH_PRIVATE_KEY"

eval "$(ssh-agent -s)" >/dev/null
trap 'ssh-agent -k >/dev/null 2>&1 || true' EXIT
ssh-add "$SSH_PRIVATE_KEY" >/dev/null

readonly SSH_TARGET="${BEGET_SSH_USER}@${BEGET_SSH_HOST}"
SSH_OPTIONS=(
  -p "$BEGET_SSH_PORT"
  -o BatchMode=yes
  -o StrictHostKeyChecking=yes
)

remote_home="$(ssh "${SSH_OPTIONS[@]}" "$SSH_TARGET" 'printf "%s" "$HOME"')"
[[ "$remote_home" =~ ^/home/[a-z]/[A-Za-z0-9._-]+$ ]] ||
  fail "remote HOME is not a Beget shared-hosting home: ${remote_home}"
[[ "$BEGET_DEPLOY_PATH" == "$remote_home/"* ]] ||
  fail 'BEGET_DEPLOY_PATH is outside the authenticated Beget account HOME'

relative_path="${BEGET_DEPLOY_PATH#"$remote_home/"}"
[[ "$relative_path" == */* ]] ||
  fail 'BEGET_DEPLOY_PATH must be at least two directories below the account HOME'

resolved_path="$(
  ssh "${SSH_OPTIONS[@]}" "$SSH_TARGET" \
    "set -eu; mkdir -p '$BEGET_DEPLOY_PATH'; cd '$BEGET_DEPLOY_PATH'; pwd -P"
)"
[[ "$resolved_path" == "$BEGET_DEPLOY_PATH" ]] ||
  fail "BEGET_DEPLOY_PATH resolves through a symlink or to another location: ${resolved_path}"

rsync_ssh="ssh -p ${BEGET_SSH_PORT} -o BatchMode=yes -o StrictHostKeyChecking=yes"

# Runtime configuration and Passenger state live only on Beget and survive
# deployments. Everything else in the application directory mirrors the build.
rsync \
  --archive \
  --compress \
  --delay-updates \
  --delete-delay \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='tmp/' \
  --rsh="$rsync_ssh" \
  "$ARTIFACT_DIR/" \
  "$SSH_TARGET:$BEGET_DEPLOY_PATH/"

ssh "${SSH_OPTIONS[@]}" "$SSH_TARGET" \
  "set -eu; test -f '$BEGET_DEPLOY_PATH/server.js'; mkdir -p '$BEGET_DEPLOY_PATH/tmp'; touch '$BEGET_DEPLOY_PATH/tmp/restart.txt'"

healthcheck_passed=false
healthcheck_output='no response'
readonly EXPECTED_HEALTHCHECK="{\"ok\":true,\"sha\":\"${CI_COMMIT_SHA}\"}"

for attempt in $(seq 1 12); do
  healthcheck_output="$(
    curl \
      --fail \
      --location \
      --max-time 5 \
      --proto '=https' \
      --proto-redir '=https' \
      --silent \
      --show-error \
      "$BEGET_HEALTHCHECK_URL" 2>&1 || true
  )"

  if [[ "$healthcheck_output" == "$EXPECTED_HEALTHCHECK" ]]; then
    healthcheck_passed=true
    break
  fi

  sleep 5
done

[[ "$healthcheck_passed" == true ]] ||
  fail "health check did not expose commit ${CI_COMMIT_SHA}; last response: ${healthcheck_output}"

printf 'Deployment completed: %s\n' "$BEGET_DEPLOY_PATH"
