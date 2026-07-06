# Deployment

The MVP is a static PWA (ADR-001): no servers, no databases, no secrets in the
app. Deploying means publishing `apps/demo/dist` to a static host and letting
the edge apply the security headers in `apps/demo/public/_headers`.

## Cloudflare Pages (recommended)

One-time setup in the Cloudflare dashboard (Workers & Pages → Create → Pages →
Connect to Git):

| Setting | Value |
|---|---|
| Repository | `venkatchinta/grad-path` |
| Production branch | `main` |
| Build command | `npm run build --workspace=apps/demo` |
| Build output directory | `apps/demo/dist` |

That's the whole deployment: every push to `main` deploys production, and
every PR gets its own preview URL (the beta pipeline in ADR-003). The
`_headers` file ships CSP and the other security headers automatically.

Afterwards:

1. Add the custom domain (e.g. `beta.gradpath.org`) under the project's
   Custom domains tab.
2. Gate the beta: Cloudflare Access (Zero Trust → Access → Applications) in
   front of the beta hostname, per ADR-003.
3. Apply to [Project Galileo](https://www.cloudflare.com/galileo/) for the
   nonprofit security tier once 501(c)(3) paperwork exists.

## Netlify (equivalent alternative)

Same build command and publish directory; `_headers` works there unchanged.

## CI

`.github/workflows/ci.yml` runs on every PR and push to `main`: engine tests,
engine typecheck/build, demo typecheck/build, and uploads the built bundle as
an artifact. Keep the branch protection rule "CI must pass" on `main` so the
host only ever builds green commits.

## Data updates (annual)

The poverty-guideline table in
`packages/engine/src/poverty-guidelines.ts` must be updated each January when
HHS publishes the annual notice — add the new year's entry, a citation to the
Federal Register notice, and tests with the published figures. RAP/IBR/PSLF
rule parameters live in `packages/engine/src/` with their citations alongside.

## First deploy without the dashboard (script)

`scripts/deploy.sh` deploys via wrangler direct upload — useful for the very
first deploy or when the git-connect flow isn't set up yet:

```bash
export CLOUDFLARE_API_TOKEN=...   # token with "Cloudflare Pages — Edit"
export CLOUDFLARE_ACCOUNT_ID=...
./scripts/deploy.sh               # preview deploy from current branch
./scripts/deploy.sh production    # production deploy
```

It runs the tests, builds, creates the Pages project if needed, and uploads
`apps/demo/dist`. The dashboard git-connect flow above remains the recommended
steady state.
