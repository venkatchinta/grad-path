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

Early scaffolding. The Repay stage is the current focus, built around
`@gradpath/engine` — a TypeScript library for poverty-guideline calculations, Standard
10-year / IBR / RAP payment calculators, PSLF eligibility screening, and a tolerant
parser for StudentAid.gov "My Aid Data" exports.

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
npm run test --workspace=packages/engine
```

## License

MIT — see [LICENSE](./LICENSE).
