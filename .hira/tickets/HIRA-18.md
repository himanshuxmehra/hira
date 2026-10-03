---
id: HIRA-18
title: "Accessibility: keyboard navigation for cards, tabs, modal"
status: done
priority: medium
tags:
  - board
  - a11y
created: 2026-10-02T21:11:58.034Z
updated: 2026-10-02T21:20:45.001Z
---

Cards focusable buttons/links with Enter/Space, tabs use role=tab/aria-selected, modal traps focus and restores it on close.

## Comments

- **2026-10-03 02:50** — Cards and dashboard rows are focusable role=button (Enter/Space); tabs use role=tab + aria-selected + arrow keys; modal is role=dialog aria-modal, background header/main set inert while open, focus moves to Close and is restored on dismiss; menus support arrow keys and Esc returns focus; global :focus-visible ring. Screenshots: screenshots/18-card-focus-ring.png, 18-modal-focus.png
