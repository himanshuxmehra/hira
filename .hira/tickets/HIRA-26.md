---
id: HIRA-26
title: "Cross-links: HIRA-n becomes a link; modal prev/next (j/k)"
status: done
priority: medium
tags:
  - board
  - ux
created: 2026-10-02T21:11:58.403Z
updated: 2026-10-02T21:25:08.483Z
---

Ticket ids in descriptions and comments open that ticket, and the modal can step through tickets.

- bare id: see HIRA-4 (wiki) and HIRA-3 (MCP)
- wiki style: [[HIRA-22]]
- unknown ids stay plain text: HIRA-999
- ids in `code` or URLs are untouched: `HIRA-4`, https://example.com/HIRA-4
- step with the ‹ › buttons, or j / k (←/→)

## Comments

- **2026-10-02T21:25:08.428Z** — xrefPattern()/inline(): HIRA-n and [[HIRA-n]] link to existing tickets (not inside code/URLs); modal header shows position + ‹ › buttons, j/k and ←/→ step through tickets in board order (respects filters and sorts). Verified j/k stepping and xref click via scripted events. Screenshot: screenshots/26-crosslinks-prev-next.png
