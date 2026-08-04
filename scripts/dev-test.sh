#!/usr/bin/env bash
set -euo pipefail

# Starts the MCP server over stdio. A real MCP client should connect to it.
npm run dev
