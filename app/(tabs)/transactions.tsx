import {
    deleteTransaction,
    getAllTransactions,
    updateTransaction,
    type AccountType,
    type Transaction,
} from "@/src/db";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
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

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Draft fields (editable)
  const [draftMerchant, setDraftMerchant] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftCategory, setDraftCategory] = useState<Category | null>(null);
  const [draftAccount, setDraftAccount] = useState<AccountType>("debit");
  const [draftDate, setDraftDate] = useState<Date>(new Date());

  // Picker visibility
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const loadTransactions = useCallback(async () => {
    const allTran = await getAllTransactions();
    setTransactions(allTran);
    console.log("Loaded transactions:", allTran.length);
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

  const formattedDraftDate = useMemo(() => {
    return draftDate.toLocaleDateString("en-US");
  }, [draftDate]);

  const selectCategory = useCallback((c: Category) => {
    setDraftCategory(c);
    setCategoryOpen(false);
  }, []);

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

    if (draftCategory === null) {
      Alert.alert("Missing info", "Please select a category.");
      return;
    }

    const updated: Transaction = {
      ...selectedTransaction,
      merchant: m,
      amount: parsedAmount,
      category: draftCategory,
      account: draftAccount,
      date: draftDate.toISOString(),
    };

    await updateTransaction(updated);
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

    Alert.alert(
      "Delete transaction?",
      "This can’t be undone.",
      [
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
      ],
      { cancelable: true },
    );
  }, [selectedTransaction, loadTransactions, closeEdit]);

  const onDateChange = useCallback((_event: unknown, selected?: Date) => {
    // Android: picker closes after a selection/cancel, so close it here.
    if (Platform.OS === "android") setDatePickerOpen(false);

    if (selected) {
      // Preserve time-of-day? We only care about date, but ISO includes time.
      // This keeps whatever time was in the Date object; acceptable for now.
      setDraftDate(selected);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Transactions loaded: {transactions.length}
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openEditFor(item)}>
            <Text style={styles.merchant}>{item.merchant}</Text>
            <Text style={styles.meta}>
              ${item.amount.toFixed(2)} • {item.category} •{" "}
              {item.account.charAt(0).toUpperCase() + item.account.slice(1)} •{" "}
              {new Date(item.date).toLocaleDateString("en-US")}
            </Text>
          </Pressable>
        )}
      />

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

            <TextInput
              style={styles.input}
              placeholder="Merchant"
              value={draftMerchant}
              onChangeText={setDraftMerchant}
            />

            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={draftAmount}
              onChangeText={setDraftAmount}
              keyboardType="numeric"
            />

            {/* Category (input-looking) */}
            <Pressable
              style={styles.input}
              onPress={() => setCategoryOpen(true)}
            >
              <Text
                style={[
                  styles.categoryValue,
                  draftCategory === null && styles.categoryPlaceholder,
                ]}
              >
                {draftCategory ?? "Category"}
              </Text>
            </Pressable>

            {/* Account pills */}
            <View style={styles.pillRow}>
              <Pressable
                style={[
                  styles.pill,
                  draftAccount === "debit" && styles.pillSelected,
                ]}
                onPress={() => setDraftAccount("debit")}
              >
                <Text
                  style={[
                    styles.pillText,
                    draftAccount === "debit" && styles.pillTextSelected,
                  ]}
                >
                  Debit
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.pill,
                  draftAccount === "credit" && styles.pillSelected,
                ]}
                onPress={() => setDraftAccount("credit")}
              >
                <Text
                  style={[
                    styles.pillText,
                    draftAccount === "credit" && styles.pillTextSelected,
                  ]}
                >
                  Credit
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.pill,
                  draftAccount === "cash" && styles.pillSelected,
                ]}
                onPress={() => setDraftAccount("cash")}
              >
                <Text
                  style={[
                    styles.pillText,
                    draftAccount === "cash" && styles.pillTextSelected,
                  ]}
                >
                  Cash
                </Text>
              </Pressable>
            </View>

            {/* Date (input-looking) */}
            <Pressable
              style={styles.input}
              onPress={() => setDatePickerOpen(true)}
            >
              <Text style={styles.categoryValue}>{formattedDraftDate}</Text>
            </Pressable>

            {/* Date Picker */}
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
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.cancelButton]}
                onPress={closeEdit}
              >
                <Text style={styles.actionButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.actionButtonText}>Save</Text>
              </Pressable>
            </View>

            {/* Category Modal (reused pattern) */}
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
                <Pressable style={styles.modalSheet} onPress={() => {}}>
                  <Text style={styles.sheetTitle}>Select Category</Text>

                  <FlatList
                    data={CATEGORIES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <Pressable
                        style={styles.categoryRow}
                        onPress={() => selectCategory(item)}
                      >
                        <Text style={styles.categoryRowText}>{item}</Text>
                      </Pressable>
                    )}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 24 },
  header: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  merchant: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    paddingVertical: 16,
  },
  meta: { marginTop: 4, fontSize: 18, color: "#ffffff" },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#1f1f1f",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },

  input: {
    width: "100%",
    backgroundColor: "#1c1c1e",
    color: "white",
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 14,
  },

  categoryValue: {
    color: "white",
    fontSize: 16,
  },
  categoryPlaceholder: {
    color: "#9a9a9a",
  },

  pillRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#3a3a3c",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  pillSelected: {
    backgroundColor: "#0a84ff",
    borderColor: "#0a84ff",
  },
  pillText: {
    color: "white",
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "white",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#0a84ff",
  },
  cancelButton: {
    backgroundColor: "#333333",
  },
  deleteButton: {
    backgroundColor: "#ff3b30",
  },

  modalSheet: {
    marginTop: "auto",
    backgroundColor: "#1f1f1f",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  categoryRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#2c2c2e",
  },
  categoryRowText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
