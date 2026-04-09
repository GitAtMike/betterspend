// src/db.web.ts
// Web-only storage layer using localStorage.
// Expo automatically uses this file instead of db.ts when running on web.

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
  category: string;
  amount: number;
  threshold: number;
};

const STORAGE_KEY_TRANSACTIONS = "betterspend_transactions";
const STORAGE_KEY_BUDGETS = "betterspend_budgets";

function loadAllTransactions(): Transaction[] {
  const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

function loadAllBudgets(): Budget[] {
  const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Budget[];
  } catch {
    return [];
  }
}

function saveAllTransactions(txs: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs));
}

function saveAllBudgets(txs: Budget[]): void {
  localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(txs));
}
// No-op on web — nothing to initialize
export async function initDb(): Promise<void> {}

export async function addTransaction(tx: Transaction): Promise<void> {
  const txs = loadAllTransactions();
  txs.push(tx);
  saveAllTransactions(txs);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return loadAllTransactions().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  saveAllTransactions(loadAllTransactions().filter((tx) => tx.id !== id));
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  saveAllTransactions(
    loadAllTransactions().map((t) => (t.id === tx.id ? tx : t)),
  );
}

export async function setBudget(budget: Budget): Promise<void> {
  const budgets = loadAllBudgets().filter(
    (b) => b.category !== budget.category,
  );
  budgets.push(budget);
  saveAllBudgets(budgets);
}

export async function getBudgets(): Promise<Budget[]> {
  return loadAllBudgets().sort((a, b) => b.amount - a.amount);
}

export async function removeBudget(category: string): Promise<void> {
  saveAllBudgets(loadAllBudgets().filter((tx) => tx.category !== category));
}
