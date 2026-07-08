# GradPath

GradPath is a free, AI-powered nonprofit platform covering the full higher-education
financial lifecycle in three stages:

- **Apply** — college application guidance
- **Afford** — FAFSA assistance, scholarship matching, award letter comparison
- **Repay** — loan repayment plan matching, PSLF screening, forgiveness program navigation

No other free, student-direct platform covers all three stages today. Existing tools
are either paid, sold to institutions, or cover a single stage (see `docs/` for a
competitive landscape once added).

## Design principles

- Every eligibility rule must cite an official source
- No AI in the deterministic math/calculation layer — calculations are rule-based and
  auditable; AI is used only for conversation and guidance
- Open source with open platform integrations
- Student-direct, never sold to institutions

## Status

MVP covering all three stages:

- **Apply** — deadline-by-deadline application checklist (college list, FAFSA,
  early/regular deadlines, decision day) with progress saved on-device.
- **Afford** — award-letter comparison on real net price (COA minus gift aid),
  out-of-pocket math, loans-vs-gift-aid warnings, and a four-year borrowing
  outlook against federal Direct Loan limits.
- **Repay** — the deepest stage: plan matching (Standard 10-year / IBR / RAP),
  PSLF screening, "My Aid Data" import, and expert-escalation flags.

Built on:

- `@gradpath/engine` — deterministic calculators and eligibility rules; every
  result carries citations to official sources (CFR, Pub. L. 119-21, HHS,
  StudentAid.gov, CFPB).
- `apps/demo` — a mobile-first PWA with a stage-picker home screen. All
  calculations run on-device; financial data is never uploaded (see
  `docs/adr-001-platform-and-architecture.md` and `docs/deployment.md`).

Relevant policy context: the SAVE plan is being wound down, income-driven repayment
plans are phasing out by 2028, and the new Repayment Assistance Plan (RAP) launched
July 1, 2026.

## Repository layout

```
packages/
  engine/        @gradpath/engine — calculation & eligibility logic (TypeScript, Vitest)
apps/
  demo/          Interactive React demo of the screening flow
docs/            Proposal materials, design notes, policy references
```

## Getting started

```bash
npm install
npm test                              # engine test suite
npm run dev --workspace=apps/demo     # run the PWA locally
npm run build                         # build engine + demo (deployable dist)
```

## License

MIT — see [LICENSE](./LICENSE).
