import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ActivityIndicator, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";
import { cancelTask, completeTask, fetchDriverTasks, transitionTask, type DispatchStatus, type DispatchTask } from "@/services/dispatch";
import { useAuth } from "@/hooks/useAuth";
import { DispatchMap } from "@/components/DispatchMap";
import { colors } from "@/ui/theme";

type Props = NativeStackScreenProps<OrdersStackParamList, "Delivery">;
type NextAction = { action: Parameters<typeof transitionTask>[1]; label: string };

const NEXT_ACTION: Partial<Record<DispatchStatus, NextAction>> = {
  accepted: { action: "arrived_pickup", label: "Arrived at pickup" },
  arrived_pickup: { action: "picked_up", label: "Confirm pickup" },
  picked_up: { action: "in_transit", label: "Start delivery" },
  in_transit: { action: "arrived_dropoff", label: "Arrived at dropoff" },
};

export function DeliveryScreen({ route, navigation }: Props) {
  const { driver } = useAuth();
  const [task, setTask] = useState<DispatchTask | null>(null);
  const [busy, setBusy] = useState(true);
  const [paymentReference, setPaymentReference] = useState("");

  const load = useCallback(async () => {
    if (!driver) return;
    try {
      const tasks = await fetchDriverTasks(driver.id);
      const activeTask = tasks.find((item) => item.id === route.params.taskId) ?? null;
      setTask(activeTask);
      if (!activeTask) navigation.goBack();
    } catch (error) {
      Alert.alert("Could not load delivery", error instanceof Error ? error.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }, [driver, navigation, route.params.taskId]);

  useEffect(() => { void load(); }, [load]);
  const next = useMemo(() => task ? NEXT_ACTION[task.status] : undefined, [task]);
  const focus = task?.status === "accepted" || task?.status === "arrived_pickup" ? "pickup" : "dropoff";
  const destination = task ? (focus === "pickup" ? task.pickupAddress : task.dropoffAddress) : "";
  const destinationCoordinates = task ? (focus === "pickup" ? task.pickupCoordinates : task.dropoffCoordinates) : null;

  async function openExternalDirections() {
    const target = destinationCoordinates ? `${destinationCoordinates.latitude},${destinationCoordinates.longitude}` : destination;
    const encoded = encodeURIComponent(target);
    const url = Platform.select({ ios: `maps://?daddr=${encoded}&dirflg=d`, android: `google.navigation:q=${encoded}&mode=d`, default: `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving` });
    if (!url || !(await Linking.canOpenURL(url))) { Alert.alert("Maps unavailable", "No navigation app is available on this device."); return; }
    await Linking.openURL(url);
  }

  async function advance() {
    if (!task || !next) return;
    setBusy(true);
    try {
      await transitionTask(task.id, next.action);
      await load();
    } catch (error) {
      Alert.alert("Could not update delivery", error instanceof Error ? error.message : "Try again.");
      setBusy(false);
    }
  }

  async function deliver() {
    if (!task) return;
    setBusy(true);
    try {
      await completeTask(task.id, paymentReference.trim() || `ORDER-${task.orderNumber}`);
      Alert.alert("Delivery complete", "The delivery and payout were recorded.", [{ text: "Done", onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert("Could not complete delivery", error instanceof Error ? error.message : "Try again.");
      setBusy(false);
    }
  }

  function confirmCancellation() {
    if (!task) return;
    Alert.alert("Cancel this delivery?", "Fleet Control will be notified and the job can be reassigned.", [
      { text: "Keep delivery", style: "cancel" },
      { text: "Vehicle issue", style: "destructive", onPress: () => void cancel("Vehicle issue") },
      { text: "Merchant unavailable", style: "destructive", onPress: () => void cancel("Merchant unavailable") },
    ]);
  }

  async function cancel(reason: string) {
    if (!task) return;
    setBusy(true);
    try {
      await cancelTask(task.id, reason);
      Alert.alert("Delivery cancelled", "Fleet Control has been notified.", [{ text: "Done", onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert("Could not cancel delivery", error instanceof Error ? error.message : "Try again.");
      setBusy(false);
    }
  }

  if (busy && !task) return <View style={styles.loading}><ActivityIndicator color="#dbff62" /></View>;
  if (!task) return null;
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topline}><Text style={styles.status}>{task.status.replaceAll("_", " ").toUpperCase()}</Text><Text style={styles.payout}>{task.currencyCode} {(task.payoutCents / 100).toFixed(2)}</Text></View>
      <Text style={styles.order}>{task.orderNumber}</Text>
      <DispatchMap pickup={task.pickupCoordinates} dropoff={task.dropoffCoordinates} focus={focus} />
      <TouchableOpacity style={styles.mapAction} onPress={() => void openExternalDirections()}><Text style={styles.mapActionText}>Open turn-by-turn directions to {focus}</Text></TouchableOpacity>
      <View style={styles.route}><View style={styles.routeRail}><View style={styles.pickupDot} /><View style={styles.line} /><View style={styles.dropoffDot} /></View><View style={styles.routeDetails}><Text style={styles.label}>PICKUP</Text><Text style={styles.address}>{task.pickupAddress}</Text><Text style={[styles.label, styles.dropoffLabel]}>DROP-OFF</Text><Text style={styles.address}>{task.dropoffAddress}</Text></View></View>
      {next && <TouchableOpacity style={styles.primary} disabled={busy} onPress={() => void advance()}><Text style={styles.primaryText}>{busy ? "Updating..." : next.label}</Text></TouchableOpacity>}
      {task.status === "arrived_dropoff" && <><Text style={styles.paymentHelp}>Optional: add a cash receipt or bank-transfer reference. If left blank, the order number is recorded automatically.</Text><TextInput style={styles.input} value={paymentReference} onChangeText={setPaymentReference} placeholder={`Optional - e.g. CASH-${task.orderNumber}`} placeholderTextColor={colors.textMuted} autoCapitalize="characters" /><TouchableOpacity style={styles.primary} disabled={busy} onPress={() => void deliver()}><Text style={styles.primaryText}>{busy ? "Completing..." : "Complete delivery"}</Text></TouchableOpacity></>}
      {["assigned", "accepted", "arrived_pickup"].includes(task.status) && <TouchableOpacity style={styles.cancel} disabled={busy} onPress={confirmCancellation}><Text style={styles.cancelText}>Cancel delivery</Text></TouchableOpacity>}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.command }, content: { padding: 16, paddingBottom: 28 }, loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.command }, topline: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, status: { color: colors.green, fontWeight: "900", fontSize: 11, letterSpacing: 1.1 }, payout: { color: colors.text, fontWeight: "800" }, order: { color: colors.text, fontSize: 26, fontWeight: "800", marginTop: 7, marginBottom: 16 }, mapAction: { alignItems: "center", paddingVertical: 12 }, mapActionText: { color: colors.green, fontWeight: "800" }, route: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 17, borderWidth: 1, borderColor: colors.outline, marginBottom: 16 }, routeRail: { width: 20, alignItems: "center", paddingTop: 4 }, pickupDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green }, line: { flex: 1, width: 1, minHeight: 37, backgroundColor: colors.outline }, dropoffDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.blue }, routeDetails: { flex: 1, paddingLeft: 10 }, label: { color: colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, address: { color: colors.text, fontSize: 15, lineHeight: 21, marginTop: 4 }, dropoffLabel: { marginTop: 17 }, paymentHelp: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 10 }, input: { color: colors.text, backgroundColor: colors.surfaceRaised, borderRadius: 8, borderWidth: 1, borderColor: colors.outline, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12 }, primary: { backgroundColor: colors.green, borderRadius: 8, padding: 16, alignItems: "center", marginBottom: 12 }, primaryText: { color: colors.greenText, fontWeight: "900", fontSize: 16 }, cancel: { borderWidth: 1, borderColor: "#733b35", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 6 }, cancelText: { color: "#ffb4ab", fontWeight: "900" },
});
