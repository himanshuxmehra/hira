---
id: HIRA-1
title: Board editing via File System Access API
status: todo
priority: high
tags:
  - board
  - phase2
created: 2026-07-10T08:27:26.152Z
updated: 2026-07-10T08:27:26.152Z
---

Make the static board editable in Chrome/Edge: pick the .hira folder once, then drag-drop between columns writes status changes back to the .md files. Reuse the folder-picker plumbing as the base.

## Notes
- `showDirectoryPicker({ mode: 'readwrite' })`
- needs a frontmatter parser in browser JS
- Safari/Firefox stay read-only
