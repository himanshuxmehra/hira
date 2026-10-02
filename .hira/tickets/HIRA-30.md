---
id: HIRA-30
title: "CLI: auto-regenerate board.html after every change"
status: done
priority: high
tags:
  - cli
  - board
created: 2026-10-02T21:11:58.581Z
updated: 2026-10-02T21:12:38.679Z
---

add/move/edit/comment/delete rewrite .hira/board.html so the snapshot is rarely stale. Untrack board.html and add it to .gitignore.

## Comments

- **2026-10-03 02:42** — bin/hira.js: new refreshBoard() runs after add/move/edit/comment/delete (best-effort). board.html untracked + gitignored. Footer note reworded. Screenshot: screenshots/30-auto-regenerate.png
