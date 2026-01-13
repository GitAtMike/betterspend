import { initDb } from "@/src/db";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {

  useEffect(() => {
    async function run() {
      await initDb();
      console.log("DB initialized");
    }

    run();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BetterSpend</Text>
      <Text style={styles.subtitle}>Phase 1: Manual Spending Tracker</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 32, fontWeight: "700" },
  subtitle: { marginTop: 8, fontSize: 16, color: "#ffffff" },
});
