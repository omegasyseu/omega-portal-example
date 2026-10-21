// The part of a better-sqlite3 connection that knex runs every statement through.
type Connection = { prepare: (source: string) => unknown };

/**
 * A knex pool `afterCreate` for better-sqlite3 that opens every transaction with
 * `BEGIN IMMEDIATE` instead of knex's `BEGIN;`, so it takes the write lock at the start.
 *
 * Why: the seed's Strapi and the server are two processes on one SQLite file. A plain
 * `BEGIN` transaction that reads before it writes, as Strapi's document service does,
 * gets SQLITE_BUSY ("database is locked") at once when the other process holds the write
 * lock, without waiting for the busy timeout, because SQLite can't wait there without
 * risking a deadlock. Taken at `BEGIN`, the lock waits for the busy timeout like any write.
 * Typed as Strapi's pool config types it, which leaves the connection unknown.
 */
export const beginTransactionsImmediately = (
  native: unknown,
  done: (error?: Error, connection?: unknown) => void,
) => {
  const connection = native as Connection;
  const prepare = connection.prepare.bind(connection);
  connection.prepare = (source) => prepare(source === 'BEGIN;' ? 'BEGIN IMMEDIATE;' : source);
  done(undefined, connection);
};
