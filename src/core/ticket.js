import YAML from 'yaml';

export const STATUSES = ['todo', 'in-progress', 'done', 'blocked'];
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const FRONTMATTER_KEYS = ['id', 'title', 'status', 'priority', 'due', 'tags', 'created', 'updated'];
const COMMENTS_HEADING = /^## Comments\s*$/m;
const COMMENT_ITEM = /^- \*\*(.+?)\*\* — ?/;

/**
 * Parse a ticket .md file (YAML frontmatter + markdown body) into an object:
 * { id, title, status, priority, due, tags, created, updated, description, comments }
 * where comments is [{ at, text }].
 */
export function parseTicket(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) {
    throw new Error('Not a valid ticket file: missing YAML frontmatter');
  }
  const meta = YAML.parse(match[1]) ?? {};
  const body = raw.slice(match[0].length);

  const headingMatch = COMMENTS_HEADING.exec(body);
  let description = body;
  let comments = [];
  if (headingMatch) {
    description = body.slice(0, headingMatch.index);
    comments = parseComments(body.slice(headingMatch.index + headingMatch[0].length));
  }

  return {
    id: meta.id != null ? String(meta.id) : undefined,
    title: meta.title != null ? String(meta.title) : '',
    status: meta.status ?? 'todo',
    priority: meta.priority ?? 'medium',
    due: normalizeDate(meta.due),
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
    created: normalizeTimestamp(meta.created),
    updated: normalizeTimestamp(meta.updated),
    description: description.trim(),
    comments,
  };
}

function parseComments(section) {
  const comments = [];
  let current = null;
  for (const line of section.split(/\r?\n/)) {
    const item = COMMENT_ITEM.exec(line);
    if (item) {
      if (current) comments.push(current);
      current = { at: item[1], text: line.slice(item[0].length) };
    } else if (current && /^ {2,}/.test(line)) {
      current.text += '\n' + line.replace(/^ {2}/, '');
    } else if (current && line.trim() === '') {
      // blank line inside/after a comment; keep only if more text follows
      current.text += '\n';
    }
  }
  if (current) comments.push(current);
  for (const c of comments) c.text = c.text.trim();
  return comments;
}

export function serializeTicket(ticket) {
  const meta = {};
  for (const key of FRONTMATTER_KEYS) {
    const value = ticket[key];
    if (value === undefined || value === null || value === '') continue;
    if (key === 'tags' && value.length === 0) continue;
    meta[key] = value;
  }
  let out = '---\n' + YAML.stringify(meta) + '---\n';
  out += '\n' + (ticket.description ? ticket.description.trim() + '\n' : '');
  if (ticket.comments && ticket.comments.length > 0) {
    out += '\n## Comments\n\n';
    for (const comment of ticket.comments) {
      const [first, ...rest] = comment.text.split('\n');
      out += `- **${comment.at}** — ${first}\n`;
      for (const line of rest) out += line.trim() === '' ? '\n' : `  ${line}\n`;
    }
  }
  return out;
}

/** YAML may parse unquoted dates into Date objects; keep YYYY-MM-DD strings. */
function normalizeDate(value) {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function normalizeTimestamp(value) {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** Timestamp used in comment entries: local "YYYY-MM-DD HH:mm". */
export function commentTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Today's local calendar date as YYYY-MM-DD (due dates are local, so never derive this from UTC). */
export function localDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
