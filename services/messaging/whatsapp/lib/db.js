import { createSqliteConnector, SQLITE_DB_PATH } from "./db/connectors/sqlite.js";
import { createPostgresConnector } from "./db/connectors/postgres.js";

export const DB_CONNECTOR = (process.env.DB_CONNECTOR || "sqlite").toLowerCase();

const FACTORIES = {
  sqlite: createSqliteConnector,
  postgres: createPostgresConnector,
  supabase: createPostgresConnector, // alias
};

const factory = FACTORIES[DB_CONNECTOR];
if (!factory) {
  throw new Error(
    `Unsupported DB_CONNECTOR "${DB_CONNECTOR}". Available: ${Object.keys(FACTORIES).join(", ")}`
  );
}

// Lazy + memoized on globalThis: the real connection (which opens the DB and
// runs migrations) is created on FIRST query, never at import. This keeps
// `next build` from touching the database and shares one connection process-wide
// (see the SQLITE_BUSY / duplicate-column history).
const globalForDb = globalThis;
const globalKey = `__tinitiateDb_${DB_CONNECTOR}`;

function getConnector() {
  if (!globalForDb[globalKey]) globalForDb[globalKey] = factory();
  return globalForDb[globalKey];
}

// Unified async data-access surface used everywhere:
//   db.prepare(sql).get/all/run(...params) -> Promise
//   db.tx(async ({ prepare }) => { ... })   -> Promise
const db = {
  prepare: (sql) => getConnector().prepare(sql),
  tx: (fn) => getConnector().tx(fn),
  get connector() {
    return getConnector();
  },
};

export const DB_PATH = DB_CONNECTOR === "sqlite" ? SQLITE_DB_PATH : "(postgres)";
export default db;
