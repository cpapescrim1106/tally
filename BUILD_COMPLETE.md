**What I built**
- Verified the Tally rebrand across package metadata, UI titles/meta, header/footer, and README.
- Confirmed the Dockerfile supports production builds.

**Docker build result**
- `docker build -t tally:test .` (success)

**How to run locally**
- `npm install`
- `npm run dev`
- `docker run -p 3000:3000 --env-file .env.local tally:test`
