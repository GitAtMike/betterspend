// src/db.ts
// SQLite storage layer for iOS and Android.
// On web, Expo automatically uses db.web.ts instead.

import * as SQLite from "expo-sqlite";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AccountType = "debit" | "credit" | "cash";

export type Transaction = {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  account: AccountType;
  date: string; // ISO string (e.g., new Date().toISOString())
};

export type Budget = {
  category: string; // category name or "overall" for the total budget
  amount: number; // spending limit in dollars
  threshold: number; // warning threshold as a percentage (0–100)
};

// ─── Database Instance ────────────────────────────────────────────────────────

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens (or creates) the SQLite database and ensures all tables exist.
 * Uses WAL journaling mode for better performance.
 * Should be called once at app startup in the root layout.
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

    CREATE TABLE IF NOT EXISTS budgets (
      category TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      threshold REAL NOT NULL
    );
  `);
}

/**
 * Returns the active database instance.
 * Throws if initDb() has not been called first.
 */
function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

// ─── Transaction CRUD ─────────────────────────────────────────────────────────

/**
 * Inserts a new transaction into the database.
 * @param tx - the transaction to insert
 */
export async function addTransaction(tx: Transaction): Promise<void> {
  const d = getDb();
  await d.runAsync(
    `INSERT INTO transactions (id, amount, merchant, category, account, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tx.id, tx.amount, tx.merchant, tx.category, tx.account, tx.date],
  );
}

/**
 * Returns all transactions sorted by date descending (newest first).
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  const d = getDb();
  const rows = await d.getAllAsync<Transaction>(
    `SELECT id, amount, merchant, category, account, date
     FROM transactions
     ORDER BY date DESC`,
  );
  return rows;
}

/**
 * Deletes a transaction by its unique ID.
 * @param id - the UUID of the transaction to delete
 */
export async function deleteTransaction(id: string): Promise<void> {
  const d = getDb();
  await d.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
}

/**
 * Updates all fields of an existing transaction.
 * @param tx - the transaction with updated values (id must match an existing row)
 */
export async function updateTransaction(tx: Transaction): Promise<void> {
  const d = getDb();
  await d.runAsync(
    `UPDATE transactions
    SET amount = ?, merchant = ?, category = ?, account = ?, date = ?
    WHERE id = ?`,
    [tx.amount, tx.merchant, tx.category, tx.account, tx.date, tx.id],
  );
}

// ─── Budget CRUD ──────────────────────────────────────────────────────────────

/**
 * Inserts or replaces a budget for a given category.
 * Since category is the primary key, saving over an existing one updates it.
 * Use category "overall" for the total monthly budget.
 * @param tx - the budget to save
 */
export async function setBudget(tx: Budget): Promise<void> {
  const d = getDb();
  await d.runAsync(
    `INSERT OR REPLACE INTO budgets (category, amount, threshold)
     VALUES (?, ?, ?)`,
    [tx.category, tx.amount, tx.threshold],
  );
}

/**
 * Returns all budgets sorted by amount descending.
 */
export async function getBudgets(): Promise<Budget[]> {
  const d = getDb();
  const rows = await d.getAllAsync<Budget>(
    `SELECT category, amount, threshold
     FROM budgets
     ORDER BY amount DESC`,
  );
  return rows;
}

/**
 * Deletes a budget by category.
 * @param category - the category key to delete (e.g. "Dining" or "overall")
 */
export async function removeBudget(category: string): Promise<void> {
  const d = getDb();
  await d.runAsync(`DELETE FROM budgets WHERE category = ?`, [category]);
}
