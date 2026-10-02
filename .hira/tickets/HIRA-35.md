---
id: HIRA-35
title: Link commit hashes in comments to GitHub
status: done
priority: low
tags:
  - board
  - git
created: 2026-10-02T21:11:58.805Z
updated: 2026-10-02T21:25:39.895Z
---

At build time read the git remote; turn 7-40 hex commit hashes into links to the commit.

## Comments

- **2026-10-02T21:25:31.553Z** — Implemented across fdf22d5 and c3a6432 (hashes like these should now be links); version 1234567 and the word defaced are left alone.
- **2026-10-02T21:25:39.832Z** — board.js: commitUrlFromRemote() (GitHub/GitLab; https, ssh://, scp-style) + commitUrl baked into board data; inline() links 7-40 char hex hashes containing a digit and a letter. Tests added. Screenshot: screenshots/35-commit-links.png
