#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-/workspace/.env}"

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is not installed in this container" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "No .env file found at $ENV_FILE" >&2
  exit 1
fi

TOKEN="$(grep -E '^NGROK_AUTHTOKEN=' "$ENV_FILE" | tail -n1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')"

if [ -z "${TOKEN:-}" ]; then
  echo "NGROK_AUTHTOKEN not set in $ENV_FILE" >&2
  exit 1
fi

ngrok config add-authtoken "$TOKEN" >/dev/null
echo "ngrok authtoken configured."
