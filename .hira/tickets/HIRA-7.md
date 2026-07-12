---
id: HIRA-7
title: "hira init: write agent snippet to AGENTS.md in addition to CLAUDE.md"
status: done
priority: high
tags:
  - cli
  - init
created: 2026-07-12T18:57:07.966Z
updated: 2026-07-12T18:58:33.310Z
---

AGENTS.md is the cross-tool standard (Codex, Cursor, Copilot, Gemini CLI, Antigravity, Zed, ...). Claude Code still only reads CLAUDE.md, so init should append the full snippet to both files, with per-file duplicate detection. No interactive picker; keep --no-agent-doc to skip.

## Comments

- **2026-07-13 00:28** — Implemented in bin/hira.js: init now loops over AGENTS.md and CLAUDE.md, appending the full snippet to each with per-file duplicate detection (header check). Updated README quick-start + AI agents section, added AGENTS.md to this repo itself. Verified: fresh init writes both files, appends after existing content, skips files that already have the section; node --test passes.
