#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { Store, findRoot, initStore } from '../src/core/store.js';
import { generateBoard } from '../src/core/board.js';

const pkgDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

const tty = process.stdout.isTTY;
const color = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const bold = color(1), dim = color(2), red = color(31), green = color(32),
  yellow = color(33), blue = color(34), magenta = color(35), cyan = color(36);

const STATUS_PAINT = { 'todo': dim, 'in-progress': blue, 'done': green, 'blocked': red };
const PRIO_PAINT = { 'low': dim, 'medium': cyan, 'high': yellow, 'urgent': red };

function fail(message) {
  console.error(red('error:') + ' ' + message);
  process.exit(1);
}

function requireStore() {
  const root = findRoot();
  if (!root) fail('not a hira project (no .hira/ found in this or any parent directory). Run `hira init` first.');
  return new Store(root);
}

function printTicketLine(t, { statuses, priorities }) {
  const statusW = Math.max(...statuses.map((s) => s.length));
  const prioW = Math.max(...priorities.map((p) => p.length));
  const paintS = STATUS_PAINT[t.status] || ((x) => x);
  const paintP = PRIO_PAINT[t.priority] || ((x) => x);
  let line = `${bold(t.id.padEnd(10))} ${paintS(t.status.padEnd(statusW))}  ${paintP(t.priority.padEnd(prioW))}  ${t.title}`;
  if (t.due) {
    const overdue = t.due < new Date().toISOString().slice(0, 10) && t.status !== 'done';
    line += '  ' + (overdue ? red(`due ${t.due} (overdue)`) : dim(`due ${t.due}`));
  }
  if (t.tags.length) line += '  ' + magenta(t.tags.map((x) => '#' + x).join(' '));
  console.log(line);
}

function parseTags(value) {
  return value.split(',').map((t) => t.trim()).filter(Boolean);
}

const program = new Command();
program
  .name('hira')
  .description('Local Jira + wiki that lives inside your project. Tickets are markdown files in .hira/tickets/.')
  .version(pkg.version);

program
  .command('init')
  .description('initialize hira in the current directory (.hira/, board.html, agent snippet in AGENTS.md + CLAUDE.md)')
  .option('--prefix <prefix>', 'ticket ID prefix (default: derived from directory name)')
  .option('--name <name>', 'project name (default: directory name)')
  .option('--no-agent-doc', 'skip adding the agent instructions to AGENTS.md and CLAUDE.md')
  .action((opts) => {
    let store;
    try {
      store = initStore(process.cwd(), { name: opts.name, prefix: opts.prefix?.toUpperCase() });
    } catch (err) {
      fail(err.message);
    }
    const boardPath = generateBoard(store);
    console.log(green('✓') + ` initialized hira for ${bold(store.config.name)} (prefix ${bold(store.config.prefix)})`);
    console.log(dim(`  tickets:  ${path.relative(process.cwd(), store.ticketsDir)}/`));
    console.log(dim(`  board:    ${path.relative(process.cwd(), boardPath)}`));
    if (opts.agentDoc) {
      const snippet = fs.readFileSync(path.join(pkgDir, 'src', 'templates', 'agent-snippet.md'), 'utf8');
      for (const name of ['AGENTS.md', 'CLAUDE.md']) {
        const file = path.join(process.cwd(), name);
        const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
        if (existing.includes('## Task tracking (hira)')) {
          console.log(dim(`  ${name} already has the hira section, skipped`));
        } else {
          fs.writeFileSync(file, existing + (existing && !existing.endsWith('\n\n') ? '\n\n' : '') + snippet);
          console.log(green('✓') + ` added agent instructions to ${name}`);
        }
      }
    }
    console.log(`\nCreate your first ticket:  ${cyan('hira add "My first task" -p high')}`);
  });

program
  .command('add <title>')
  .description('create a ticket')
  .option('-d, --description <text>', 'description (markdown)', '')
  .option('-p, --priority <priority>', 'low | medium | high | urgent', 'medium')
  .option('-s, --status <status>', 'todo | in-progress | done | blocked', 'todo')
  .option('--due <date>', 'due date, YYYY-MM-DD')
  .option('-t, --tags <tags>', 'comma-separated tags', parseTags, [])
  .option('--json', 'print the created ticket as JSON')
  .action((title, opts) => {
    const store = requireStore();
    let ticket;
    try {
      ticket = store.create({
        title, description: opts.description, priority: opts.priority,
        status: opts.status, due: opts.due, tags: opts.tags,
      });
    } catch (err) {
      fail(err.message);
    }
    if (opts.json) return console.log(JSON.stringify(ticket, null, 2));
    console.log(green('✓') + ` created ${bold(ticket.id)}: ${ticket.title}`);
  });

