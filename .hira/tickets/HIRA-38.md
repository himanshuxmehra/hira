---
id: HIRA-38
title: Exact timestamps on hover for relative times
status: done
priority: low
tags:
  - board
  - ux
created: 2026-10-02T21:11:59.003Z
updated: 2026-10-02T21:21:50.228Z
---

title attribute with full date/time on every 'Xh ago'.

## Comments

- **2026-10-03 02:51** — Added parseWhen()/whenHtml(): relative times are <time> elements with the full date as tooltip; handles ISO and legacy 'YYYY-MM-DD HH:mm'. Screenshot screenshots/38-hover-timestamp.png shows a simulated tooltip overlay (headless Chrome can't capture native tooltips) rendering the real title attribute.
