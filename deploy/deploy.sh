#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/home/defaultuser/zolan-listings"
COMPOSE_SERVICE="zolan-listings"
PORT=3050
MAX_HEALTH_RETRIES=5
HEALTH_INTERVAL=5

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

cd "$PROJECT_DIR"

# Fetch latest from origin
git fetch origin main --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    exit 0
fi

log "New commits detected: $LOCAL -> $REMOTE"
log "Pulling changes..."
git pull origin main --quiet

log "Rebuilding and restarting container..."
docker compose down
docker compose build --quiet
docker compose up -d

# Health check
for i in $(seq 1 $MAX_HEALTH_RETRIES); do
    sleep $HEALTH_INTERVAL
    if curl -sf "http://localhost:${PORT}" > /dev/null 2>&1; then
        log "Deploy successful. Container healthy."
        exit 0
    fi
    log "Health check attempt $i/$MAX_HEALTH_RETRIES failed, retrying..."
done

log "ERROR: Container not healthy after ${MAX_HEALTH_RETRIES} attempts"
exit 1
