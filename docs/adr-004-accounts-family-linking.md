# ADR-004: Accounts and Family Linking

- **Status:** Proposed (workflow mocked in the demo; backend not yet built)
- **Date:** 2026-07-08

## Context

Families go through this journey together: parents want to invite their
student and follow progress collectively. That requires accounts (sign in with
Google or Apple) — which ADR-001 deliberately deferred to Phase 2 to keep the
zero-backend privacy posture. Before building the backend, the full workflow
is **mocked on-device in the demo** (sign-in → role → invite → join → consent
→ family dashboard) to find the missing pieces cheaply.

## Decisions (validated by the mock)

1. **Accounts are optional, forever.** Every screening flow works signed-out.
   The account's value is cross-device sync and family tracking — it is never
   a gate.
2. **Sign in with Google and Apple only** at launch (the audiences: students
   live in Gmail via school accounts; Apple covers iOS users and offers
   private email relay). No passwords to store or breach.
3. **Roles at first sign-in:** student or parent/guardian. Parents get the
   family dashboard; students get join-by-code plus sharing controls.
4. **Invite flow:** parent enters the student's email → server issues a
   short-lived code (`GP-XXXXXX`) and emails a join link → student signs in on
   their own device and accepts. The link never grants the parent access to
   the student's account.
5. **Consent-first sharing, summaries only.** What parents see: Apply steps
   done, schools compared, repayment screening complete. What is never
   synced or shown: incomes, balances, award amounts, documents. Sharing is
   student-toggleable and revocable ("Leave family"), and the sharing screen
   states both lists explicitly. Raw financial data stays on-device per
   ADR-001 — the account syncs progress summaries, not finances.
6. **Stack:** Supabase Auth (Google + Apple OAuth) with Postgres + row-level
   security, per ADR-001 Phase 2. Transactional invite email via a sender
   like Resend/Postmark.

### Schema sketch

```
profiles          (id → auth.users, display_name, role)
families          (id, created_by)
family_members    (family_id, profile_id, role, joined_at)
invites           (code, family_id, sent_to_email, status, expires_at)
progress_summaries(profile_id, apply_done, apply_total,
                   afford_schools, repay_screened, updated_at)
```

RLS: a profile reads its own rows; family members read `progress_summaries`
of other members **only where sharing is enabled**; invites are readable by
issuer and (by code) by the invitee.

## Missing pieces the mock surfaced (build checklist)

- [ ] Terms of service + privacy policy pages (linked from the sign-in
      screen; sign-in cannot ship without them)
- [ ] Account deletion (self-serve, complete — required by Apple/Google
      OAuth policies and basic ethics)
- [ ] Transactional email sender + template for invites (server-side)
- [ ] Invite expiry, resend, and revoke (parent side); wrong-code and
      already-joined error states (student side)
- [ ] Minors: users under 18 — confirm consent flow direction (parent invites
      student, student still consents to sharing); block under-13 accounts
      (COPPA)
- [ ] Multi-student families and a student belonging to two households
      (divorced parents) — the data model supports it; the UI needs it
- [ ] Sync conflict policy for progress (last-write-wins is fine for
      summaries; document it)
- [ ] Sign in with Apple prerequisites: Apple Developer Program membership
      (fee waived for eligible nonprofits), Services ID, domain verification
- [ ] Google OAuth consent screen verification (logo, scopes, privacy URL)
- [ ] Update `_headers` CSP `connect-src` to allow exactly the Supabase
      project origin, and nothing else
- [ ] Session handling in the PWA offline case (cached app shell with an
      expired session must degrade to signed-out gracefully)
- [ ] Update ADR-001's privacy footer copy once accounts exist ("progress
      summaries sync when you sign in; finances never leave your device")

## Consequences

- The demo's auth/family screens are clearly labeled simulations; no real
  account is created and nothing is transmitted. This is a design artifact,
  not shippable auth.
- Building the real thing is Phase 2 work with a real backend, real OAuth
  apps, and the checklist above; the UX is already validated and the privacy
  posture (summaries-only sync) is now written down as a commitment.
