import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/hooks/useAuth";

export function DashboardScreen() {
  const { driver, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {driver?.fullName ?? "Driver"}</Text>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>
          ${driver?.currentBalance.toFixed(2) ?? "0.00"}
        </Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{driver?.totalDeliveries ?? 0}</Text>
          <Text style={styles.statLabel}>Deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {driver?.rating.toFixed(1) ?? "0.0"}
          </Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {driver?.isOnline ? "Go Offline" : "Go Online"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  greeting: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  balanceCard: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: { color: "#fff", fontSize: 14, opacity: 0.8 },
  balanceAmount: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#333" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  toggleButton: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  toggleText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  signOutButton: { alignItems: "center", padding: 12 },
  signOutText: { color: "#FF3B30", fontSize: 16 },
});
