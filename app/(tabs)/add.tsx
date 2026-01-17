import { addTransaction, type AccountType, type Transaction } from "@/src/db";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddScreen(){
    const router = useRouter();


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


    const [merchant, setMerchant] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<Category | null>(null);
    const [account, setAccount] = useState<AccountType>("debit");
    const [categoryOpen , setCategoryOpen] = useState(false);


    const handleSave = useCallback(async () => {
        const m = merchant.trim();
        const parsedAmount = Number(amount);

        if(!m){
            Alert.alert("Missing info", "Merchant is required.")
            return;
        }

        if(!Number.isFinite(parsedAmount) || parsedAmount <= 0){
            Alert.alert("Invalid amount", "Enter a number greater than 0.")
            return;
        }

        if(category === null){
            Alert.alert("Missing info", "Please select a category.");
            return;
        }

        const trans: Transaction = {
            id: Crypto.randomUUID(),
            date: new Date().toISOString(),
            merchant: m,
            amount: parsedAmount,
            category: category,
            account: "debit" as AccountType,
        };
        await addTransaction(trans);

        setMerchant("");
        setAmount("");
        setCategory("Other");
        setAccount("debit")

        router.push("/transactions");
    }, [merchant, amount, category, account, router]);

    const selectCategory = useCallback((c: (typeof CATEGORIES)[number]) => {
        setCategory(c);
        setCategoryOpen(false);
    }, [CATEGORIES]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>BetterSpend</Text>
            <Text style={styles.subtitle}>Add Transaction</Text>

            <TextInput
                style={styles.input}
                placeholder="Merchant"
                value={merchant}
                onChangeText={setMerchant}
            />

            <TextInput
                style={styles.input}
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
            />

            <Pressable style={styles.input} onPress={() => setCategoryOpen(true)}>
            <Text
                style={[
                    styles.categoryValue,
                    category === null && styles.categoryPlaceholder,]}
                    >
                        {category ?? "Category"}
                    </Text>
            </Pressable>

            <View style={styles.pillRow}>
                <Pressable
                    style={[styles.pill, account === "debit" &&  styles.pillSelected]}
                    onPress={() => setAccount("debit")}
                >
                    <Text style={[
                        styles.pillText, account === "debit" && styles.pillTextSelected]}
                    >
                        Debit
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.pill, account === "credit" &&  styles.pillSelected]}
                    onPress={() => setAccount("credit")}
                >
                    <Text style={[
                        styles.pillText, account === "credit" && styles.pillTextSelected]}
                    >
                        Credit
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.pill, account === "cash" &&  styles.pillSelected]}
                    onPress={() => setAccount("cash")}
                >
                    <Text style={[
                        styles.pillText, account === "cash" && styles.pillTextSelected]}
                    >
                        Cash
                    </Text>
                </Pressable>

            </View>

            <Pressable
                style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
            </Pressable>


            <Modal
                visible={categoryOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setCategoryOpen(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setCategoryOpen(false)}>
                    <Pressable style={styles.modalSheet} onPress={() => {}}>
                        <Text style={styles.modalTitle}>Select Category</Text>

                        <FlatList
                            data={CATEGORIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <Pressable style={styles.categoryRow} onPress={() => selectCategory(item)}>
                                    <Text style={styles.categoryRowText}>{item}</Text>
                                </Pressable>
                            )}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 32, fontWeight: "700" },
    subtitle: { marginTop: 8, fontSize: 28, color: "#ffffff", paddingVertical: 14 },

    input: {
        width: "90%",
        backgroundColor: "#1c1c1e",
        color: "white",
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 14,
    },

    button: {
        width: "90%",
        backgroundColor: "#0a84ff",
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },

    pillRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        marginTop: 12,
        marginBottom: 12,
    },
    pill: {
        flex:1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    pillSelected:{
        backgroundColor: "#0a84ff",
    },
    pillText:{
        color: "#b0b0b0",
        fontSize: 14,
        fontWeight: "600",
    },
    pillTextSelected:{
        color: "white",
    },

    categoryValue: {
        color: "white",
        fontSize: 16,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: "#1c1c1e",
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 24,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        maxHeight: "60%",
    },
    modalTitle: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    categoryRow: {
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#333",
    },
    categoryRowText: {
        color: "white",
        fontSize: 16,
    },
    categoryPlaceholder: {
        color: "#888",
    },
});