---
id: HIRA-24
title: "Ticket modal: copy CLI commands and file path"
status: done
priority: medium
tags:
  - board
  - ux
created: 2026-10-02T21:11:58.312Z
updated: 2026-10-02T21:24:18.897Z
---

Buttons to copy 'hira move <id> <status>', 'hira comment <id> ""' and the ticket .md path. Show the file path in the modal.

## Comments

- **2026-10-02T21:24:18.844Z** — Ticket modal gets a 'Command line' section: hira move <id> <status> (with status picker, pre-selected to the usual next step), hira comment, hira show and the .hira/tickets/<id>.md path, each with a Copy button (clipboard API with execCommand fallback). Screenshot: screenshots/24-copy-commands.png
