# Security Policy

GradPath handles guidance about people's student loan finances, so we treat
security and privacy as product features.

## Architecture posture

- All calculations run on the user's device; financial data (income, balances,
  "My Aid Data" files) is never uploaded or stored on a server.
- The deployed app makes no third-party requests (enforced by CSP in
  `apps/demo/public/_headers`); there are no trackers or analytics on
  data-entry pages.
- We never collect SSNs, FSA IDs, or StudentAid.gov credentials.

## Reporting a vulnerability

Please report privately via GitHub's **[private vulnerability reporting](https://github.com/venkatchinta/grad-path/security/advisories/new)**
(Security tab → Report a vulnerability). Once the custom domain is live,
**security@gradpath.org** will also be monitored. Do not open a public issue
for security reports. We aim to acknowledge reports within 72 hours.

## Scope

The `@gradpath/engine` calculation rules are also in scope: an incorrect
payment or eligibility rule is treated with the same severity as a technical
vulnerability, since users may act on the output. Every rule must cite an
official source — reports of rules that diverge from their cited source are
welcome.
