#!/usr/bin/env bash
#
# Turns on the account system: sets the two Supabase values as GitHub Actions
# repository variables, redeploys, and verifies the buttons actually appear.
#
#   ./scripts/enable-accounts.sh <SUPABASE_URL> <SUPABASE_ANON_KEY>
#
# Both values are PUBLIC by design — they are shipped in the browser bundle of
# every Supabase site. They are stored as Actions *variables*, not secrets,
# because calling them secrets would imply a confidentiality the build cannot
# provide. Row Level Security is what protects your data.
set -euo pipefail

REPO="${REPO:-vetrip02-bit/threadloom}"
SITE="${SITE:-https://vetrip02-bit.github.io/threadloom}"

URL="${1:-}"
KEY="${2:-}"

if [[ -z "$URL" || -z "$KEY" ]]; then
  echo "usage: $0 <SUPABASE_URL> <SUPABASE_ANON_KEY>" >&2
  exit 2
fi

# Fail early on an obviously wrong value rather than after a 2-minute deploy.
if [[ ! "$URL" =~ ^https://[a-z0-9-]+\.supabase\.(co|in)$ ]]; then
  echo "error: SUPABASE_URL should look like https://abcdefgh.supabase.co" >&2
  echo "       got: $URL" >&2
  exit 1
fi
if [[ ${#KEY} -lt 40 ]]; then
  echo "error: that anon key looks too short (${#KEY} chars)." >&2
  echo "       Copy the 'anon public' key, not the project ref." >&2
  exit 1
fi
if [[ "$KEY" == *"service_role"* ]]; then
  echo "error: that looks like the SERVICE ROLE key. Never put it in a" >&2
  echo "       browser bundle — it bypasses Row Level Security." >&2
  echo "       Use the 'anon public' key instead." >&2
  exit 1
fi

echo "Checking the Supabase project is reachable…"
if ! curl -sf --max-time 15 -o /dev/null "$URL/auth/v1/health" -H "apikey: $KEY"; then
  echo "warning: could not reach $URL/auth/v1/health — continuing anyway." >&2
fi

echo "Setting repository variables on $REPO…"
gh variable set NEXT_PUBLIC_SUPABASE_URL      --repo "$REPO" --body "$URL"
gh variable set NEXT_PUBLIC_SUPABASE_ANON_KEY --repo "$REPO" --body "$KEY"

echo "Triggering a redeploy…"
gh workflow run deploy.yml --repo "$REPO"
sleep 12

echo -n "Waiting for the deploy"
for _ in $(seq 1 40); do
  STATUS=$(gh run list --repo "$REPO" --limit 1 --json status,conclusion \
            -q '.[0].status + "/" + (.[0].conclusion // "pending")')
  [[ "$STATUS" == completed/* ]] && { echo " -> $STATUS"; break; }
  echo -n "."
  sleep 15
done
echo

sleep 10
echo "Verifying the live site…"
if curl -s --max-time 25 "$SITE/signin/" | grep -q "Accounts are not enabled"; then
  echo "FAILED: /signin still reports accounts disabled."
  echo "        Check the workflow log: gh run view --repo $REPO --log-failed"
  exit 1
fi
echo "  /signin now serves the real login form"

if curl -s --max-time 25 "$SITE/signup/" | grep -q "Set up your trade account"; then
  echo "  /signup now serves the registration form"
fi

echo
echo "Done. Log in / Sign up should now appear at $SITE"
