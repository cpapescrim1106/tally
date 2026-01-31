**Summary**
- Added `MissionProject` typing and switched mission UI wiring to it. (`types/mission.ts:1`, `components/mission/ProjectCard.tsx:1`, `pages/mission/kanban.tsx:1`)
- Replaced project health calculation with `calculateHealthScore`/`determineStatus` and hooked it into `useProjects`. (`utils/projectHealth.ts:1`, `hooks/useProjects.ts:1`)
- Committed as `Phase 1: Data Layer`.

**Tests**
- `npm run build` (fails: Next.js build worker SIGBUS; lockfile root warning)
- `npx tsc --noEmit`

**Manual QA**
- `npm run dev`
- Ensure `.env.local` has Todoist/NextAuth values, sign in, then visit `/mission/tiles`, `/mission/kanban`, and `/mission/matrix` to confirm health scores and statuses populate.