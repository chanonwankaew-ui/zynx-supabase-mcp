#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_PATH="$PROJECT_DIR/dist/index.js"

if [ ! -f "$SERVER_PATH" ]; then
  echo "Missing dist/index.js. Run: npm install && npm run build"
  exit 1
fi

gemini mcp add zynx-supabase node "$SERVER_PATH"
echo "Registered zynx-supabase MCP server with Gemini CLI."
