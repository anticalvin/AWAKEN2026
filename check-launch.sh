#!/usr/bin/env bash
# Launch checklist. Exits 1 and lists file:line for anything not ready to go public.
cd "$(dirname "$0")" || exit 1
FILES=$(ls ./*.html ./*.js ./*.css 2>/dev/null)
fail=0
flag() { # label, pattern, [files]
  local out
  out=$(grep -nE "$2" ${3:-$FILES} 2>/dev/null | cut -c1-120)
  if [ -n "$out" ]; then echo "== $1"; echo "$out"; fail=1; fi
}
flag "Owner to confirm" 'OWNER TO CONFIRM'
flag "TODO" 'TODO'
flag "YOUR_ placeholder" 'YOUR_'
# Pages marked noindex are not part of the launch, so they are skipped for image checks.
PUBLIC=$(grep -LE 'name="robots" content="[^"]*noindex' $FILES)
flag "placehold.co" 'placehold\.co' "$PUBLIC"
flag "Hotlinked i.ibb.co image" 'i\.ibb\.co' "$PUBLIC"
flag "Drop closesAt not set" 'closesAt: *null' drop.js
flag "Drop shipsBy not set" 'shipsBy: *null' drop.js
flag "Password gate still on" 'GATE_ENABLED *= *true' gate.js
if grep -qE "plausibleDomain: *''" analytics.js && grep -qE "ga4Id: *''" analytics.js; then
  echo "== Analytics ids empty"; grep -nE "plausibleDomain|ga4Id" analytics.js; fail=1
fi
if [ $fail -eq 0 ]; then echo READY; else echo "NOT READY"; exit 1; fi
