import { getAllTransactions, Transaction } from "@/src/db";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function TransactionsScreen(){

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function load(){
                const allTran = await getAllTransactions();
                setTransactions(allTran);
                console.log("Loaded transactions:", allTran.length);
            }

            load();
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Transactions loaded: {transactions.length}
            </Text>

            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Text style={styles.merchant}>{item.merchant}</Text>
                        <Text style={styles.meta}>
                            ${item.amount.toFixed(2)} • {item.category} • {item.account.charAt(0).toUpperCase() + item.account.slice(1)} • {new Date(item.date).toLocaleDateString("en-US")}
                        </Text>
                    </View>
                )}
            />
        </View>
    );

}


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 24 },
    header: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
    row: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
    merchant: { fontSize: 20, fontWeight: "600", color: "#ffffff", paddingVertical: 16 },
    meta: { marginTop: 4, fontSize: 18, color: "#ffffff" },
});