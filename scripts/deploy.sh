#!/usr/bin/env bash
# Deploy the GradPath PWA to Cloudflare Pages via direct upload.
#
# One-time prerequisites:
#   1. A Cloudflare account (free tier is fine): https://dash.cloudflare.com/sign-up
#   2. An API token with the "Cloudflare Pages — Edit" permission:
#      dash.cloudflare.com → My Profile → API Tokens → Create Token
#   3. Your account ID (dash.cloudflare.com → any zone → right sidebar, or
#      Workers & Pages overview URL).
#
# Usage:
#   export CLOUDFLARE_API_TOKEN=...
#   export CLOUDFLARE_ACCOUNT_ID=...
#   ./scripts/deploy.sh            # deploys a preview from the current branch
#   ./scripts/deploy.sh production # deploys to the production URL
#
# Prefer the dashboard git-connect flow (docs/deployment.md) for the long
# term — it deploys every push automatically. This script is for the first
# deploy and for deploying from a laptop without dashboard access.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT="${PAGES_PROJECT:-gradpath}"
MODE="${1:-preview}"

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN (Pages Edit permission)}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"

echo "==> Test"
npm test

echo "==> Build"
npm run build

echo "==> Ensure Pages project '$PROJECT' exists"
npx wrangler pages project list 2>/dev/null | grep -q "\b$PROJECT\b" ||
  npx wrangler pages project create "$PROJECT" --production-branch main

BRANCH_FLAG=()
if [ "$MODE" = "production" ]; then
  BRANCH_FLAG=(--branch main)
else
  BRANCH_FLAG=(--branch "$(git rev-parse --abbrev-ref HEAD)")
fi

echo "==> Deploy ($MODE)"
npx wrangler pages deploy apps/demo/dist --project-name "$PROJECT" "${BRANCH_FLAG[@]}"

echo
echo "Done. Next steps (one-time, in the Cloudflare dashboard):"
echo "  - Custom domain: Workers & Pages → $PROJECT → Custom domains"
echo "  - Beta gate:     Zero Trust → Access → Applications (per ADR-003)"
echo "  - Nonprofit WAF: apply at https://www.cloudflare.com/galileo/"
