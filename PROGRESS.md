# Progress Log

## 2026-03-27

### Done

- Added free-position editing inside containers.
  - Elements can now switch between flow layout and free placement.
  - In free placement, selected elements can be dragged directly on the canvas and fine-tuned with X/Y values.
- Expanded export output beyond single screen snippets.
  - React / Tailwind export now generates shared files such as `app/layout.tsx`, `app/globals.css`, `app/page.tsx`, and per-screen pages.
  - HTML / CSS export now generates shared files such as `index.html`, `styles/globals.css`, and per-screen files.
- Added ZIP download for generated export files.
  - Exported files are now saved as a folder-preserving ZIP archive from the export screen.
- Added a design setup board for project creation.
  - Projects can now start from a selected design kit with preset color, surface, typography, and button direction.
  - The same design kit can be reapplied later from the editor.
- Improved editing UX for direct manipulation.
  - Right panel was simplified to focus on content and style editing.
  - Canvas overlays that hid content were removed.
  - Placeholder image handling was changed to local-safe placeholders.

### Verified

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

### Current Local Run

- Verified in local dev server at `http://localhost:3002`
- Port `3000` was already in use in this environment, so the active dev session was moved to `3002`

### Next Candidate Work

- Screenshot-based design extraction
- More robust drag and alignment tooling
- Stronger export packaging and project handoff flow
