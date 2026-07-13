import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/hooks/useAuth";

export function ProfileScreen() {
  const { driver, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {driver?.fullName?.charAt(0) ?? "D"}
          </Text>
        </View>
        <Text style={styles.name}>{driver?.fullName ?? "Driver"}</Text>
        <Text style={styles.email}>{driver?.email ?? ""}</Text>
      </View>
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vehicle</Text>
          <Text style={styles.infoValue}>{driver?.vehicleType ?? "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plate</Text>
          <Text style={styles.infoValue}>{driver?.vehiclePlate ?? "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{driver?.phone ?? "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rating</Text>
          <Text style={styles.infoValue}>
            {driver?.rating.toFixed(1) ?? "0.0"}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  name: { fontSize: 20, fontWeight: "bold" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: { fontSize: 14, color: "#666" },
  infoValue: { fontSize: 14, fontWeight: "600" },
  signOutButton: { alignItems: "center", padding: 16 },
  signOutText: { color: "#FF3B30", fontSize: 16, fontWeight: "600" },
});
