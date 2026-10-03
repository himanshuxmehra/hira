---
id: HIRA-37
title: Auto-link plain URLs in descriptions and comments
status: done
priority: low
tags:
  - board
  - markdown
created: 2026-10-02T21:11:58.940Z
updated: 2026-10-02T21:21:31.662Z
---

Bare http(s) URLs become links in descriptions and comments.

- plain: see https://github.com/himanshuxmehra/hira for the repo.
- in parentheses (https://example.com/docs) keeps the closing paren outside.
- an explicit [markdown link](https://example.com) still works.
- inside code it stays literal: `https://example.com/not-linked`

## Comments

- **2026-10-03 02:51** — inline() now parks finished HTML behind placeholders; bare URLs link (trailing punctuation and unbalanced ')' stay outside), explicit [text](url) and `code` untouched. Screenshot: screenshots/37-url-autolink.png
