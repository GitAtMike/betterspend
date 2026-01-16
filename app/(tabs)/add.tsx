import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function AddScreen(){

    const [merchant, setMerchant] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");


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
                style={styles.button}
                onPress={() =>{
                    console.log({merchant, amount, category});
                }}
            >
                <Text style={styles.buttonText}>Save</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 32, fontWeight: "700" },
    subtitle: { marginTop: 8, fontSize: 16, color: "#ffffff" },

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