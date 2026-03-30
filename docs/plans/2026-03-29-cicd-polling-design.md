# CI/CD: Cron-Based Polling Deploy — Design

## Problem

Deployment is manual: rsync from local machine, SSH into teenyverse, rebuild Docker container. This is error-prone (rsync can overwrite docker-compose.yml) and tedious.

## Solution

A cron job on teenyverse that checks for new commits on `origin/main` every 5 minutes. If new commits exist, it pulls and rebuilds the Docker container automatically.

## Design

### Deploy script: `deploy/deploy.sh`

Checked into the repo at `deploy/deploy.sh`. Steps:

1. `cd /home/defaultuser/makealisting`
2. `git fetch origin main`
3. Compare `HEAD` vs `origin/main` — exit 0 if identical (no work to do)
4. `git pull origin main`
5. `docker compose down && docker compose build && docker compose up -d`
6. Health check: retry curl to `localhost:3050` up to 5 times with 5-second intervals
7. Log result with timestamp

### SSH config on teenyverse

Add `github-anon` host alias to `~/.ssh/config` on teenyverse, using the `id_newusemame` key (already present on that machine for the router host). This lets `git fetch` authenticate with the new-usemame GitHub account.

### Git remote on teenyverse

Update the git remote in `/home/defaultuser/makealisting` to use `github-anon:new-usemame/Make-A-Listing.git`.

### Cron entry

```
*/5 * * * * /home/defaultuser/makealisting/deploy/deploy.sh >> /home/defaultuser/makealisting-deploy.log 2>&1
```

### Not included

- Rollback (can add later)
- Pre-deploy tests (Docker build validates)
- Notifications (check the log)

### Files

1. `deploy/deploy.sh` — new, checked into repo
2. Server SSH config — manual one-time setup
3. Server crontab — manual one-time setup
