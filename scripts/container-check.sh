#!/usr/bin/env bash
# Container arm: build the committed image and wait for its readiness probe.
# Requires a local Docker daemon; CI runs the same script.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

IMAGE="noorg:gate-$$"

docker build --tag "$IMAGE" .
CONTAINER=$(docker create --publish 3000:3000 \
  --env NOORG_LLM_PROVIDER=local \
  --env NOORG_HTTP_AUTH_TOKEN=gate-token "$IMAGE")

cleanup() {
  docker rm --force "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker start "$CONTAINER"

for attempt in $(seq 1 30); do
  echo "readiness attempt ${attempt}/30"
  if curl --fail --silent http://127.0.0.1:3000/ready; then
    echo
    exit 0
  fi
  sleep 1
done

docker logs "$CONTAINER"
exit 1
