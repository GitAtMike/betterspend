import DonutChart from "@/components/donutChart";
import {
  getAllTransactions,
  getBudgets,
  type Budget,
  type Transaction,
} from "@/src/db";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#30d158",
  Rent: "#ff6b6b",
  Dining: "#ff9f0a",
  Gas: "#ffd60a",
  Entertainment: "#bf5af2",
  Utilities: "#64d2ff",
  Shopping: "#0a84ff",
  Travel: "#5e5ce6",
  Health: "#ff375f",
  Other: "#98989d",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Groceries: "🛒",
  Rent: "🏠",
  Dining: "🍽️",
  Gas: "⛽",
  Entertainment: "🎬",
  Utilities: "💡",
  Shopping: "🛍️",
  Travel: "✈️",
  Health: "❤️",
  Other: "📦",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a time-appropriate greeting based on the current hour. */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Returns the current month name (e.g. "April"). */
function getMonthName(): string {
  return new Date().toLocaleString("en-US", { month: "long" });
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // ─── State ───────────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // ─── Data Loading ─────────────────────────────────────────────────────────

  /**
   * Loads transactions and budgets in parallel.
   * Called on screen focus so data is always up to date.
   */
  const loadData = useCallback(async () => {
    const [allTransactions, allBudgets] = await Promise.all([
      getAllTransactions(),
      getBudgets(),
    ]);
    setTransactions(allTransactions);
    setBudgets(allBudgets);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // ─── Derived Data ─────────────────────────────────────────────────────────

  // Filter transactions to the current month only
  const now = new Date();
  const monthlyTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  // Total spent this month
  const totalSpent = monthlyTxs.reduce((sum, tx) => sum + tx.amount, 0);

  // Spending tallied by category
  const byCategory: Record<string, number> = {};
  for (const tx of monthlyTxs) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
  }

  // Categories sorted by spend descending
  const sortedCategories = Object.entries(byCategory).sort(
    (a, b) => b[1] - a[1],
  );

  // Data shaped for the DonutChart component — always uses category colors
  const chartData = sortedCategories.map(([category, amount]) => ({
    label: category,
    value: amount,
    color: CATEGORY_COLORS[category],
  }));

  // Overall budget row (if set by the user)
  const overallBudget = budgets.find((b) => b.category === "overall");

  // ─── Spending Color Logic ─────────────────────────────────────────────────

  /**
   * Returns a color for a category's amount text based on budget status.
   * - No budget set → white (neutral)
   * - Under threshold → green
   * - At or above threshold but under limit → yellow
   * - At or above limit → red
   *
   * @param cat - the category name to evaluate
   */
  function getSpendingColor(cat: string): string {
    const budget = budgets.find((b) => b.category === cat);
    if (!budget) return "#ffffff";

    const thresholdDollarAmount = (budget.amount * budget.threshold) / 100;

    if (byCategory[cat] < thresholdDollarAmount) return "#30d158";
    if (byCategory[cat] < budget.amount) return "#ffd60a";
    return "#ff3b30";
  }

  // ─── JSX ─────────────────────────────────────────────────────────────────

  return (
    <LinearGradient colors={["#0a0f1e", "#000000"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Greeting ── */}
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subGreeting}>
          Here's your {getMonthName()} so far
        </Text>

        {/* ── Hero Card — total monthly spend ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Spent</Text>
          <Text style={styles.heroAmount}>
            ${totalSpent.toFixed(2)}
            {overallBudget ? ` / $${overallBudget.amount.toFixed(2)}` : ""}
          </Text>
          <Text style={styles.heroSub}>
            {monthlyTxs.length} transaction{monthlyTxs.length !== 1 ? "s" : ""}{" "}
            this month
          </Text>
        </View>

        {/* ── Category Breakdown ── */}
        {sortedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>

            {/* Category list — amount colored by budget status */}
            {sortedCategories.map(([cat, amount]) => {
              const categoryBudget = budgets.find((b) => b.category === cat);
              return (
                <View key={cat} style={styles.catRow}>
                  <Text style={styles.catEmoji}>
                    {CATEGORY_EMOJI[cat] ?? "📦"}
                  </Text>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={styles.catName}>{cat}</Text>
                      <Text
                        style={[
                          styles.catAmount,
                          { color: getSpendingColor(cat) },
                        ]}
                      >
                        ${amount.toFixed(2)}
                        {categoryBudget
                          ? ` / $${categoryBudget.amount.toFixed(2)}`
                          : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Donut chart + legend */}
            <View style={styles.chartContainer}>
              <DonutChart data={chartData} size={220} strokeWidth={40} />
              <View style={styles.legend}>
                {chartData.map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Empty State ── */}
        {monthlyTxs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💸</Text>
            <Text style={styles.emptyText}>
              No transactions this month yet.
            </Text>
            <Text style={styles.emptySubText}>
              Head to the Add tab to log your first one.
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  chartContainer: { alignItems: "center", marginTop: 16 },

  greeting: { fontSize: 28, fontWeight: "700", color: "#fff", marginTop: 16 },
  subGreeting: {
    fontSize: 15,
    color: "#8e8e93",
    marginTop: 4,
    marginBottom: 24,
  },

  heroCard: {
    backgroundColor: "#0a84ff",
    borderRadius: 20,
    padding: 28,
    marginBottom: 32,
    shadowColor: "#0a84ff",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroAmount: { fontSize: 52, fontWeight: "800", color: "#fff", marginTop: 8 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8 },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },

  catRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  catEmoji: { fontSize: 22, marginRight: 12, width: 32, textAlign: "center" },
  catInfo: { flex: 1 },
  catLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  catName: { fontSize: 15, fontWeight: "600", color: "#fff" },
  catAmount: { fontSize: 15, fontWeight: "600", color: "#fff" },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubText: { fontSize: 14, color: "#8e8e93", textAlign: "center" },

  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendLabel: {
    fontSize: 13,
    color: "#8e8e93",
    fontWeight: "600",
  },
});
