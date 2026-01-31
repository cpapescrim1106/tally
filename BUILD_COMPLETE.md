# Build Complete

## What I built
- Rebranded UI copy and metadata to Tally
- Updated footer attribution and README branding copy
- Refreshed manifest and OG image tagline

## Docker build result
- Success (docker build -t tally:test .)

## How to run locally
1. npm install
2. npm run dev
3. Open http://localhost:3000

Docker:
- docker build -t tally:test .
- docker run -p 3000:3000 --env-file .env.local tally:test
