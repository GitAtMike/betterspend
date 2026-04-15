// src/db.web.ts
// Web-only storage layer using localStorage.
// Expo automatically uses this file instead of db.ts when running on web.
// Exposes the same async API as db.ts so all screens work without platform checks.

// ─── Types ───────────────────────────────────────────────────────────────────

export type AccountType = "debit" | "credit" | "cash";

export type Transaction = {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  account: AccountType;
  date: string;
};

export type Budget = {
  category: string; // category name or "overall" for the total budget
  amount: number; // spending limit in dollars
  threshold: number; // warning threshold as a percentage (0–100)
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY_TRANSACTIONS = "betterspend_transactions";
const STORAGE_KEY_BUDGETS = "betterspend_budgets";

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/** Reads all transactions from localStorage. Returns empty array on failure. */
function loadAllTransactions(): Transaction[] {
  const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

/** Reads all budgets from localStorage. Returns empty array on failure. */
function loadAllBudgets(): Budget[] {
  const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Budget[];
  } catch {
    return [];
  }
}

/** Writes the full transactions array to localStorage. */
function saveAllTransactions(txs: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs));
}

/** Writes the full budgets array to localStorage. */
function saveAllBudgets(budgets: Budget[]): void {
  localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
}

// ─── Init ─────────────────────────────────────────────────────────────────────

/** No-op on web — localStorage needs no initialization. */
export async function initDb(): Promise<void> {}

// ─── Transaction CRUD ─────────────────────────────────────────────────────────

/**
 * Appends a new transaction to localStorage.
 * @param tx - the transaction to add
 */
export async function addTransaction(tx: Transaction): Promise<void> {
  const txs = loadAllTransactions();
  txs.push(tx);
  saveAllTransactions(txs);
}

/**
 * Returns all transactions sorted by date descending (newest first).
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  return loadAllTransactions().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/**
 * Removes a transaction by ID.
 * @param id - the UUID of the transaction to delete
 */
export async function deleteTransaction(id: string): Promise<void> {
  saveAllTransactions(loadAllTransactions().filter((tx) => tx.id !== id));
}

/**
 * Replaces an existing transaction by ID.
 * @param tx - the transaction with updated values
 */
export async function updateTransaction(tx: Transaction): Promise<void> {
  saveAllTransactions(
    loadAllTransactions().map((t) => (t.id === tx.id ? tx : t)),
  );
}

// ─── Budget CRUD ──────────────────────────────────────────────────────────────

/**
 * Inserts or replaces a budget for a given category.
 * Filters out any existing entry for that category first, then pushes the new one.
 * @param budget - the budget to save
 */
export async function setBudget(budget: Budget): Promise<void> {
  const budgets = loadAllBudgets().filter(
    (b) => b.category !== budget.category,
  );
  budgets.push(budget);
  saveAllBudgets(budgets);
}

/**
 * Returns all budgets sorted by amount descending.
 */
export async function getBudgets(): Promise<Budget[]> {
  return loadAllBudgets().sort((a, b) => b.amount - a.amount);
}

/**
 * Removes a budget by category.
 * @param category - the category key to delete (e.g. "Dining" or "overall")
 */
export async function removeBudget(category: string): Promise<void> {
  saveAllBudgets(loadAllBudgets().filter((b) => b.category !== category));
}
