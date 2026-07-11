# Production Plan

- **Status:** Active
- **Date:** 2026-07-11
- **Owner:** Venkat

The MVP (all three stages) is merged to `main`. This plan takes it from
"deployable" to "in production, trusted, and maintained." Phases are gates,
not dates: each phase ends when its exit criteria are met.

## Phase 0 — Infrastructure (this week)

- [ ] Register the domain (e.g. `gradpath.org`).
- [ ] Create the Cloudflare account and connect Pages to the repo
      (`docs/deployment.md` has the exact settings). Every merge to `main`
      then auto-deploys; every PR gets a preview URL.
- [ ] Add the custom domain + `beta.` subdomain in Pages.
- [ ] Turn on GitHub branch protection for `main`: require the CI check,
      require PRs (no direct pushes).
- [ ] Enable Dependabot security updates and secret scanning in repo settings.

**Exit:** merging a PR updates the live site with no manual steps.

## Phase 1 — Private beta (target: 2–4 weeks)

Gate the beta host with Cloudflare Access (ADR-003) and recruit 10–30 testers
from student-loan communities, financial aid offices, and PSLF-heavy
professions. Run 5–10 moderated sessions first — watch someone import their
own "My Aid Data" file on their own phone.

In parallel, recruit **one pilot partner** — a high-school counseling office,
a college-access nonprofit, or a community group with 20–50 students/families.
A structured pilot beats diffuse beta signups: the partner supplies motivated
users and a feedback channel, and the pilot's outcomes (families served,
decisions made with the tool) become the evidence base for a first grant
application.

**Correctness work (the launch blocker):**

- [ ] Verify the 2026 HHS poverty guidelines and add the table year
      (`packages/engine/src/poverty-guidelines.ts`).
- [ ] Verify RAP parameters against StudentAid.gov's live tooling now that
      the plan has launched; reconcile any differences and update citations.
- [ ] Have at least one financial-aid professional (e.g. TISLA-adjacent
      reviewer or a university FA officer) review every engine rule against
      its citation.
- [ ] Convert that reviewer (or recruit another) into a **named volunteer
      expert advisor**: the standing human destination for the engine's
      escalation flags, and the person who makes "expert-reviewed" an ongoing
      truth rather than a one-time gate.
- [ ] Cross-check 10+ real borrower cases: engine output vs. servicer
      statements / StudentAid.gov Loan Simulator.

**Product work:**

- [ ] In-app feedback link on every screen (mailto or a simple form service —
      still no trackers on data-entry pages).
- [ ] Beta banner: "screening estimate, not advice; numbers under review."
- [ ] Fix what moderated sessions surface (expect parser tolerance issues).

**Legal/organizational (can run in parallel):**

- [ ] Decide the entity path: **fiscal sponsorship** (weeks — an established
      sponsor lends its 501(c)(3) status for a fee, unlocking grants and
      donations quickly) vs. filing our own 501(c)(3) (12+ months but
      permanent). Recommended: sign with a fiscal sponsor now, file our own
      in parallel.
- [ ] Terms of use + privacy policy reviewed by a lawyer — the privacy policy
      is short because we hold nothing, but it must exist. Nonprofit legal
      clinics often do this pro bono.
- [ ] Replace the personal contact in `SECURITY.md` with a project address.

Note on licensing: the MIT license covers the **code**, not the **service**.
It disclaims warranty for people who reuse our code, but it does not reduce
the operating entity's obligations under consumer-protection or privacy law,
and it is not a liability shield toward users of the hosted site — that
protection comes from the service-level terms of use, disclaimers, the
data-minimization architecture, and insurance.

**Exit:** the four validation questions in ADR-003 answered yes; zero known
wrong-number bugs; disclaimer + policies in place.

## Phase 2 — Public launch

- [ ] Remove the Access gate from the production domain (keep `beta.` gated
      for pre-release testing).
- [ ] Apply to Cloudflare Project Galileo (free nonprofit WAF/DDoS).
- [ ] Accessibility audit to WCAG 2.1 AA (screen reader pass on all four
      screens; the meters and tables have ARIA but need a real audit).
- [ ] Lighthouse pass ≥ 90 on mobile for performance/accessibility/PWA.
- [ ] Privacy-respecting analytics (Plausible or Umami) on landing/results
      funnels only — never on data-entry pages.
- [ ] Uptime monitoring (e.g. a free ping service) + a status contact.
- [ ] General liability / D&O insurance for the entity once real users are on
      the public site (fiscal sponsors often bundle this — ask first).
- [ ] Content pages: About, Methodology (how every number is computed, with
      the citation list), FAQ.
- [ ] Search Console + sitemap for the guidance content.
- [ ] Announce in the communities that beta-tested it — credibility story is
      open source + nonprofit + no login + data never leaves the device.

**Exit:** public traffic, no gate, monitored, with a public methodology page.

## Phase 3 — Post-launch roadmap (priority order)

1. **AI guidance chat** (ADR-002): one edge function holding the LLM key,
   client-side tool execution, PII blocking. This is the first server-side
   component — it triggers the security review checklist in ADR-002 §4.
2. **SAI estimator** in Afford (Student Aid Index worksheet math, citable to
   the FAFSA Simplification Act tables) — turns "FAFSA assistance" from a
   checklist item into a calculator.
3. **School lookup via the College Scorecard API** (free key from
   api.data.gov) — prefill cost-of-attendance and outcomes data in Afford so
   families compare offers against a school's published net price and
   completion rates.
4. **Scholarship matching** — needs a data source decision (open datasets vs.
   partnerships); keep student-direct, no lead-gen.
5. **Accounts/sync** via Supabase (ADR-001 Phase 2 / ADR-004) — only when
   beta feedback demands cross-device or the family workflow graduates from
   its mock.
6. **Native app evaluation** (ADR-001/003 Phase 3) — the trigger is demand
   for recertification-deadline push reminders, not general preference.

## Standing operations

| Cadence | Task |
|---|---|
| Every January | New HHS poverty-guideline table year + tests (see `docs/deployment.md`) |
| Monthly | Policy watch: RAP/IBR/PSLF regulatory changes (IDR phase-out runs through 2028) |
| Weekly (automated) | Dependabot PRs — merge on green CI |
| Quarterly | Citation audit: every engine citation still resolves and still says what we claim |
| Per release | PR → CI green → squash merge → auto-deploy; rollback = Cloudflare Pages one-click rollback to the previous deployment |

## Risk register

| Risk | Mitigation |
|---|---|
| Policy changes faster than the engine (RAP is new; IDR is phasing out) | Monthly policy watch; parameters are data + citations, not scattered logic; beta banner until expert-reviewed |
| A wrong number harms a borrower | No-AI math layer; tests on published figures; expert review gate in Phase 1; "screens, doesn't certify" language on every results screen |
| StudentAid.gov changes the "My Aid Data" format | Parser is tolerant by design and fails soft to manual entry; feedback link surfaces breakage fast |
| Single-maintainer bus factor | Everything is documented in `docs/`; CI enforces correctness; recruit a co-maintainer during beta |
| Trust deficit (finance tools are scam-adjacent) | Open source, no login, no data collection, citations on every number, nonprofit status — say all of this on the landing page |
