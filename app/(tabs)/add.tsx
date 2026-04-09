import { addTransaction, type AccountType, type Transaction } from "@/src/db";
import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

const ACCOUNT_COLORS: Record<string, string> = {
  debit: "#30d158",
  credit: "#0a84ff",
  cash: "#ff9f0a",
};

export default function AddScreen() {
  const router = useRouter();
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [account, setAccount] = useState<AccountType>("debit");
  const [categoryOpen, setCategoryOpen] = useState(false);

  const handleSave = useCallback(async () => {
    const m = merchant.trim();
    const parsedAmount = Number(amount);
    if (!m) {
      Alert.alert("Missing info", "Merchant is required.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a number greater than 0.");
      return;
    }
    if (!category) {
      Alert.alert("Missing info", "Please select a category.");
      return;
    }

    const tx: Transaction = {
      id: Crypto.randomUUID(),
      date: new Date().toISOString(),
      merchant: m,
      amount: parsedAmount,
      category,
      account,
    };
    await addTransaction(tx);
    setMerchant("");
    setAmount("");
    setCategory(null);
    setAccount("debit");
    router.back();
  }, [merchant, amount, category, account, router]);

  return (
    <LinearGradient colors={["#0a0f1e", "#000000"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Add Transaction</Text>
        <Text style={styles.subHeader}>Log a new expense</Text>

        <Text style={styles.label}>Merchant</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Starbucks"
          placeholderTextColor="#555"
          value={merchant}
          onChangeText={setMerchant}
        />

        <Text style={styles.label}>Amount</Text>
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

        <Text style={styles.label}>Category</Text>
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

        <Text style={styles.label}>Account</Text>
        <View style={styles.pillRow}>
          {(["debit", "credit", "cash"] as AccountType[]).map((a) => (
            <Pressable
              key={a}
              style={[
                styles.pill,
                account === a && { backgroundColor: ACCOUNT_COLORS[a] },
              ]}
              onPress={() => setAccount(a)}
            >
              <Text
                style={[
                  styles.pillText,
                  account === a && styles.pillTextSelected,
                ]}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </Pressable>

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
  inputValue: { color: "#fff", fontSize: 16 },
  inputPlaceholder: { color: "#555", fontSize: 16 },

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

  pillRow: { flexDirection: "row", gap: 10, marginBottom: 32 },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#1c1c1e",
  },
  pillText: { color: "#8e8e93", fontSize: 14, fontWeight: "600" },
  pillTextSelected: { color: "#fff" },

  saveButton: {
    backgroundColor: "#0a84ff",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },

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
});
