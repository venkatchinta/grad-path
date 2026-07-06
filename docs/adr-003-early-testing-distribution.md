# ADR-003: Distribution for Early Testing and Validation

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

We need real students and borrowers using GradPath early — before polish — to
validate that the Repay screening flow is understandable, trustworthy, and actually
helps. The question: should early testing go through the App Store / Play Store, or
is there a better path?

## Decision: skip the app stores entirely for early validation — beta by URL

Because v1 is a PWA (ADR-001), the app stores are not a prerequisite for testing.
They would only slow validation down: developer accounts, review queues, extra
scrutiny for finance-adjacent apps, and (on Play) tester-count requirements — all to
distribute something a link already distributes. The store question returns only
when a native app is built (Phase 3), and by then validation should be done.

### The beta pipeline

- **Per-branch preview deploys.** Cloudflare Pages (or Netlify) gives every PR its
  own preview URL automatically — design reviews and quick user tests run off these.
- **A gated staging URL** (e.g. `beta.gradpath.org`) for the ongoing private beta:
  a lightweight access code or Cloudflare Access in front, both to set expectations
  ("this is a beta") and to keep half-finished guidance from being mistaken for
  official advice or indexed by search engines.
- **Production URL** opens when the engine's rules have citation coverage and the
  beta cohort stops finding correctness issues.
- **In-app feedback:** a one-tap feedback widget on every screen (screenshot +
  comment), plus a short exit survey after the screening flow. Privacy-respecting
  analytics (Plausible/Umami) for funnel drop-off only — no trackers on
  data-entry pages (ADR-001).
- **PWA install** ("Add to Home Screen") gives beta testers an app-like icon and
  full-screen experience with zero store involvement — a genuine preview of the
  native experience.

### Where to recruit testers

The channels where borrowers already seek this help, approached transparently as a
free nonprofit tool in beta:

- Student-loan communities (e.g. r/StudentLoans, TISLA's audience) — these
  communities are wary of scams, so open source + nonprofit + no-login-required is
  the credibility story; lead with it.
- University financial aid offices and college access nonprofits (counselor-assisted
  sessions double as moderated usability tests).
- PSLF-heavy employers' communities: teachers, nurses, public defenders,
  social workers.
- 5–10 moderated sessions (watch someone import their "My Aid Data" file on their
  own phone) will surface more than a thousand analytics events; do these first.

### What validation must answer before more engineering

1. Can a borrower complete the screening flow unassisted on a phone?
2. Does the "My Aid Data" export/import step succeed in practice? (Highest-risk
   step: it depends on StudentAid.gov's UX and file quirks.)
3. Do users trust the output enough to act on it — and is that trust justified
   (numbers verified against servicer statements)?
4. Does the AI chat add value over the plain form flow, or confuse?

## When native apps eventually ship (Phase 3)

For completeness, the store path when it's earned:

- **iOS:** TestFlight — internal testing (up to 100 team testers, no review) then
  external testing (up to 10,000 testers, light review). Requires the $99/yr Apple
  Developer Program; Apple waives the fee for eligible US nonprofits — apply once
  501(c)(3) status exists.
- **Android:** Play Console internal testing (up to 100 testers, instant) → closed
  testing. Note Google's policy for personal developer accounts requiring a closed
  test with 12+ testers for 14+ days before production access — one more reason to
  register the account as the nonprofit organization, not an individual.
- Direct APK sideloading and alternative stores are not worth the trust cost for a
  finance app; PWA covers the no-store use case.

## Consequences

- Early validation costs nothing and starts as soon as the demo app exists — no
  developer accounts, no review queues.
- We must build the small amount of beta scaffolding (access gate, feedback widget,
  staging environment) alongside the first demo.
- Store presence is deliberately deferred; if partners ask "is it on the App
  Store?", the answer is the install-to-home-screen flow until Phase 3.
