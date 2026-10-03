---
id: HIRA-11
title: "Theme: dark by default with light toggle"
status: done
priority: high
tags:
  - board
  - ux
created: 2026-10-02T21:11:57.726Z
updated: 2026-10-02T21:14:18.131Z
---

Header button switches dark/light via a data-theme attribute; default dark; choice persisted in localStorage.

## Comments

- **2026-10-03 02:44** — CSS variables now default to dark; :root[data-theme=light] overrides. Head script applies saved theme before paint; header icon button toggles and persists to localStorage (hira-theme). Screenshots: screenshots/11-theme-light.png, 11-theme-dark.png
