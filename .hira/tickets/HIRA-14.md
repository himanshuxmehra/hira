---
id: HIRA-14
title: "Fix: overdue uses local day instead of UTC"
status: done
priority: high
due: 2026-10-03
tags:
  - board
  - bug
created: 2026-10-02T21:11:57.856Z
updated: 2026-10-02T21:12:59.593Z
---

todayStr is computed from toISOString (UTC), so due-today tickets flip to overdue at the wrong hour. Use the local calendar date.

## Comments

- **2026-10-03 02:42** — Added localDate() in src/core/ticket.js (exported); used by bin/hira.js and a local-date todayStr in the board template. Test added. Screenshot: screenshots/14-overdue-local-day.png
