import "server-only";
import postgres from "postgres";

/**
 * Direct Postgres connection to the Supabase database, for server code only.
 * Uses DATABASE_URL (the transaction pooler on port 6543). This connects as the
 * database owner and bypasses Row Level Security, so never expose results
 * without checking the signed-in user first.
 *
 * Usage:  const rows = await db`select * from courses where id = ${id}`;
 */

const globalForDb = globalThis as unknown as { db?: ReturnType<typeof postgres> };

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add it to .env (see .env.example).");
  // The transaction pooler does not support prepared statements.
  return postgres(url, { prepare: false });
}

// Reuse one pool across hot reloads in development.
export const db = globalForDb.db ?? connect();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
