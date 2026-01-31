**Summary**
- Added health-status color mapping and applied it to timeline bars in `pages/mission/timeline.tsx:26` and `pages/mission/timeline.tsx:185`.
- Sorted projects by earliest due date and tightened the today marker/tick layout in `pages/mission/timeline.tsx:61` and `pages/mission/timeline.tsx:133`.

**Tests**
- `npm run build`

**Notes**
- Commit created with message “Phase 6: Timeline View”.
- Build emits a Next.js warning about multiple lockfiles; consider setting `outputFileTracingRoot` or removing the extra lockfile if desired.