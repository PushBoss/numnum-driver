import { View, Text, FlatList, StyleSheet } from "react-native";

const MOCK_ORDERS = [
  {
    id: "1",
    orderNumber: "ORD-001",
    pickupAddress: "123 Main St, Kingston",
    dropoffAddress: "456 Queen Ave, Kingston",
    status: "pending",
    estimatedEarnings: 12.5,
    distance: 3.2,
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    pickupAddress: "789 King Blvd, Montego Bay",
    dropoffAddress: "321 Duke Rd, Montego Bay",
    status: "accepted",
    estimatedEarnings: 18.0,
    distance: 5.1,
  },
];

export function OrdersScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.address}>Pickup: {item.pickupAddress}</Text>
            <Text style={styles.address}>Dropoff: {item.dropoffAddress}</Text>
            <Text style={styles.earnings}>
              ${item.estimatedEarnings.toFixed(2)} · {item.distance}km
            </Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No delivery orders yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderNumber: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  address: { fontSize: 14, color: "#666", marginBottom: 4 },
  earnings: { fontSize: 14, color: "#007AFF", fontWeight: "600", marginTop: 8 },
  status: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    textTransform: "capitalize",
  },
  empty: { textAlign: "center", color: "#999", marginTop: 48 },
});
