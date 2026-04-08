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

const STORAGE_KEY = "betterspend_transactions";

function loadAll(): Transaction[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

function saveAll(txs: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

// No-op on web — nothing to initialize
export async function initDb(): Promise<void> {}

export async function addTransaction(tx: Transaction): Promise<void> {
  const txs = loadAll();
  txs.push(tx);
  saveAll(txs);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return loadAll().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  saveAll(loadAll().filter((tx) => tx.id !== id));
}

export async function updateTransaction(tx: Transaction): Promise<void> {
  saveAll(loadAll().map((t) => (t.id === tx.id ? tx : t)));
}
