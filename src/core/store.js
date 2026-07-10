import fs from 'node:fs';
import path from 'node:path';
import {
  parseTicket,
  serializeTicket,
  commentTimestamp,
  STATUSES,
  PRIORITIES,
} from './ticket.js';

const HIRA_DIR = '.hira';

/** Walk up from startDir looking for a .hira directory. Returns the project root or null. */
export function findRoot(startDir = process.cwd()) {
  let dir = path.resolve(startDir);
  while (true) {
    if (fs.existsSync(path.join(dir, HIRA_DIR, 'config.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Create .hira/ in dir. Throws if already initialized. */
export function initStore(dir, { name, prefix } = {}) {
  const hiraDir = path.join(dir, HIRA_DIR);
  if (fs.existsSync(path.join(hiraDir, 'config.json'))) {
    throw new Error(`Already initialized: ${hiraDir}`);
  }
  const projectName = name || path.basename(path.resolve(dir));
  const config = {
    name: projectName,
    prefix: prefix || derivePrefix(projectName),
    nextId: 1,
    statuses: STATUSES,
    priorities: PRIORITIES,
  };
  fs.mkdirSync(path.join(hiraDir, 'tickets'), { recursive: true });
  fs.writeFileSync(path.join(hiraDir, 'config.json'), JSON.stringify(config, null, 2) + '\n');
  return new Store(dir);
}

function derivePrefix(name) {
  const clean = name.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.slice(0, 8) || 'TASK';
}

export class Store {
  constructor(root) {
    this.root = root;
    this.hiraDir = path.join(root, HIRA_DIR);
    this.ticketsDir = path.join(this.hiraDir, 'tickets');
    this.configPath = path.join(this.hiraDir, 'config.json');
    this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2) + '\n');
  }

  ticketPath(id) {
    return path.join(this.ticketsDir, `${id}.md`);
  }

  list({ status, priority, tag } = {}) {
    if (!fs.existsSync(this.ticketsDir)) return [];
    const tickets = [];
    for (const file of fs.readdirSync(this.ticketsDir)) {
      if (!file.endsWith('.md')) continue;
      try {
        const ticket = parseTicket(fs.readFileSync(path.join(this.ticketsDir, file), 'utf8'));
        if (!ticket.id) ticket.id = path.basename(file, '.md');
        tickets.push(ticket);
      } catch (err) {
        process.emitWarning(`Skipping unparseable ticket file ${file}: ${err.message}`);
      }
    }
    let result = tickets;
    if (status) result = result.filter((t) => t.status === status);
    if (priority) result = result.filter((t) => t.priority === priority);
    if (tag) result = result.filter((t) => t.tags.includes(tag));
    return result.sort((a, b) => ticketNumber(a.id) - ticketNumber(b.id));
  }

  get(id) {
    const resolved = this.resolveId(id);
    const file = this.ticketPath(resolved);
    if (!fs.existsSync(file)) throw new Error(`Ticket not found: ${id}`);
    const ticket = parseTicket(fs.readFileSync(file, 'utf8'));
    if (!ticket.id) ticket.id = resolved;
    return ticket;
  }

  /** Accepts "HIRA-3", "hira-3", or bare "3". */
  resolveId(id) {
    const raw = String(id).trim();
    if (/^\d+$/.test(raw)) return `${this.config.prefix}-${raw}`;
    const match = /^([a-z0-9]+)-(\d+)$/i.exec(raw);
    if (match) return `${match[1].toUpperCase()}-${match[2]}`;
    return raw;
  }

  create({ title, description = '', status = 'todo', priority = 'medium', due, tags = [] }) {
    if (!title || !title.trim()) throw new Error('Title is required');
    this.validateStatus(status);
    this.validatePriority(priority);
    if (due) validateDueDate(due);
    const id = `${this.config.prefix}-${this.config.nextId}`;
    const now = new Date().toISOString();
    const ticket = {
      id,
      title: title.trim(),
      status,
      priority,
      due,
      tags,
      created: now,
      updated: now,
      description,
      comments: [],
    };
    fs.writeFileSync(this.ticketPath(id), serializeTicket(ticket));
    this.config.nextId += 1;
    this.saveConfig();
    return ticket;
  }

  update(id, patch) {
    const ticket = this.get(id);
    if (patch.status !== undefined) this.validateStatus(patch.status);
    if (patch.priority !== undefined) this.validatePriority(patch.priority);
    if (patch.due !== undefined && patch.due !== null) validateDueDate(patch.due);
    const allowed = ['title', 'status', 'priority', 'due', 'tags', 'description'];
    for (const key of allowed) {
      if (patch[key] !== undefined) ticket[key] = patch[key] === null ? undefined : patch[key];
    }
    ticket.updated = new Date().toISOString();
    fs.writeFileSync(this.ticketPath(ticket.id), serializeTicket(ticket));
    return ticket;
  }

  move(id, status) {
    return this.update(id, { status });
  }

  addComment(id, text) {
    if (!text || !text.trim()) throw new Error('Comment text is required');
    const ticket = this.get(id);
    ticket.comments.push({ at: commentTimestamp(), text: text.trim() });
    ticket.updated = new Date().toISOString();
    fs.writeFileSync(this.ticketPath(ticket.id), serializeTicket(ticket));
    return ticket;
  }

  delete(id) {
    const resolved = this.resolveId(id);
    const file = this.ticketPath(resolved);
    if (!fs.existsSync(file)) throw new Error(`Ticket not found: ${id}`);
    fs.unlinkSync(file);
    return resolved;
  }

  validateStatus(status) {
    if (!this.config.statuses.includes(status)) {
      throw new Error(`Invalid status "${status}". Valid: ${this.config.statuses.join(', ')}`);
    }
  }

  validatePriority(priority) {
    if (!this.config.priorities.includes(priority)) {
      throw new Error(`Invalid priority "${priority}". Valid: ${this.config.priorities.join(', ')}`);
    }
  }
}

function ticketNumber(id) {
  const match = /(\d+)$/.exec(id ?? '');
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function validateDueDate(due) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(Date.parse(due))) {
    throw new Error(`Invalid due date "${due}". Use YYYY-MM-DD.`);
  }
}
