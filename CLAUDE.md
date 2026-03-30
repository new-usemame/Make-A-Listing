# Make a Listing

## What This Is

PWA that generates e-commerce product listings for multiple platforms (eBay, Poshmark, Depop, Mercari) simultaneously. Users describe a product (text + images + PDFs), select target platforms, and get tailored markdown listings per platform via streaming LLM generation.

**Live at:** https://makealisting.com

## Why It Exists

Users were using ChatGPT to write listings but it lost context between requests — forgetting formatting rules, keyword guides, character limits. This app solves that by explicitly constructing the full context window on every API call. Context is never lost.

## Core Architecture

**Stack:** SvelteKit + TypeScript, Tailwind CSS, SQLite (Drizzle ORM), OpenRouter (OpenAI SDK), Tavily (web search)

**Agent Pipeline** (per generation request):
1. **Classify** — GPT-4o-mini analyzes prompt → decides if web search needed, extracts product attributes
2. **Enrich** — Parallel: Tavily web search (if needed) + vision model image analysis (if images)
3. **Generate** — Parallel per platform: streams markdown listing via user's chosen model
4. **Title** — GPT-4o-mini generates session title on first message

**Key design decisions:**
- BYOK (Bring Your Own Key) — each user provides their own OpenRouter API key
- API keys encrypted with AES-256-GCM at rest
- System prompt is a "level 2" feature — persistent instructions per user, not required
- Separate markdown output per platform (not combined)
- Streaming via SSE from `/api/generate`

## Project Structure

```
src/lib/server/          # All server-side logic
  auth.ts                # Register/login/session (bcrypt + cookie sessions)
  crypto.ts              # AES-256-GCM encrypt/decrypt for API keys
  files.ts               # Image processing (sharp), PDF text extraction
  openrouter.ts          # OpenRouter client builder, curated model list
  db/schema.ts           # Drizzle schema (users, sessions, messages, listings, platforms)
  db/seed.ts             # Default platform seeding
  pipeline/              # The agent pipeline
    classify.ts          # Product classification step
    enrich.ts            # Web search + image analysis
    generate.ts          # Streaming listing generator (async generator)
    prompts.ts           # Platform-specific prompt templates
    title.ts             # Session title generation

src/lib/components/      # Svelte 5 components (runes syntax)
src/routes/              # SvelteKit file-based routing
  api/generate/          # SSE streaming generation endpoint
  app/session/[id]/      # Main workspace
  app/settings/          # API key, model, system prompt, platforms
  app/history/           # Session history with search
  auth/                  # Login/register
```

## Deployment

- **Server:** teenyverse (10.0.30.36), Ubuntu 24.04, Docker
- **Container:** `makealisting` on port 3050 (localhost only)
- **Tunnel:** Cloudflare tunnel `ebf691d0...` routes makealisting.com → localhost:3050
- **Tunnel config:** `/etc/cloudflared/config.yml` (edit `~/.cloudflared/config.yml` then sudo cp)
- **Resource limits:** 512MB RAM, 1 CPU core
- **Data:** `/home/defaultuser/makealisting/data/` (SQLite DB + uploads)

### Redeployment

```bash
# From this machine:
rsync -avz --exclude node_modules --exclude .svelte-kit --exclude build --exclude data --exclude .env -e ssh . defaultuser@10.0.30.36:/home/defaultuser/makealisting/

# On teenyverse (or via SSH):
cd /home/defaultuser/makealisting
docker compose down && docker compose build && docker compose up -d
```

**IMPORTANT:** rsync will overwrite docker-compose.yml. The production version uses port 3050, env_file, and resource limits. Don't overwrite it carelessly — check after rsync.

## Development

```bash
npm run dev          # Dev server on localhost:5173
npm run build        # Production build
npx vitest run       # Run all tests (30 tests across 6 files)
npx drizzle-kit generate  # Generate new migrations after schema changes
```

## Conventions

- Svelte 5 runes syntax (`$props`, `$state`, `{@render children()}`)
- All server code in `src/lib/server/` — never import server modules from client
- `process.env` for env vars in server modules (not `$env/dynamic/private`) — keeps tests simple
- Tests use in-memory SQLite with Drizzle migrations applied
- Platform prompts are in `pipeline/prompts.ts` — edit there to change listing format rules
