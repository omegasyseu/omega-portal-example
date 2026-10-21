'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const knex = require('knex');
const { beginTransactionsImmediately } = require('./sqlite-transactions.ts');

// Long enough for the other process to be waiting on its write before this one writes.
const OTHER_WRITER_HEADSTART_MS = 300;

// Another process writing to the same file, as the Strapi server does while the seed runs.
const otherProcessWrites = (filename) => {
  const writer = spawn(
    process.execPath,
    [
      '-e',
      `const db = new (require('better-sqlite3'))(${JSON.stringify(filename)});
       console.log('writing');
       db.prepare('insert into t values (1)').run();`,
    ],
    { cwd: path.join(__dirname, '..'), stdio: ['ignore', 'pipe', 'inherit'] },
  );
  return { started: once(writer.stdout, 'data'), done: once(writer, 'exit') };
};

test('a transaction that reads before it writes is not refused when another process writes meanwhile', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlite-transactions-'));
  const filename = path.join(dir, 'test.db');
  const db = knex({
    client: 'better-sqlite3',
    connection: { filename },
    useNullAsDefault: true,
    pool: { afterCreate: beginTransactionsImmediately },
  });
  let other;
  t.after(async () => {
    await other?.done;
    await db.destroy();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  await db.schema.createTable('t', (table) => table.integer('n'));
  await db('t').insert({ n: 0 });

  await db.transaction(async (trx) => {
    await trx('t').select('n');
    other = otherProcessWrites(filename);
    await other.started;
    await new Promise((resolve) => setTimeout(resolve, OTHER_WRITER_HEADSTART_MS));
    await trx('t').insert({ n: 10 });
  });

  const [exitCode] = await other.done;
  assert.equal(exitCode, 0);
  assert.deepEqual(
    (await db('t').select('n').orderBy('n')).map(({ n }) => n),
    [0, 1, 10],
  );
});
