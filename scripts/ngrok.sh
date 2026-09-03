#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

CONFIG_FILE="${HOME}/.config/ngrok/ngrok.yml"
if [ ! -f "$CONFIG_FILE" ]; then
  "${SCRIPT_DIR}/setup-ngrok.sh"
fi

exec ngrok http "$PORT"
