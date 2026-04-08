import {
  deleteTransaction,
  getAllTransactions,
  updateTransaction,
  type AccountType,
  type Transaction,
} from "@/src/db";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
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

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [draftMerchant, setDraftMerchant] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftCategory, setDraftCategory] = useState<Category | null>(null);
  const [draftAccount, setDraftAccount] = useState<AccountType>("debit");
  const [draftDate, setDraftDate] = useState<Date>(new Date());
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const loadTransactions = useCallback(async () => {
    const all = await getAllTransactions();
    setTransactions(all);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions]),
  );

  const closeEdit = useCallback(() => {
    setIsEditOpen(false);
    setSelectedTransaction(null);
    setDraftMerchant("");
    setDraftAmount("");
    setDraftCategory(null);
    setDraftAccount("debit");
    setDraftDate(new Date());
    setCategoryOpen(false);
    setDatePickerOpen(false);
  }, []);

  const openEditFor = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx);
    setDraftMerchant(tx.merchant);
    setDraftAmount(tx.amount.toFixed(2));
    setDraftCategory(tx.category as Category);
    setDraftAccount(tx.account);
    setDraftDate(new Date(tx.date));
    setIsEditOpen(true);
  }, []);

  const formattedDraftDate = useMemo(
    () => draftDate.toLocaleDateString("en-US"),
    [draftDate],
  );

  const handleSave = useCallback(async () => {
    if (!selectedTransaction) return;
    const m = draftMerchant.trim();
    const parsedAmount = Number(draftAmount);
    if (!m) {
      Alert.alert("Missing info", "Merchant is required.");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a number greater than 0.");
      return;
    }
    if (!draftCategory) {
      Alert.alert("Missing info", "Please select a category.");
      return;
    }
    await updateTransaction({
      ...selectedTransaction,
      merchant: m,
      amount: parsedAmount,
      category: draftCategory,
      account: draftAccount,
      date: draftDate.toISOString(),
    });
    await loadTransactions();
    closeEdit();
  }, [
    selectedTransaction,
    draftMerchant,
    draftAmount,
    draftCategory,
    draftAccount,
    draftDate,
    loadTransactions,
    closeEdit,
  ]);

  const handleDelete = useCallback(async () => {
    if (!selectedTransaction) return;
    Alert.alert("Delete transaction?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(selectedTransaction.id);
          await loadTransactions();
          closeEdit();
        },
      },
    ]);
  }, [selectedTransaction, loadTransactions, closeEdit]);

  const onDateChange = useCallback((_event: unknown, selected?: Date) => {
    if (Platform.OS === "android") setDatePickerOpen(false);
    if (selected) setDraftDate(selected);
  }, []);

  return (
    <LinearGradient colors={["#0a0f1e", "#000000"]} style={styles.container}>
      <Text style={styles.header}>Transactions</Text>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧾</Text>
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubText}>Add one from the Add tab</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => openEditFor(item)}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardEmoji}>
                  {CATEGORY_EMOJI[item.category] ?? "📦"}
                </Text>
              </View>
              <View style={styles.cardMid}>
                <Text style={styles.cardMerchant}>{item.merchant}</Text>
                <Text style={styles.cardMeta}>
                  {item.category} •{" "}
                  {new Date(item.date).toLocaleDateString("en-US")}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>${item.amount.toFixed(2)}</Text>
                <View
                  style={[
                    styles.accountBadge,
                    { backgroundColor: ACCOUNT_COLORS[item.account] + "22" },
                  ]}
                >
                  <Text
                    style={[
                      styles.accountBadgeText,
                      { color: ACCOUNT_COLORS[item.account] },
                    ]}
                  >
                    {item.account.charAt(0).toUpperCase() +
                      item.account.slice(1)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={isEditOpen}
        animationType="slide"
        transparent
        onRequestClose={closeEdit}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeEdit}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Edit Transaction</Text>

            <Text style={styles.inputLabel}>Merchant</Text>
            <TextInput
              style={styles.input}
              placeholder="Merchant"
              placeholderTextColor="#555"
              value={draftMerchant}
              onChangeText={setDraftMerchant}
            />

            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#555"
              value={draftAmount}
              onChangeText={setDraftAmount}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <Pressable
              style={styles.input}
              onPress={() => setCategoryOpen(true)}
            >
              <Text
                style={
                  draftCategory ? styles.inputValue : styles.inputPlaceholder
                }
              >
                {draftCategory
                  ? `${CATEGORY_EMOJI[draftCategory]} ${draftCategory}`
                  : "Select category"}
              </Text>
            </Pressable>

            <Text style={styles.inputLabel}>Account</Text>
            <View style={styles.pillRow}>
              {(["debit", "credit", "cash"] as AccountType[]).map((a) => (
                <Pressable
                  key={a}
                  style={[
                    styles.pill,
                    draftAccount === a && {
                      backgroundColor: ACCOUNT_COLORS[a],
                    },
                  ]}
                  onPress={() => setDraftAccount(a)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      draftAccount === a && styles.pillTextSelected,
                    ]}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Date</Text>
            <Pressable
              style={styles.input}
              onPress={() => setDatePickerOpen(true)}
            >
              <Text style={styles.inputValue}>{formattedDraftDate}</Text>
            </Pressable>

            {datePickerOpen && (
              <DateTimePicker
                value={draftDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onDateChange}
              />
            )}

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={handleDelete}
              >
                <Text style={styles.actionBtnText}>Delete</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={closeEdit}
              >
                <Text style={styles.actionBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Text style={styles.actionBtnText}>Save</Text>
              </Pressable>
            </View>

            {/* Category picker modal */}
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
                  <ScrollView>
                    {CATEGORIES.map((c) => (
                      <Pressable
                        key={c}
                        style={styles.sheetRow}
                        onPress={() => {
                          setDraftCategory(c);
                          setCategoryOpen(false);
                        }}
                      >
                        <Text style={styles.sheetRowText}>
                          {CATEGORY_EMOJI[c]} {c}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: { fontSize: 28, fontWeight: "700", color: "#fff", marginBottom: 20 },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubText: { fontSize: 14, color: "#8e8e93" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: { marginRight: 14 },
  cardEmoji: { fontSize: 28 },
  cardMid: { flex: 1 },
  cardMerchant: { fontSize: 16, fontWeight: "600", color: "#fff" },
  cardMeta: { fontSize: 13, color: "#8e8e93", marginTop: 3 },
  cardRight: { alignItems: "flex-end" },
  cardAmount: { fontSize: 16, fontWeight: "700", color: "#fff" },
  accountBadge: {
    marginTop: 4,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  accountBadgeText: { fontSize: 11, fontWeight: "700" },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalCard: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8e8e93",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#2c2c2e",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    color: "#fff",
  },
  inputValue: { color: "#fff", fontSize: 16 },
  inputPlaceholder: { color: "#555", fontSize: 16 },

  pillRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#2c2c2e",
  },
  pillText: { color: "#8e8e93", fontSize: 14, fontWeight: "600" },
  pillTextSelected: { color: "#fff" },

  buttonRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  saveBtn: { backgroundColor: "#0a84ff" },
  cancelBtn: { backgroundColor: "#2c2c2e" },
  deleteBtn: { backgroundColor: "#ff3b30" },

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
