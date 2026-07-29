import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { StarIcon } from "@/components/icons";
import { AppTopBar } from "@/components/AppTopBar";
import { DispatchMap, type MapPoint } from "@/components/DispatchMap";
import { useAuth } from "@/hooks/useAuth";
import { recordLocation } from "@/services/dispatch";
import { colors } from "@/ui/theme";

export function DashboardScreen() {
  const { driver, setDriverOnline } = useAuth();
  const [online, setOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<MapPoint | null>(null);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  useEffect(() => () => { watcher.current?.remove(); }, []);

  async function toggleOnline() {
    if (online) { watcher.current?.remove(); watcher.current = null; setOnline(false); setDriverOnline(false); return; }
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") { Alert.alert("Location required", "Enable location to go online and receive deliveries."); return; }
    try {
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentLocation({ latitude: current.coords.latitude, longitude: current.coords.longitude });
      await recordLocation(current.coords.latitude, current.coords.longitude, current.coords.heading, current.coords.speed);
      watcher.current = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 15000, distanceInterval: 20 }, ({ coords }) => { setCurrentLocation({ latitude: coords.latitude, longitude: coords.longitude }); void recordLocation(coords.latitude, coords.longitude, coords.heading, coords.speed).catch(() => undefined); });
      setOnline(true); setDriverOnline(true);
    } catch (error) {
      watcher.current?.remove(); watcher.current = null; setOnline(false); setDriverOnline(false);
      Alert.alert("Could not go online", error instanceof Error ? error.message : "Check your data connection and try again.");
    }
  }

  const rating = (driver?.rating ?? 0).toFixed(1);
  return (
    <View style={styles.screen}>
      <AppTopBar />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.statusRow}><View><Text style={styles.kicker}>DRIVER COMMAND</Text><Text style={styles.greeting}>Ready for your route?</Text></View><View style={[styles.statusPill, online && styles.statusPillLive]}><View style={[styles.statusDot, online && styles.statusDotLive]} /><Text style={[styles.statusText, online && styles.statusTextLive]}>{online ? "ONLINE" : "OFFLINE"}</Text></View></View>
      <View style={styles.mapPanel}><DispatchMap current={currentLocation} /><View style={styles.mapBadge}><View style={[styles.statusDot, styles.statusDotLive]} /><Text style={styles.mapBadgeText}>{currentLocation ? "LIVE LOCATION" : "FLEET COVERAGE"}</Text></View></View>
      <View style={styles.hero}><Text style={styles.heroEyebrow}>FLEET STATUS</Text><Text style={styles.heroTitle}>{online ? "Live dispatch is active" : "Start your delivery shift"}</Text><Text style={styles.heroDetail}>{online ? "Your live location is visible to Fleet Control." : "Go online to share your location and receive new jobs."}</Text><TouchableOpacity style={[styles.shiftButton, online && styles.shiftButtonLive]} onPress={() => void toggleOnline()}><Text style={[styles.shiftButtonText, online && styles.shiftButtonTextLive]}>{online ? "Go offline" : "Go online"}</Text></TouchableOpacity></View>
      <View style={styles.metricRow}><View style={styles.metric}><Text style={styles.metricLabel}>RATING</Text><View style={styles.ratingLine}><StarIcon stroke={colors.green} size={18} strokeWidth={2.6} /><Text style={styles.metricValue}>{rating}</Text></View><Text style={styles.metricNote}>Fleet driver score</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>DELIVERIES</Text><Text style={styles.metricValue}>{driver?.totalDeliveries ?? 0}</Text><Text style={styles.metricNote}>Completed trips</Text></View></View>
      <View style={styles.infoPanel}><Text style={styles.infoLabel}>LIVE LOCATION</Text><Text style={styles.infoTitle}>Operational location sharing</Text><Text style={styles.infoBody}>This runs only while you are online. Jobs, route progress, and earnings remain linked to your driver account.</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.command }, content: { padding: 20, paddingBottom: 40 }, statusRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }, kicker: { color: colors.green, fontSize: 10, fontWeight: "900", letterSpacing: 1.6 }, greeting: { color: colors.text, fontSize: 25, lineHeight: 31, fontWeight: "800", marginTop: 5, maxWidth: 240 }, statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.outline }, statusPillLive: { backgroundColor: colors.greenDark, borderColor: colors.green }, statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#7d887f" }, statusDotLive: { backgroundColor: colors.green }, statusText: { color: colors.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, statusTextLive: { color: colors.green }, mapPanel: { marginBottom: 18, position: "relative" }, mapBadge: { position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: "#101614e6" }, mapBadgeText: { color: colors.text, fontWeight: "900", fontSize: 9, letterSpacing: 1 }, hero: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.outline, padding: 22 }, heroEyebrow: { color: colors.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 }, heroTitle: { color: colors.text, fontSize: 25, fontWeight: "800", marginTop: 10 }, heroDetail: { color: colors.textMuted, lineHeight: 20, marginTop: 9, maxWidth: 300 }, shiftButton: { backgroundColor: colors.green, borderRadius: 8, alignItems: "center", paddingVertical: 15, marginTop: 22 }, shiftButtonLive: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.outline }, shiftButtonText: { color: colors.greenText, fontSize: 16, fontWeight: "900" }, shiftButtonTextLive: { color: colors.text }, metricRow: { flexDirection: "row", gap: 14, marginTop: 14 }, metric: { flex: 1, minHeight: 120, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.outline, padding: 16 }, metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, metricValue: { color: colors.text, fontSize: 25, fontWeight: "800", marginTop: 10 }, ratingLine: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 10 }, metricNote: { color: colors.textMuted, fontSize: 11, marginTop: 8 }, infoPanel: { backgroundColor: "#183008", borderRadius: 14, padding: 18, marginTop: 22, borderWidth: 1, borderColor: "#416d1b" }, infoLabel: { color: colors.green, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 }, infoTitle: { color: colors.text, fontSize: 17, fontWeight: "800", marginTop: 7 }, infoBody: { color: "#d4dccd", lineHeight: 20, marginTop: 8 },
});
