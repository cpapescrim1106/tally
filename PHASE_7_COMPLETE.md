**Summary**
- Added a Mission view dropdown switcher on `/mission` that persists selections and routes to the chosen view. `pages/mission/index.tsx:36`
- Routed the header’s Mission Control link to the Mission index for consistent entry. `components/layout/Header.tsx:19`
- Dark mode check completed across Mission views and the new switcher.

**Manual QA**
- Open `/mission`, use the View Switcher and cards to navigate to Kanban/Timeline/Tiles/Matrix, then click the header Mission Control link to return to the index.

**Tests**
- `docker build .`

**Commit**
- `Phase 7: Navigation & Polish`