import { addTransaction, type AccountType, type Transaction } from "@/src/db";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddScreen(){
    const router = useRouter();

    const [merchant, setMerchant] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");

    const handleSave = useCallback(async () => {
        const m = merchant.trim();
        const c = category.trim();
        const parsedAmount = Number(amount);

        if(!m){
            Alert.alert("Missing info", "Merchant is required.")
            return;
        }
        if(!c){
            Alert.alert("Missing info", "Category is required.")
            return;
        }
        if(!Number.isFinite(parsedAmount) || parsedAmount <= 0){
            Alert.alert("Invalid amount", "Enter a number greater than 0.")
            return;
        }

        const trans: Transaction = {
            id: Crypto.randomUUID(),
            date: new Date().toISOString(),
            merchant: m,
            amount: parsedAmount,
            category: c,
            account: "debit" as AccountType,
        };
        await addTransaction(trans);

        setMerchant("");
        setAmount("");
        setCategory("");

        router.push("/transactions");
    }, [merchant, amount, category, router]);

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

            <TextInput
                style={styles.input}
                placeholder="Category"
                value={category}
                onChangeText={setCategory}
            />

            <Pressable
                style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
            </Pressable>
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
});