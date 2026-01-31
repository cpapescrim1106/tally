# Build Complete

## What I built
- Rebranded Tally identity, metadata, and assets
- Implemented Mission Control views (kanban, timeline, tiles, matrix) with health and progress signals
- Added expandable details to mission tiles and view preference handling
- Added Docker build pipeline notes

## Docker build result
- Success (`docker build -t tally:test .`)

## How to run locally
1. `npm install`
2. Create `.env.local` with Todoist OAuth + NextAuth credentials (see `README.md`)
3. `npm run dev`

Docker:
- `docker build -t tally:test .`
- `docker run -p 3000:3000 --env-file .env.local tally:test`
