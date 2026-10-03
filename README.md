# hira

[![npm](https://img.shields.io/npm/v/hira-board)](https://www.npmjs.com/package/hira-board)

[![Watch the 15-second demo](https://raw.githubusercontent.com/himanshuxmehra/hira/main/promo/hira-promo-poster.png)](https://github.com/himanshuxmehra/hira/blob/main/promo/hira-promo.mp4)

Git-native task tracking for you and your AI agents. Tickets are plain markdown files in `.hira/tickets/`, managed by a CLI your agents can drive, viewed on a static kanban board + dashboard.

No server, no account, no database. Everything is files, so it versions with your repo — think of it as a local Jira your coding agents can actually use.

## Install

```sh
npm install -g hira-board   # or: npm link from this repo
npx hira-board list         # or run without installing
```

The package is `hira-board`; the command it installs is `hira`.

## Quick start

```sh
cd your-project
hira init                      # creates .hira/, board.html, agent snippet in AGENTS.md + CLAUDE.md
hira add "Fix login bug" -p urgent --due 2026-07-20 -t auth,bug
hira add "Write docs" -d "Cover setup + API.

## Notes
- start from the README"
hira list
hira move 1 in-progress
hira comment 1 "found the cause, session cookie expiry"
hira move 1 done
hira board                     # regenerates + opens the board in your browser
```

## Commands

| Command | What it does |
|---|---|
| `hira init [--prefix ABC] [--name x] [--no-agent-doc]` | Set up `.hira/` in the current directory |
| `hira add <title> [-d desc] [-p prio] [-s status] [--due YYYY-MM-DD] [-t a,b]` | Create a ticket |
| `hira list [-s status] [-p prio] [-t tag] [--json]` | List tickets |
| `hira show <id> [--json]` | One ticket in full (description + comments) |
| `hira move <id> <status>` | Change status |
| `hira edit <id> [--title] [-d] [-p] [-s] [--due] [-t]` | Update fields (`--due none` clears it) |
| `hira comment <id> <text>` | Append a timestamped comment |
| `hira delete <id>` | Remove a ticket |
| `hira board [--no-open]` | Regenerate `.hira/board.html` snapshot and open it |

IDs are forgiving: `hira move HIRA-3 done`, `hira move hira-3 done`, and `hira move 3 done` all work.

- **Statuses:** `todo`, `in-progress`, `done`, `blocked`
- **Priorities:** `low`, `medium`, `high`, `urgent`

## Ticket format

One markdown file per ticket — readable, hand-editable, git-friendly:

```markdown
---
id: HIRA-12
title: Add drag-drop to board
status: in-progress
priority: high
due: 2026-07-20
tags:
  - board
  - ui
created: 2026-07-10T08:23:45.000Z
updated: 2026-07-10T09:10:02.000Z
---

Board cards should be draggable between columns.

## Notes
Looked at SortableJS — tiny, no deps.

## Comments

- **2026-07-10T14:02:11.000Z** — blocked on API route
```

Comment timestamps are stored as UTC ISO-8601 instants and shown in your local time by `hira show` and the board. Older `YYYY-MM-DD HH:mm` comments are still read as-is.

## The board

`hira board` bakes current ticket data into a self-contained `.hira/board.html` that works in any browser with no server. It is a **snapshot**, but every `hira add/move/edit/comment/delete` rebuilds it automatically, so just reload the page (the file is gitignored; run `hira board` after cloning). A snapshot more than a day old shows a warning banner.

Commit hashes in tickets and comments link to GitHub or GitLab when the repo's `origin` remote points to either one.

- **Board** — per-column scrolling, search (`/`), status/priority/tag filters, board-wide and per-column sort, hide columns, compact cards, swimlanes by priority or tag, "Copy as table" (markdown) for standups
- **List** — sortable table sharing the same filters
- **Dashboard** — clickable status tiles, priority chart, flow stats, progress and open tickets by tag, stale tickets, weekly created-vs-completed, recent comments
- **Ticket view** — markdown (lists, checkboxes, quotes, links), `HIRA-3` cross-links, commit-hash links to GitHub/GitLab, related tickets, copy-ready `hira` commands, `j`/`k` to step through tickets
- **Around the edges** — dark (default) / light toggle, `Cmd/Ctrl+K` quick jump, `?` for shortcuts, "since your last visit" markers, state in the URL hash (shareable filtered views), print styles

## AI agents

`hira init` appends a section to your project's `AGENTS.md` (the cross-tool standard read by Codex, Cursor, Copilot, Gemini CLI, Antigravity, Zed, and others) and `CLAUDE.md` (Claude Code) teaching agents the workflow: check `hira list --json` at session start, move tickets to `in-progress` when picking them up, log progress with `hira comment`, and file discovered work with `hira add`. Any agent that can run shell commands can use hira; `--json` flags make output machine-parseable.

## Library use

The core is importable if you want to build on it:

```js
import { Store, findRoot, initStore, formatCommentTime, localDate } from 'hira-board';

const store = new Store(findRoot());
store.create({ title: 'From code', priority: 'high' });
console.log(store.list({ status: 'todo' }));
```

## Roadmap

- Editing from the board (File System Access API — drag-drop that writes back to the files)
- `hira board --watch` live-reload server mode
- MCP server for typed agent tool-calls
- Wiki pages (`.hira/wiki/`) with cross-linking to tickets
