import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseTicket, serializeTicket, localDate, commentTimestamp, formatCommentTime } from '../src/core/ticket.js';
import { initStore, findRoot, Store } from '../src/core/store.js';
import { commitUrlFromRemote } from '../src/core/board.js';

test('ticket roundtrip: serialize then parse preserves everything', () => {
  const ticket = {
    id: 'HIRA-7',
    title: 'A title: with a colon & "quotes"',
    status: 'in-progress',
    priority: 'high',
    due: '2026-07-20',
    tags: ['board', 'ui'],
    created: '2026-07-10T10:00:00.000Z',
    updated: '2026-07-10T11:00:00.000Z',
    description: 'Line one.\n\n## A heading\n\n- item one\n- item two\n\n`code` and **bold**.',
    comments: [
      { at: '2026-07-10 14:02', text: 'single line comment' },
      { at: '2026-07-10 15:30', text: 'multi line\ncomment body' },
    ],
  };
  const parsed = parseTicket(serializeTicket(ticket));
  assert.deepEqual(parsed, ticket);
});

test('parse tolerates hand-written frontmatter with unquoted date', () => {
  const raw = `---
id: HIRA-1
title: Hand written
status: todo
due: 2026-08-01
created: 2026-07-10
---

Some text.
`;
  const t = parseTicket(raw);
  assert.equal(t.due, '2026-08-01');
  assert.equal(t.priority, 'medium'); // default
  assert.deepEqual(t.tags, []);
  assert.equal(t.description, 'Some text.');
});

test('store CRUD lifecycle', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hira-test-'));
  try {
    const store = initStore(dir, { prefix: 'TEST' });
    const a = store.create({ title: 'First', priority: 'high', due: '2026-07-15', tags: ['x'] });
    const b = store.create({ title: 'Second', description: 'with body' });
    assert.equal(a.id, 'TEST-1');
    assert.equal(b.id, 'TEST-2');

    assert.equal(findRoot(path.join(dir)), fs.realpathSync(dir) === dir ? dir : findRoot(dir));

    const fresh = new Store(dir);
    assert.equal(fresh.list().length, 2);
    assert.equal(fresh.list({ status: 'todo' }).length, 2);
    assert.equal(fresh.list({ tag: 'x' })[0].id, 'TEST-1');

    fresh.move('1', 'in-progress'); // bare numeric id
    fresh.addComment('test-2', 'a note'); // lowercase id
    assert.equal(fresh.get('TEST-1').status, 'in-progress');
    assert.equal(fresh.get('TEST-2').comments[0].text, 'a note');

    fresh.update('TEST-2', { due: '2026-09-01', tags: ['y', 'z'] });
    const updated = fresh.get('TEST-2');
    assert.equal(updated.due, '2026-09-01');
    assert.deepEqual(updated.tags, ['y', 'z']);

    assert.throws(() => fresh.move('TEST-1', 'bogus'), /Invalid status/);
    assert.throws(() => fresh.create({ title: 'x', due: 'tomorrow' }), /Invalid due date/);
    assert.throws(() => fresh.get('TEST-99'), /not found/);

    fresh.delete('TEST-1');
    assert.equal(fresh.list().length, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('localDate uses the local calendar day, not UTC', () => {
  assert.equal(localDate(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(localDate(new Date(2026, 11, 31, 0, 1)), '2026-12-31');
});

test('comment timestamps are ISO; legacy local stamps still display', () => {
  const at = commentTimestamp(new Date('2026-10-03T02:51:07.000Z'));
  assert.equal(at, '2026-10-03T02:51:07.000Z');
  assert.match(formatCommentTime(at), /^\d{4}-\d\d-\d\d \d\d:\d\d$/);
  assert.equal(formatCommentTime('2026-07-11 02:57'), '2026-07-11 02:57');
  // and they survive a serialize/parse roundtrip
  const t = parseTicket(serializeTicket({ id: 'X-1', title: 't', status: 'todo', priority: 'low', tags: [], comments: [{ at, text: 'hi' }] }));
  assert.equal(t.comments[0].at, at);
});

test('commitUrlFromRemote handles common remote formats', () => {
  const gh = 'https://github.com/o/r/commit/';
  assert.equal(commitUrlFromRemote('https://github.com/o/r.git'), gh);
  assert.equal(commitUrlFromRemote('git@github.com:o/r.git'), gh);
  assert.equal(commitUrlFromRemote('ssh://git@github.com/o/r'), gh);
  assert.equal(commitUrlFromRemote('https://gitlab.com/g/sub/r.git'), 'https://gitlab.com/g/sub/r/-/commit/');
  assert.equal(commitUrlFromRemote('https://example.com/o/r.git'), null);
  assert.equal(commitUrlFromRemote(''), null);
});