program
  .command('list')
  .description('list tickets')
  .option('-s, --status <status>', 'filter by status')
  .option('-p, --priority <priority>', 'filter by priority')
  .option('-t, --tag <tag>', 'filter by tag')
  .option('--json', 'output JSON')
  .action((opts) => {
    const store = requireStore();
    const tickets = store.list({ status: opts.status, priority: opts.priority, tag: opts.tag });
    if (opts.json) return console.log(JSON.stringify(tickets, null, 2));
    if (tickets.length === 0) return console.log(dim('no tickets' + (opts.status || opts.priority || opts.tag ? ' match the filter' : ' yet — create one with `hira add "title"`')));
    for (const status of store.config.statuses) {
      const group = tickets.filter((t) => t.status === status);
      if (group.length === 0) continue;
      for (const t of group) printTicketLine(t, store.config);
    }
    const open = tickets.filter((t) => t.status !== 'done').length;
    console.log(dim(`\n${tickets.length} ticket${tickets.length === 1 ? '' : 's'}, ${open} open`));
  });

program
  .command('show <id>')
  .description('show one ticket in full')
  .option('--json', 'output JSON')
  .action((id, opts) => {
    const store = requireStore();
    let t;
    try { t = store.get(id); } catch (err) { fail(err.message); }
    if (opts.json) return console.log(JSON.stringify(t, null, 2));
    const paintS = STATUS_PAINT[t.status] || ((x) => x);
    console.log(`${bold(t.id)}  ${paintS(t.status)}  ${(PRIO_PAINT[t.priority] || dim)(t.priority)}`);
    console.log(bold(t.title));
    const meta = [];
    if (t.due) meta.push(`due ${t.due}`);
    if (t.tags.length) meta.push(t.tags.map((x) => '#' + x).join(' '));
    meta.push(`created ${t.created?.slice(0, 10)}`, `updated ${t.updated?.slice(0, 10)}`);
    console.log(dim(meta.join('  ·  ')));
    if (t.description) console.log('\n' + t.description);
    if (t.comments.length) {
      console.log('\n' + bold('Comments'));
      for (const c of t.comments) console.log(dim(`  ${c.at}`) + `  ${c.text.replace(/\n/g, '\n  ')}`);
    }
  });

program
  .command('move <id> <status>')
  .description('change a ticket\'s status (todo | in-progress | done | blocked)')
  .action((id, status) => {
    const store = requireStore();
    let t;
    try { t = store.move(id, status); } catch (err) { fail(err.message); }
    const paint = STATUS_PAINT[status] || ((x) => x);
    console.log(green('✓') + ` ${bold(t.id)} → ${paint(status)}`);
  });

program
  .command('edit <id>')
  .description('edit ticket fields')
  .option('--title <title>')
  .option('-d, --description <text>')
  .option('-p, --priority <priority>')
  .option('-s, --status <status>')
  .option('--due <date>', 'YYYY-MM-DD, or "none" to clear')
  .option('-t, --tags <tags>', 'comma-separated, replaces existing tags', parseTags)
  .action((id, opts) => {
    const store = requireStore();
    const patch = {};
    if (opts.title !== undefined) patch.title = opts.title;
    if (opts.description !== undefined) patch.description = opts.description;
    if (opts.priority !== undefined) patch.priority = opts.priority;
    if (opts.status !== undefined) patch.status = opts.status;
    if (opts.due !== undefined) patch.due = opts.due === 'none' ? null : opts.due;
    if (opts.tags !== undefined) patch.tags = opts.tags;
    if (Object.keys(patch).length === 0) fail('nothing to change — pass at least one field flag (see `hira edit --help`)');
    let t;
    try { t = store.update(id, patch); } catch (err) { fail(err.message); }
    console.log(green('✓') + ` updated ${bold(t.id)} (${Object.keys(patch).join(', ')})`);
  });

program
  .command('comment <id> <text>')
  .description('append a timestamped comment')
  .action((id, text) => {
    const store = requireStore();
    let t;
    try { t = store.addComment(id, text); } catch (err) { fail(err.message); }
    console.log(green('✓') + ` commented on ${bold(t.id)}`);
  });

program
  .command('delete <id>')
  .description('delete a ticket file')
  .action((id) => {
    const store = requireStore();
    let deleted;
    try { deleted = store.delete(id); } catch (err) { fail(err.message); }
    console.log(green('✓') + ` deleted ${bold(deleted)}`);
  });

program
  .command('board')
  .description('regenerate .hira/board.html with current data and open it in the browser')
  .option('--no-open', 'regenerate only, don\'t open the browser')
  .action((opts) => {
    const store = requireStore();
    const boardPath = generateBoard(store);
    const count = store.list().length;
    console.log(green('✓') + ` regenerated ${path.relative(process.cwd(), boardPath)} (${count} ticket${count === 1 ? '' : 's'})`);
    if (opts.open) {
      const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      execFile(opener, [boardPath], (err) => {
        if (err) console.log(dim(`  couldn't auto-open; open it manually: ${boardPath}`));
      });
    }
  });

program.parse();
