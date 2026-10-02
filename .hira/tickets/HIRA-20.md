---
id: HIRA-20
title: "Markdown: ordered lists, checkboxes, blockquotes; render comments as markdown"
status: done
priority: medium
tags:
  - board
  - markdown
created: 2026-10-02T21:11:58.123Z
updated: 2026-10-02T21:21:11.781Z
---

Extend the minimal md() renderer so ticket text can use more of markdown, and render comments through it.

## Acceptance
- [x] bullet lists
- [x] numbered lists
- [x] task checkboxes
- [ ] nested lists (not planned)

> Blockquotes work too, and can span
> several lines.

Steps to verify:
1. open a ticket with a numbered list
2. check that **bold**, *italic* and `code` still render

## Comments

- **2026-10-03 02:51** — Comments now render markdown too: **bold**, `code`, and lists
  - first
  - second
- **2026-10-03 02:51** — md() rewritten with list-type tracking: ordered lists, - [ ]/- [x] task items, > blockquotes; comments render through md(). Screenshot: screenshots/20-markdown.png (HIRA-20 itself, with sample content)
