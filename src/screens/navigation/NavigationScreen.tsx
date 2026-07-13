import { View, Text, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";

type Props = NativeStackScreenProps<OrdersStackParamList, "Navigation">;

export function NavigationScreen({ route }: Props) {
  const { orderId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation</Text>
      <Text style={styles.subtitle}>Delivery #{orderId}</Text>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map View</Text>
        <Text style={styles.mapSubtext}>
          Turn-by-turn directions will appear here
        </Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Pickup: 123 Main St</Text>
        <Text style={styles.infoText}>Dropoff: 456 Queen Ave</Text>
        <Text style={styles.infoText}>ETA: 15 min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  mapText: { fontSize: 18, color: "#666" },
  mapSubtext: { fontSize: 14, color: "#999", marginTop: 8 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: { fontSize: 14, color: "#333", marginBottom: 4 },
});
