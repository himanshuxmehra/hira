---
id: HIRA-12
title: "Sorting: board-wide menu + per-column override"
status: done
priority: high
tags:
  - board
  - ux
created: 2026-10-02T21:11:57.768Z
updated: 2026-10-02T21:19:37.801Z
---

Toolbar 'Sort' menu (Priority, Due date, Recently updated, Newest, ID) applies to all columns; each column header gets a sort button that overrides it for that column (dot indicator). Persisted in localStorage.

## Comments

- **2026-10-03 02:49** — Toolbar 'Sort' button (board-wide) + per-column sort button with override dot; shared popover menu, localStorage prefs (hira-sort). Fixed resize handler closing menus on mobile URL-bar resize. Screenshots: screenshots/12-sort-toolbar.png, 12-sort-board-menu.png, 12-sort-column-menu.png
