// src/db.ts
import * as SQLite from "expo-sqlite";

export type AccountType = "debit" | "credit" | "cash";

export type Transaction = {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  account: AccountType;
  date: string; // ISO string (e.g., new Date().toISOString())
};

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens (or creates) the database and ensures the schema exists.
 * Call this once at app startup.
 */
export async function initDb(): Promise<void> {
  if (!db) {
    db = await SQLite.openDatabaseAsync("betterspend.db");
  }

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      merchant TEXT NOT NULL,
      category TEXT NOT NULL,
      account TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);
}

function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export async function addTransaction(tx: Transaction): Promise<void> {
  const d = getDb();
  await d.runAsync(
    `INSERT INTO transactions (id, amount, merchant, category, account, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tx.id, tx.amount, tx.merchant, tx.category, tx.account, tx.date]
  );
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const d = getDb();
  const rows = await d.getAllAsync<Transaction>(
    `SELECT id, amount, merchant, category, account, date
     FROM transactions
     ORDER BY date DESC`
  );
  return rows;
}

export async function deleteTransaction(id: string): Promise<void> {
  const d = getDb();
  await d.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
}
