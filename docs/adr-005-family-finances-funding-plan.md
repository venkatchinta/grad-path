# ADR-005: Family Finances — Who Pays, and the Funding Plan

- **Status:** Accepted (engine + UI shipped; account-linking explicitly deferred)
- **Date:** 2026-07-08

## Context

Parents often fund or repay their student's education. Two questions drove
this design: (1) what does the product do when the **parent is paying the
loans**, and (2) how do families attach their **funding sources** — 529
plans, savings, monthly cash flow, personal borrowing — to see whether they
can cover the path to graduation.

## Decision 1: model "who pays" by the legal reality, not the household one

- **Parent PLUS loans are the parent's own debt.** They never transfer to the
  student, and they have restricted repayment options. Parents run the Repay
  screening on them under their own profile; the engine's Parent PLUS
  escalation flag routes the messy cases (double consolidation, ICR access)
  to a human expert rather than guessing.
- **A parent paying the student's Direct loans changes nothing legally.**
  Payments made by anyone count as the borrower's (including toward PSLF);
  the plan choice and math stay keyed to the student. The product treats
  "parent pays" as a budgeting fact, not a loan-ownership fact.
- This guidance is stated in the parent family dashboard ("Paying the loans
  yourself?") so families stop conflating the two cases.

## Decision 2: funding plan by manual entry, computed on-device

The Afford stage gains a **Family funding plan**: add sources (529 balance,
savings/cash, monthly contribution, personal loan/HELOC, other — each tagged
parent/student/grandparent), pick a school from the award comparison, and the
engine (`@gradpath/engine` `budget` module) computes over the years to
graduation:

- total cost (net price × years), funds available without borrowing, and a
  coverage percentage;
- federal Direct Loan capacity from the dependent-undergrad schedule
  ($5,500/$6,500/$7,500/$7,500, $31,000 aggregate — 34 CFR 685.203) applied
  to the remaining gap;
- the residual "still to solve" gap, with options in priority order (cheaper
  school, aid appeal, scholarships, more monthly contribution, then
  PLUS/private with a warning).

Rule ordering encoded, all citation-backed: gift money and savings first,
federal student loans second, personal/private borrowing last and warned
about (no income-driven plans, no forgiveness — CFPB). 529 guidance included
(qualified expenses per IRS Pub 970; grandparent-owned 529s no longer reduce
aid since the 2024-25 FAFSA Simplification changes).

## Decision 3: no bank/529 account linking (Plaid-style) for now

Live account aggregation would import balances automatically — and would
demolish the security posture: credentials/tokens for family financial
accounts, a server to hold them, and vendor risk, all to save typing four
numbers a few times a year. **Manual entry is the feature, not a
limitation**, at this stage. Revisit only if user research shows manual
entry is a real adoption barrier, and then only via a read-only aggregator
in a hardened backend (a Phase-3+ decision with its own ADR).

Amounts stay on-device like all financial data (ADR-001). Family sharing
(ADR-004) may later share the **coverage percentage** as a summary stat —
never source balances.

## Follow-ups surfaced

- [ ] Per-year cash-flow view (529 drawdown schedule vs. tuition due dates)
- [ ] Cost inflation assumption (net price rarely stays flat for 4 years)
- [ ] Independent-student loan limits (current table assumes dependent)
- [ ] Sibling overlap (two students drawing on the same 529/savings pool)
- [ ] Retirement-fund warning if users start listing 401k/IRA as sources
