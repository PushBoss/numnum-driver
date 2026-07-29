import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "@/hooks/useAuth";
import type { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";
import { type DispatchTask, fetchDriverTasks, transitionTask } from "@/services/dispatch";
import { supabase } from "@/services/supabase";
import { colors } from "@/ui/theme";
import { AppTopBar } from "@/components/AppTopBar";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderList">;

export function OrdersScreen({ navigation }: Props) {
  const { driver } = useAuth();
  const [tasks, setTasks] = useState<DispatchTask[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!driver) return;
    setLoading(true);
    try {
      setTasks(await fetchDriverTasks(driver.id));
    } catch (error) {
      Alert.alert("Could not load deliveries", error instanceof Error ? error.message : "Try again.");
    } finally {
      setLoading(false);
    }
  }, [driver]);

  useEffect(() => {
    void refresh();
    if (!driver) return;
    const channel = supabase
      .channel(`driver-tasks:${driver.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_tasks", filter: `assigned_driver_profile_id=eq.${driver.id}` }, () => void refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [driver, refresh]);

  async function accept(task: DispatchTask) {
    try {
      await transitionTask(task.id, "accept");
      navigation.navigate("Delivery", { taskId: task.id });
    } catch (error) {
      Alert.alert("Could not accept delivery", error instanceof Error ? error.message : "Try again.");
    }
  }

  return (
    <View style={styles.screen}>
      <AppTopBar label="JOBS" />
      <View style={styles.container}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>DISPATCH QUEUE</Text><Text style={styles.heading}>Assigned jobs</Text></View>
        <View style={styles.live}><View style={styles.dot} /><Text style={styles.liveText}>LIVE</Text></View>
      </View>
      <FlatList
        data={tasks}
        refreshing={loading}
        onRefresh={refresh}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => item.status !== "assigned" && navigation.navigate("Delivery", { taskId: item.id })}>
            <View style={styles.cardTop}><Text style={styles.badge}>{item.status === "assigned" ? "NEW ASSIGNMENT" : item.status.replaceAll("_", " ").toUpperCase()}</Text><Text style={styles.payout}>{item.currencyCode} {(item.payoutCents / 100).toFixed(2)}</Text></View>
            <Text style={styles.title}>{item.orderNumber}</Text><Text style={styles.jobId}>{item.jobId}</Text>
            <View style={styles.route}><View style={styles.routeLine}><View style={styles.pickupDot} /><View style={styles.line} /><View style={styles.dropoffDot} /></View><View style={styles.routeText}><Text style={styles.routeLabel}>PICKUP</Text><Text style={styles.text}>{item.pickupAddress}</Text><Text style={[styles.routeLabel, styles.dropoffLabel]}>DROP-OFF</Text><Text style={styles.text}>{item.dropoffAddress}</Text></View></View>
            <Text style={styles.meta}>{item.distanceMeters ? `${(item.distanceMeters / 1000).toFixed(1)} km dispatch distance` : "Distance pending"}</Text>
            {item.status === "assigned" && <TouchableOpacity style={styles.button} onPress={() => void accept(item)}><Text style={styles.buttonText}>Accept job</Text></TouchableOpacity>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<View style={styles.emptyPanel}><Text style={styles.emptyTitle}>No jobs assigned</Text><Text style={styles.empty}>Stay live and Fleet Control will route your next delivery here.</Text></View>}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.command }, container: { flex: 1, paddingHorizontal: 16, backgroundColor: colors.command }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 18 }, eyebrow: { color: colors.textMuted, fontWeight: "800", fontSize: 11, letterSpacing: 1.2 }, heading: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 4 }, live: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.greenDark, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green }, liveText: { color: colors.green, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.outline, padding: 18, marginBottom: 12 }, cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, badge: { color: colors.green, fontWeight: "900", fontSize: 10, letterSpacing: 1.1 }, payout: { color: colors.text, fontWeight: "800" }, title: { color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 10 }, jobId: { color: colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 3, marginBottom: 15 }, route: { flexDirection: "row" }, routeLine: { width: 22, alignItems: "center", paddingTop: 4 }, pickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green }, line: { width: 1, height: 32, backgroundColor: colors.outline }, dropoffDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.blue }, routeText: { flex: 1, paddingLeft: 10 }, routeLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, dropoffLabel: { marginTop: 10 }, text: { color: colors.text, fontSize: 14, marginTop: 3 }, meta: { color: colors.textMuted, fontSize: 12, marginTop: 15 }, button: { backgroundColor: colors.green, borderRadius: 8, alignItems: "center", padding: 14, marginTop: 16 }, buttonText: { color: colors.greenText, fontWeight: "900", fontSize: 15 }, emptyPanel: { alignItems: "center", paddingTop: 90, paddingHorizontal: 28 }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 8 }, empty: { color: colors.textMuted, textAlign: "center", lineHeight: 21 },
});
