# Docs

Proposal materials, competitive landscape notes, design decisions, and policy
references (SAVE plan wind-down, IDR phase-out by 2028, RAP launch July 1, 2026).

## Architecture decision records

- [ADR-001: Platform, Architecture, and Deployment](./adr-001-platform-and-architecture.md) —
  mobile-first PWA (not native), client-side engine so financial data stays
  on-device, phased backend, open-source/nonprofit-friendly deployment.
- [ADR-002: AI Layer Design](./adr-002-ai-layer.md) — AI as conversational
  interface, engine as authority (tool-use pattern), client-side tool execution,
  mobile-first interaction design, domain guardrails.
- [ADR-003: Distribution for Early Testing and Validation](./adr-003-early-testing-distribution.md) —
  beta by URL instead of app stores, tester recruitment, validation questions,
  eventual TestFlight/Play Console path.
- [ADR-004: Accounts and Family Linking](./adr-004-accounts-family-linking.md) —
  optional Google/Apple sign-in, parent→student invites, consent-first
  summaries-only sharing, Supabase plan, and the implementation checklist
  surfaced by the mocked workflow.
- [ADR-005: Family Finances — Who Pays, and the Funding Plan](./adr-005-family-finances-funding-plan.md) —
  Parent PLUS vs. paying the student's loans, the 529/savings/monthly funding
  plan with federal-loan-first gap analysis, and why bank account linking is
  deliberately deferred.
- [Production Plan](./production-plan.md) — phase gates from deployable MVP to
  launched product: infra, private beta with expert review, public launch,
  post-launch roadmap, standing operations, risk register.
