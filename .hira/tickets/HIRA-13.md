---
id: HIRA-13
title: "Dashboard: recent comments panel"
status: done
priority: high
tags:
  - board
  - dashboard
created: 2026-10-02T21:11:57.812Z
updated: 2026-10-02T21:22:23.896Z
---

Panel listing the latest ~10 comments across all tickets with ticket id/title, excerpt and relative time; click opens the ticket. Store comment timestamps as ISO going forward (old format still parsed).

## Comments

- **2026-10-02T21:22:15.851Z** — Stored comment times are now ISO UTC (src/core/ticket.js commentTimestamp); formatCommentTime() keeps the CLI readable and legacy local stamps still parse. Dashboard gets a full-width 'Recent comments' panel (latest 10, 2-line excerpts, click opens the ticket).
- **2026-10-02T21:22:23.841Z** — (see earlier comment) Excerpts strip ** and backticks. Screenshot: screenshots/13-recent-comments.png. Test added for ISO/legacy comment times.
