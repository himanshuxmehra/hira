---
id: HIRA-19
title: Persist view state in URL hash
status: done
priority: medium
tags:
  - board
  - ux
created: 2026-10-02T21:11:58.078Z
updated: 2026-10-02T21:13:36.476Z
---

Active tab and open ticket live in location.hash so reload and links restore them; back button closes the modal.

## Comments

- **2026-10-03 02:43** — Added hash routing to board-template.html: #view=dash, #ticket=HIRA-5. Opening a ticket pushes a history entry so Back closes it; deep-linked tickets close via replace. Screenshots: screenshots/19-hash-ticket.png, 19-hash-dashboard.png
