---
id: HIRA-14
title: "Fix: overdue uses local day instead of UTC"
status: todo
priority: high
tags:
  - board
  - bug
created: 2026-10-02T21:11:57.856Z
updated: 2026-10-02T21:11:57.856Z
---

todayStr is computed from toISOString (UTC), so due-today tickets flip to overdue at the wrong hour. Use the local calendar date.
