---
id: HIRA-8
title: "Trim session-start token cost: compact list in agent snippet /
  summary-only list --json"
status: todo
priority: low
tags:
  - cli
  - agents
created: 2026-07-12T19:35:19.629Z
updated: 2026-07-12T19:35:31.697Z
---

hira list --json emits full descriptions + comments for every ticket (~4.4KB for 7 tickets vs ~650B for the plain table). At scale this bloats agent context at session start.

Options:
1. Snippet-only: recommend plain 'hira list' (or -s todo) at session start, --json/show only when parsing/detail needed.
2. Code: make list --json summary-only (drop description/comments; show --json keeps full detail). Minor-version bump since it changes parsed output.
