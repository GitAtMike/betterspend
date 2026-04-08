import { getAllTransactions, type Transaction } from "@/src/db";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getMonthName(): string {
  return new Date().toLocaleString("en-US", { month: "long" });
}

export default function HomeScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllTransactions().then(setTransactions);
    }, []),
  );

  // Filter to current month only
  const now = new Date();
  const monthlyTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const totalSpent = monthlyTxs.reduce((sum, tx) => sum + tx.amount, 0);

  // Tally by category
  const byCategory: Record<string, number> = {};
  for (const tx of monthlyTxs) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
  }
  const sortedCategories = Object.entries(byCategory).sort(
    (a, b) => b[1] - a[1],
  );
  const maxAmount = sortedCategories[0]?.[1] ?? 1;

  return (
    <LinearGradient colors={["#0a0f1e", "#000000"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subGreeting}>
          Here's your {getMonthName()} so far
        </Text>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Spent</Text>
          <Text style={styles.heroAmount}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.heroSub}>
            {monthlyTxs.length} transaction{monthlyTxs.length !== 1 ? "s" : ""}{" "}
            this month
          </Text>
        </View>

        {/* Category breakdown */}
        {sortedCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            {sortedCategories.map(([cat, amount]) => {
              const pct = amount / maxAmount;
              const color = CATEGORY_COLORS[cat] ?? "#98989d";
              return (
                <View key={cat} style={styles.catRow}>
                  <Text style={styles.catEmoji}>
                    {CATEGORY_EMOJI[cat] ?? "📦"}
                  </Text>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={styles.catName}>{cat}</Text>
                      <Text style={styles.catAmount}>${amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${pct * 100}%`, backgroundColor: color },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty state */}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },

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
  barTrack: { height: 6, backgroundColor: "#1c1c1e", borderRadius: 999 },
  barFill: { height: 6, borderRadius: 999 },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubText: { fontSize: 14, color: "#8e8e93", textAlign: "center" },
});
