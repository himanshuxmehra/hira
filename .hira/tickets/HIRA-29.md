---
id: HIRA-29
title: "Polish: stale-snapshot warning, friendly empty columns, print styles, ?
  shortcuts overlay"
status: done
priority: low
tags:
  - board
  - ux
created: 2026-10-02T21:11:58.537Z
updated: 2026-10-02T21:34:20.275Z
---

Warn when snapshot older than a day; per-status empty messages; @media print; ? opens shortcut help.

## Comments

- **2026-10-02T21:34:20.207Z** — (1) renderSnapshotNote(): header note shortened + warning banner when the snapshot is >1 day old. (2) per-status empty-column messages ('Nothing blocked'; 'No matches' under filters). (3) @media print: forced light palette, controls hidden, flat 4-column layout. (4) '?' shortcuts overlay + header button. Header crowding fixed by truncating the note. Screenshots: screenshots/29-stale-snapshot.png (age simulated: 3 days), 29-shortcuts-help.png, 29-print-layout.png (Chrome print-to-PDF)
