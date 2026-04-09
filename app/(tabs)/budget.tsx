import {
    getAllTransactions,
    getBudgets,
    removeBudget,
    setBudget,
    type Budget,
    type Transaction,
} from "@/src/db";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import Slider from "@react-native-community/slider";

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

const CATEGORIES = [
  "Groceries",
  "Rent",
  "Dining",
  "Gas",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Travel",
  "Health",
  "Other",
] as const;

type Category = (typeof CATEGORIES)[number];

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

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState("");
  const [overallAmount, setOverallAmount] = useState("");
  const [threshold, setThreshold] = useState(80);
  const [categoryOpen, setCategoryOpen] = useState(false);

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

  const handleSave = useCallback(async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a number greater than 0.");
      return;
    }
    if (!category) {
      Alert.alert("Missing info", "Please select a category.");
      return;
    }

    const budget: Budget = {
      category,
      amount: parsedAmount,
      threshold,
    };
    await setBudget(budget);
    setCategory(null);
    setAmount("");
    setThreshold(80);
    loadData();
  }, [category, amount, threshold, loadData]);

  const handleSaveOverall = useCallback(async () => {
    const parsedAmount = Number(overallAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a number greater than 0.");
      return;
    }

    const budget: Budget = {
      category: "overall",
      amount: parsedAmount,
      threshold,
    };
    await setBudget(budget);
    setOverallAmount("");
    loadData();
  }, [overallAmount, loadData]);

  const handleRemove = useCallback(
    async (category: string) => {
      await removeBudget(category);
      await loadData();
    },
    [loadData],
  );

  const now = new Date();
  const monthlyTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const totalSpent = monthlyTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const overallBudget = budgets.find((b) => b.category === "overall");
  const totalBudgets = budgets
    .filter((b) => b.category !== "overall")
    .reduce((sum, b) => sum + b.amount, 0);
  const remainingBudget = (overallBudget?.amount ?? 0) - totalBudgets;

  // Tally by category
  const byCategory: Record<string, number> = {};
  for (const tx of monthlyTxs) {
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.amount;
  }

  const handleThresholdChange = useCallback(
    async (budget: Budget, newValue: number) => {
      await setBudget({
        category: budget.category,
        amount: budget.amount,
        threshold: newValue,
      });
      loadData();
    },
    [loadData],
  );

  return (
    <LinearGradient colors={["#0a0f1e", "#000000"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Set a Budget</Text>
        <Text style={styles.subHeader}>
          Set an overall budget or a budget for a specific category
        </Text>

        <Text style={styles.label}>Overall Budget Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#555"
            value={overallAmount}
            onChangeText={setOverallAmount}
            keyboardType="numeric"
          />
        </View>

        <Pressable style={styles.saveButton} onPress={handleSaveOverall}>
          <Text style={styles.saveButtonText}>Save Overall Budget</Text>
        </Pressable>

        <Text style={[styles.label, { marginTop: 32 }]}>Category</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            width: "100%",
          }}
        >
          <Pressable style={styles.input} onPress={() => setCategoryOpen(true)}>
            <Text
              style={category ? styles.inputValue : styles.inputPlaceholder}
            >
              {category
                ? `${CATEGORY_EMOJI[category]} ${category}`
                : "Select a category"}
            </Text>
          </Pressable>

          {category && (
            <Pressable
              onPress={() => setCategory(null)}
              style={{ marginLeft: 12 }}
            >
              <Text
                style={{ color: "#ff3b30", fontSize: 16, fontWeight: "700" }}
              >
                ✕
              </Text>
            </Pressable>
          )}
        </View>

        {category && (
          <>
            <Text style={styles.label}>{category} Budget Amount</Text>
            {overallBudget ? (
              <>
                <Slider
                  minimumValue={0}
                  maximumValue={remainingBudget}
                  value={Number(amount) || 0}
                  onValueChange={(val) => setAmount(String(Math.round(val)))}
                  minimumTrackTintColor="#0a84ff"
                  maximumTrackTintColor="#2c2c2e"
                  thumbTintColor="#0a84ff"
                />
                <View style={styles.amountRow}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#555"
                    value={amount}
                    onChangeText={(val) => {
                      if (Number(val) > remainingBudget) {
                        setAmount(String(remainingBudget));
                      } else {
                        setAmount(val);
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </>
            ) : (
              <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#555"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
            )}

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Category Budget</Text>
            </Pressable>
          </>
        )}
        {budgets.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
              Active Budgets
            </Text>
            {budgets.map((budget) => (
              <View key={budget.category} style={styles.budgetCard}>
                <Text style={styles.cardTitle}>
                  {budget.category === "overall"
                    ? "Overall Budget"
                    : `${CATEGORY_EMOJI[budget.category]} ${budget.category}`}
                </Text>
                <Text style={styles.cardMeta}>
                  $
                  {(budget.category === "overall"
                    ? totalSpent
                    : (byCategory[budget.category] ?? 0)
                  ).toFixed(2)}{" "}
                  / ${budget.amount.toFixed(2)}
                </Text>
                <Text style={styles.label}>
                  {" "}
                  Warning at {budget.threshold}% ($
                  {((budget.amount * budget.threshold) / 100).toFixed(2)})
                </Text>
                <Slider
                  minimumValue={0}
                  maximumValue={100}
                  value={budget.threshold}
                  onValueChange={(val) =>
                    handleThresholdChange(budget, Math.round(val))
                  }
                  minimumTrackTintColor="#f54a4a"
                  maximumTrackTintColor="#2c2c2e"
                  thumbTintColor="#ff3b30"
                />
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleRemove(budget.category)}
                >
                  <Text style={styles.deleteButtonText}>Remove Budget</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        <Modal
          visible={categoryOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setCategoryOpen(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCategoryOpen(false)}
          >
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>Select Category</Text>
              <FlatList
                data={CATEGORIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.sheetRow}
                    onPress={() => {
                      setCategory(item);
                      setCategoryOpen(false);
                    }}
                  >
                    <Text style={styles.sheetRowText}>
                      {CATEGORY_EMOJI[item]} {item}
                    </Text>
                  </Pressable>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },

  header: { fontSize: 28, fontWeight: "700", color: "#fff", marginTop: 16 },
  subHeader: { fontSize: 15, color: "#8e8e93", marginTop: 4, marginBottom: 32 },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8e8e93",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  input: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 0,
    color: "#fff",
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    paddingVertical: 16,
  },

  saveButton: {
    backgroundColor: "#0a84ff",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  inputValue: { color: "#fff", fontSize: 16 },
  inputPlaceholder: { color: "#555", fontSize: 16 },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "60%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  sheetRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#2c2c2e",
  },
  sheetRowText: { color: "#fff", fontSize: 16 },

  budgetCard: {
    alignItems: "stretch",
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  cardTitle: { fontSize: 16, fontWeight: "600", color: "#fff" },
  cardMeta: { fontSize: 13, color: "#8e8e93", marginTop: 3 },

  deleteButton: {
    backgroundColor: "#ff3b30",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-end",
    marginTop: 8,
  },
  deleteButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
});
