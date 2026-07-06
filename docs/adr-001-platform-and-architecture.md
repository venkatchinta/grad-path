# ADR-001: Platform, Architecture, and Deployment

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

GradPath is a free, nonprofit, student-direct platform covering Apply, Afford, and
Repay. The current focus is the Repay stage, built on `@gradpath/engine` — a
deterministic TypeScript calculation/eligibility library. Users are students and
borrowers who are heavily mobile. Financial information is involved, so security and
data handling are first-order concerns. The team is small and the product must ship
and iterate quickly during the RAP rollout window (RAP launched July 1, 2026; IDR
plans phase out by 2028).

Decisions needed: mobile app vs. web app vs. both; how to deploy; which open-source
platforms to build on; how to protect financial data.

## Decision 1: Mobile-first web app (PWA) first, native later if earned

Build a responsive web application designed mobile-first and installable as a PWA.
Do **not** build native iOS/Android apps for v1.

Rationale:

- **Distribution.** A nonprofit spreading through counselors, online communities, and
  school partnerships wins on "click this link" — no download, no app store account,
  works on a school library desktop. SEO drives discovery ("what is RAP repayment");
  native apps get none of it.
- **Iteration speed.** App-store review adds days to every fix, and finance-adjacent
  apps get extra scrutiny. Guidance changes month to month during the RAP rollout;
  web deploys ship instantly.
- **Workflow fit.** Uploading a StudentAid.gov "My Aid Data" export, comparing award
  letters, and filling worksheets are as natural on desktop as on a phone. Nothing in
  the v1 plan requires camera, push notifications, or offline-first badly enough to
  justify native.
- **One codebase.** The engine is TypeScript and runs directly in the browser, which
  also anchors the security model (Decision 3).

Native mobile (React Native/Expo or Capacitor, reusing the TypeScript engine and most
React code) becomes worth revisiting when push reminders for recertification
deadlines or document scanning prove valuable. Nothing in this decision forecloses it.

## Decision 2: Phased architecture

- **Phase 1 — zero-backend v1.** Static PWA + engine running in the browser. Uploaded
  "My Aid Data" files are parsed locally and never uploaded. Progress persists in
  localStorage/IndexedDB. No accounts. The only server component is a thin edge
  function that proxies the AI guidance chat (see ADR-002).
- **Phase 2 — optional accounts,** only when cross-device sync earns it. Use
  Supabase (open source, self-hostable, Postgres with row-level security, built-in
  auth with passkeys/OAuth) rather than rolling our own auth. Store derived state,
  not documents.
- **Phase 3 — native mobile,** if justified per Decision 1.

## Decision 3: Security through data minimization

The strongest security control is architectural: **don't hold the data.** Because the
calculation engine is deterministic TypeScript, the entire screening flow runs
client-side; balances, income, family size, and employment history never leave the
device for the math to work. Data we never receive is data we can't breach, and this
posture largely sidesteps the FTC Safeguards Rule (GLBA) obligations that attach once
consumer financial data is collected server-side.

Hard rules:

- Never collect SSN or FSA ID under any circumstances.
- Never ask users for StudentAid.gov credentials; the "My Aid Data" file-export
  approach is the only supported ingestion path.
- No PII transits the AI proxy (enforced mechanically — see ADR-002).
- Strict Content-Security-Policy; TLS everywhere; no third-party trackers on pages
  where financial details are entered.
- Repo hygiene: Dependabot, secret scanning, `SECURITY.md` disclosure policy.
- Analytics, if any, via privacy-respecting open source (Plausible or Umami), never
  Google Analytics — consistent with the student-direct, never-sold ethos.

## Decision 4: Deployment on open-source-friendly, nonprofit-friendly infrastructure

- **Frontend:** Cloudflare Pages or Netlify (free tiers suffice for a static PWA).
  Apply to **Cloudflare Project Galileo** for free enterprise-grade DDoS/WAF
  protection for nonprofits.
- **AI proxy:** Cloudflare Workers or Supabase Edge Functions — no servers to patch.
- **Growth path:** open-source PaaS (e.g. Coolify on a VPS) or Fly.io if a real
  backend emerges; apply for nonprofit cloud credits (AWS/Google/Azure) once
  501(c)(3) status is in place.
- **Pipeline:** GitHub Actions CI running engine tests and demo build on every PR;
  preview deploys per branch; production deploys from `main`.

## Consequences

- v1 has effectively zero infrastructure cost and a minimal attack surface.
- Offline use works (PWA + local engine) for the form-driven flow.
- Accounts/sync are deferred, which is a real product limitation accepted for v1.
- The AI layer is the only component with per-use cost and the only place user-derived
  data can leave the device; it is deliberately thin and swappable (ADR-002).
