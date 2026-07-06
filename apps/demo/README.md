# GradPath Demo

Mobile-first PWA for the Repay screening flow: three steps (about you → your
loans → results) with a ledger-style loan table, plan-comparison tiles
(Standard / IBR / RAP), and a PSLF progress tracker.

All calculations run on-device via `@gradpath/engine` (imported from source via
a Vite alias — no engine build step needed). "My Aid Data" files are parsed
locally and never uploaded; progress persists in localStorage only. No backend,
no analytics, no trackers.

```bash
npm run dev --workspace=apps/demo      # local dev server
npm run build --workspace=apps/demo    # typecheck + production build to dist/
npm run preview --workspace=apps/demo  # serve the production build
```
