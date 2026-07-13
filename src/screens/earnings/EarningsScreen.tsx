import { View, Text, StyleSheet, FlatList } from "react-native";

const MOCK_TRIPS = [
  {
    id: "1",
    date: "2026-07-10",
    earnings: 45.0,
    tip: 5.0,
    distance: 8.2,
    duration: 25,
  },
  {
    id: "2",
    date: "2026-07-09",
    earnings: 32.5,
    tip: 3.0,
    distance: 5.1,
    duration: 18,
  },
  {
    id: "3",
    date: "2026-07-09",
    earnings: 28.0,
    tip: 4.5,
    distance: 4.3,
    duration: 15,
  },
];

export function EarningsScreen() {
  const todayTotal = MOCK_TRIPS.filter((t) => t.date === "2026-07-10").reduce(
    (sum, t) => sum + t.earnings + t.tip,
    0,
  );

  const weekTotal = MOCK_TRIPS.reduce((sum, t) => sum + t.earnings + t.tip, 0);

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today</Text>
          <Text style={styles.summaryValue}>${todayTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Week</Text>
          <Text style={styles.summaryValue}>${weekTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Trips</Text>
          <Text style={styles.summaryValue}>{MOCK_TRIPS.length}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Trip History</Text>
      <FlatList
        data={MOCK_TRIPS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tripCard}>
            <View>
              <Text style={styles.tripDate}>{item.date}</Text>
              <Text style={styles.tripDistance}>
                {item.distance}km · {item.duration}min
              </Text>
            </View>
            <View style={styles.tripEarnings}>
              <Text style={styles.tripAmount}>${item.earnings.toFixed(2)}</Text>
              {item.tip > 0 && (
                <Text style={styles.tripTip}>+${item.tip.toFixed(2)} tip</Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 12, color: "#666" },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  tripCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  tripDate: { fontSize: 14, fontWeight: "600" },
  tripDistance: { fontSize: 12, color: "#666", marginTop: 4 },
  tripEarnings: { alignItems: "flex-end" },
  tripAmount: { fontSize: 16, fontWeight: "bold", color: "#007AFF" },
  tripTip: { fontSize: 12, color: "#34C759" },
});
