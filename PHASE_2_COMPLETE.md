**Summary**
- Added `className` support and accessible labeling for health status badges in `components/mission/HealthBadge.tsx:4`.
- Expanded the progress bar to normalize percentages, optionally display the value, and expose ARIA metadata in `components/mission/ProgressBar.tsx:3`.
- Tuned project card progress display and task labeling in `components/mission/ProjectCard.tsx:24`.

**Tests**
- Not run (not requested).

**Manual QA**
- `npm run dev`
- Sign in, then visit `/mission/tiles` to verify badges, progress labels, and task counts.
- Visit `/mission/matrix` to confirm progress bars render cleanly.

**Notes**
- Committed as `Phase 2: Shared Components`.
- Uncommitted changes remain: `BUILD_STATE.json`, `.codex-phase-2.md`.