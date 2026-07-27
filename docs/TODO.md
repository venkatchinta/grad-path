# GradPath — Master TODO

Single tracker for everything between here and the goal: a free, nonprofit,
citation-backed platform for the **Apply · Afford · Repay** stages, safely
launched to real students and families. Narrative rationale lives in
`production-plan.md` and the ADRs; this file is the actionable checklist.

**Owner tags:** `[code]` = in this repo · `[dash]` = Cloudflare/GitHub dashboard ·
`[legal]` = lawyer/entity · `[expert]` = financial-aid professional ·
`[partner]` = pilot partner · `[you]` = founder task.

**Status:** `[x]` done · `[ ]` pending · `[~]` blocked/needs input.

---

## Shipped so far

- [x] `[code]` Engine: poverty guidelines, Standard/IBR/RAP, PSLF, My Aid Data
      parser, recommendations, afford (award letters), budget (funding plan) —
      28 tests, every result citation-backed.
- [x] `[code]` PWA: stage picker + Apply / Afford / Repay + mocked family
      workflow; on-device only; light/dark; PWA manifest + service worker.
- [x] `[code]` CI (GitHub Actions), `_headers` CSP, `wrangler.jsonc`, deploy
      script, SECURITY.md.
- [x] `[dash]` Live (private beta): https://grad-path.venkatchinta-net.workers.dev/
- [x] `[code]` Beta lockdown: robots.txt + noindex meta + `X-Robots-Tag`
      header + in-app "Private beta" banner.
- [x] `[code]` Docs: ADR-001..005, production-plan, deployment, this TODO.

---

## P0 — before sharing the URL with any tester

Correctness and access. Nothing below is optional for a tool that shows people
loan/eligibility numbers.

### Correctness (the launch blocker)
- [~] `[code]` **Update poverty guidelines to 2026.** BLOCKED: the build
      environment can't reach HHS/Federal Register (network policy). Needs the
      published figures — see "Inputs needed from you" below. ~5-line data
      change in `packages/engine/src/poverty-guidelines.ts` + citation + test.
- [ ] `[you]` Reconcile **RAP** numbers against StudentAid.gov's live tooling
      now that the plan is operating; update engine + citations on any drift.
- [ ] `[expert]` Have a financial-aid professional review **every** engine rule
      against its cited source (IBR %/thresholds, PSLF, RAP tiers, loan limits,
      529/FAFSA notes).
- [ ] `[you]` Cross-check **10+ real borrower cases**: engine output vs.
      servicer statements / StudentAid.gov Loan Simulator. Log results.

### Access & safety
- [ ] `[dash]` **Gate the site with Cloudflare Access** (email allow-list or
      OTP) — steps in `deployment.md`. robots/noindex hide it from search but
      do NOT stop open access.
- [ ] `[code]` In-app feedback link on every screen (mailto or form service; no
      trackers on data-entry pages).
- [ ] `[legal]` Terms of use + privacy policy (short — we hold no data — but
      must exist; lawyer/pro-bono clinic review). Link from the footer.
- [ ] `[you]` Confirm security headers on the live deploy via securityheaders.com.

---

## P1 — before public launch (gate off)

- [ ] `[you]` **Entity:** sign with a fiscal sponsor (fast) and/or file 501(c)(3).
- [ ] `[expert]` Recruit a **named volunteer expert advisor** as the standing
      destination for the engine's escalation flags.
- [ ] `[partner]` Line up **one pilot partner** (counseling office / college-access
      nonprofit / community group, 20–50 families); run the pilot; capture
      metrics for a first grant application.
- [ ] `[code]` Remove beta lockdown at launch: delete `robots.txt` Disallow,
      the `noindex` meta, and `X-Robots-Tag`; adjust the banner.
- [ ] `[dash]` Custom domain (`gradpath.org` + `beta.` subdomain); keep `beta.`
      gated after launch.
- [ ] `[dash]` Apply to Cloudflare **Project Galileo** (nonprofit WAF/DDoS).
- [ ] `[code]` Accessibility audit to WCAG 2.1 AA (screen-reader pass on all
      screens; meters/tables already have ARIA — needs a real audit).
- [ ] `[code]` Lighthouse ≥ 90 mobile (perf / a11y / PWA).
- [ ] `[code]` Content pages: About, **Methodology** (every number + its
      citation), FAQ.
- [ ] `[dash]` Privacy-respecting analytics (Plausible/Umami) on landing/results
      funnels only — never data-entry pages.
- [ ] `[dash]` Uptime monitoring + status contact.
- [ ] `[legal]` General liability / D&O insurance once real users are on the
      public site (fiscal sponsors often bundle this).
- [ ] `[dash]` GitHub: enable branch protection on `main` (require CI), enable
      Dependabot + secret scanning.

---

## P2 — post-launch roadmap (priority order)

1. [ ] `[code]` **AI guidance chat** (ADR-002): one edge function holding the
       LLM key, client-side tool execution, mechanical PII blocking. First
       server-side component — triggers the ADR-002 §4 security review.
2. [ ] `[code]` **SAI estimator** in Afford (Student Aid Index worksheet math,
       cited to the FAFSA Simplification Act tables) — turns "FAFSA help" from a
       checklist item into a calculator.
3. [ ] `[code]` **College Scorecard API** (free, api.data.gov) — prefill
       cost-of-attendance and outcomes in Afford.
4. [ ] `[code]` **Scholarship matching** — needs a data-source decision (open
       datasets vs. partnerships); keep student-direct, no lead-gen.
5. [ ] `[code]` **Real accounts/family sync** (ADR-004): promote the mocked
       Supabase Auth + parent→student invites + consent-first sharing to a real
       backend, only when beta demand justifies it.
6. [ ] `[code]` **Native app evaluation** (ADR-001/003): trigger is demand for
       recertification-deadline push reminders, not general preference.

---

## Standing / recurring

- [ ] `[code]` **Every January:** add the new HHS poverty-guideline table year +
      tests (`deployment.md`).
- [ ] `[you]` **Monthly:** policy watch — RAP/IBR/PSLF changes (IDR phases out
      through 2028).
- [ ] `[code]` **Weekly (auto):** merge green Dependabot PRs.
- [ ] `[you]` **Quarterly:** citation audit — every engine citation still
      resolves and still says what we claim.

---

## Known limitations / tech debt

- [ ] `[code]` Family/auth flow is a **mock** (on-device, no real auth) — must
      not be presented to testers as working account functionality until P2 #5.
- [ ] `[code]` Poverty table = 2025 figures until the 2026 update lands (above).
- [ ] `[code]` Afford school data is hand-entered until the Scorecard API (P2 #3).
- [ ] `[code]` `SECURITY.md` uses GitHub private reporting + a not-yet-live
      `security@gradpath.org`; wire the mailbox when the domain exists.

---

## Inputs needed from you (unblock P0)

1. **2026 HHS poverty guidelines** (I can't reach the source from the build env).
   Paste, or confirm I may fetch, these numbers so the update can ship:
   - 48 contiguous states + DC: household-of-1 amount and per-additional-person
     increment.
   - Alaska: same two numbers.
   - Hawaii: same two numbers.
   - Effective date / Federal Register citation.
2. Go-ahead on which **pilot partner** type to pursue first (shapes outreach).
3. Whether to stand up **`gradpath.org`** now (unblocks custom domain + email).
