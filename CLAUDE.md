## Task tracking (hira)

This project tracks tasks with **hira**. Tickets are markdown files in `.hira/tickets/`, but always use the CLI so IDs and timestamps stay consistent:

- `hira list --json` — all tickets. Filters: `--status todo|in-progress|done|blocked`, `--priority low|medium|high|urgent`, `--tag <tag>`
- `hira show <id> --json` — one ticket with full description and comments
- `hira add "title" -d "description" -p high --due 2026-08-01 -t tag1,tag2` — create (only title is required)
- `hira move <id> <status>` — change status
- `hira edit <id> --title "..." -d "..." -p urgent --due YYYY-MM-DD` — update fields
- `hira comment <id> "text"` — append a timestamped comment
- `hira delete <id>` — remove a ticket

Workflow for agents:
1. Run `hira list --json` at the start of a session to see project state.
2. When you pick up a task, `hira move <id> in-progress`.
3. Log meaningful progress with `hira comment` (include commit hashes / file paths).
4. `hira move <id> done` when finished; `hira move <id> blocked` + a comment explaining why if stuck.
5. If you discover new work, file it with `hira add` instead of leaving TODOs.
