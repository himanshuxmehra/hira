---
id: HIRA-10
title: "Board: each column scrolls independently"
status: done
priority: high
tags:
  - board
  - ux
created: 2026-10-02T21:11:57.675Z
updated: 2026-10-02T21:14:51.526Z
---

Board fills the viewport below the header; each column's cards scroll inside it with a sticky column header; page itself does not scroll on the Board tab. On narrow screens (stacked columns) fall back to normal page scroll.

## Comments

- **2026-10-03 02:44** — Layout is now a flex column (header + main); on the Board tab main stops scrolling and each .cards list scrolls with a sticky column header. Below 720px columns stack and the page scrolls. Screenshots: screenshots/10-column-scroll.png, 10-column-scroll-narrow.png
