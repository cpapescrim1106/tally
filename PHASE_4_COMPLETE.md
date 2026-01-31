**Summary**
- Updated Kanban to a 3‑column Backlog/In Progress/Done layout with counts and status normalization; health badges remain on cards. `pages/mission/kanban.tsx:14`
- Simplified mission status typing and default status mapping to those three lanes. `types/mission.ts:5` `hooks/useProjects.ts:50`

**Tests**
- `npm run build`

**Manual QA**
- Visit `/mission/kanban` and confirm projects group correctly with health badges and column counts.

**Notes**
- `npm run build` warns about multiple lockfiles under `/home/cpape` (non‑blocking).
- Committed as `Phase 4: Kanban View`.