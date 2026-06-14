#!/usr/bin/env bash
set -euo pipefail

echo "BetRight local QA helper"
echo "This script is a placeholder. The qa-platform-runner agent should adapt it to the actual repo scripts."

if [ -f "package.json" ]; then
  echo "Detected package.json"
  npm run lint --if-present
  npm run typecheck --if-present
  npm test --if-present
fi

if [ -f "docker-compose.yml" ]; then
  echo "Detected docker-compose.yml"
  docker compose ps
fi

echo "Next: start app/backend and run Playwright/Maestro tests as configured."
