import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { StarIcon, VerifiedIcon } from "@/components/icons";
import { AppTopBar } from "@/components/AppTopBar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabase";
import { fetchDriverTripHistory, type DriverTrip } from "@/services/dispatch";
import { colors } from "@/ui/theme";

export function ProfileScreen() {
  const { driver, signOut } = useAuth();
  const initial = driver?.fullName?.trim().charAt(0).toUpperCase() || "D";
  const rating = (driver?.rating ?? 0).toFixed(1);
  const [avatarUrl, setAvatarUrl] = useState(driver?.avatarUrl ?? null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [showAllTrips, setShowAllTrips] = useState(false);

  useEffect(() => { setAvatarUrl(driver?.avatarUrl ?? null); }, [driver?.avatarUrl]);
  const loadTrips = useCallback(async () => {
    if (!driver) return;
    try { setTrips(await fetchDriverTripHistory(driver.id)); }
    catch (error) { Alert.alert("Could not load activity", error instanceof Error ? error.message : "Try again."); }
  }, [driver]);
  useFocusEffect(useCallback(() => { void loadTrips(); }, [loadTrips]));

  async function chooseProfileImage() {
    if (!driver) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Photo permission required", "Allow photo access to set your driver profile image."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    setSavingPhoto(true);
    try {
      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const body = await response.arrayBuffer();
      const path = `${driver.id}/profile.jpg`;
      const { error: uploadError } = await supabase.storage.from("driver_photos").upload(path, body, { contentType: asset.mimeType ?? "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("driver_photos").getPublicUrl(path);
      const nextUrl = `${data.publicUrl}?v=${Date.now()}`;
      const { error: profileError } = await supabase.from("profiles").update({ avatar_url: nextUrl }).eq("id", driver.id);
      if (profileError) throw profileError;
      setAvatarUrl(nextUrl);
    } catch (error) {
      Alert.alert("Could not update photo", error instanceof Error ? error.message : "Try again.");
    } finally { setSavingPhoto(false); }
  }
  return (
    <View style={styles.screen}>
      <AppTopBar />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>PROFILE & SETTINGS</Text>
      <View style={styles.identity}><View style={styles.avatarWrap}><View style={styles.avatar}>{avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{initial}</Text>}</View><TouchableOpacity style={styles.editPhoto} disabled={savingPhoto} onPress={() => void chooseProfileImage()}><Text style={styles.editPhotoText}>{savingPhoto ? "..." : "EDIT"}</Text></TouchableOpacity></View><View style={styles.identityText}><View style={styles.nameLine}><Text style={styles.name}>{driver?.fullName ?? "Driver"}</Text><VerifiedIcon stroke={colors.green} size={18} strokeWidth={2.7} /></View><Text style={styles.role}>VERIFIED DELIVERY DRIVER</Text><View style={styles.rating}><StarIcon stroke={colors.green} size={15} strokeWidth={2.6} /><Text style={styles.ratingValue}>{rating}</Text><Text style={styles.ratingCaption}>driver rating</Text></View></View></View>
      <View style={styles.statusCard}><View style={styles.liveDot} /><View><Text style={styles.statusTitle}>Account operational</Text><Text style={styles.statusSub}>Connected to your assigned fleet.</Text></View></View>
      <Text style={styles.sectionLabel}>DRIVER RECORD</Text>
      <View style={styles.details}><Detail label="Phone" value={driver?.phone ?? "Not provided"} /><Detail label="Driver ID" value={driver?.id.slice(0, 8).toUpperCase() ?? "-"} /><Detail label="Fleet ID" value={driver?.tenantId?.slice(0, 8).toUpperCase() ?? "Not assigned"} /></View>
      <View style={styles.stats}><View style={styles.stat}><Text style={styles.statLabel}>DELIVERIES</Text><Text style={styles.statValue}>{driver?.totalDeliveries ?? 0}</Text></View><View style={styles.stat}><Text style={styles.statLabel}>CURRENT BALANCE</Text><Text style={styles.statValue}>{(driver?.currentBalance ?? 0).toFixed(0)}</Text></View></View>
      <View style={styles.activityHeader}><Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>{trips.length > 3 && <TouchableOpacity onPress={() => setShowAllTrips((current) => !current)}><Text style={styles.viewAll}>{showAllTrips ? "Show less" : "View all"}</Text></TouchableOpacity>}</View>
      <View style={styles.activityList}>{trips.slice(0, showAllTrips ? undefined : 3).map((trip) => <TripRow key={trip.id} trip={trip} />)}{!trips.length && <Text style={styles.emptyActivity}>Completed trips will appear here.</Text>}</View>
      <TouchableOpacity style={styles.signOut} onPress={() => void signOut()}><Text style={styles.signOutText}>Log out</Text></TouchableOpacity>
      <Text style={styles.version}>NumNum Driver v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue} numberOfLines={1}>{value}</Text></View>; }

function TripRow({ trip }: { trip: DriverTrip }) {
  const timestamp = new Date(trip.completedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const earned = new Intl.NumberFormat("en-JM", { style: "currency", currency: trip.currencyCode, maximumFractionDigits: 2 }).format(trip.payoutCents / 100);
  return <View style={styles.tripRow}><View style={styles.tripTop}><Text style={styles.tripOrder}>{trip.orderNumber}</Text><Text style={styles.tripEarning}>+{earned}</Text></View><Text style={styles.tripMeta}>{timestamp} - {trip.durationMinutes} min{trip.rating !== null ? ` - ${trip.rating.toFixed(1)} rating` : ""}</Text><Text style={styles.tripAddress} numberOfLines={1}>Pickup: {trip.pickupAddress}</Text><Text style={styles.tripAddress} numberOfLines={1}>Drop-off: {trip.dropoffAddress}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.command }, content: { padding: 20, paddingBottom: 40 }, kicker: { color: colors.green, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 18 }, identity: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.outline, padding: 18 }, avatarWrap: { width: 72, height: 88 }, avatar: { width: 72, height: 72, borderRadius: 18, overflow: "hidden", backgroundColor: colors.green, alignItems: "center", justifyContent: "center" }, avatarImage: { width: "100%", height: "100%" }, editPhoto: { position: "absolute", bottom: 0, right: -5, minWidth: 42, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8, alignItems: "center", backgroundColor: colors.green }, editPhotoText: { color: colors.greenText, fontSize: 9, fontWeight: "900" }, avatarText: { color: colors.greenText, fontSize: 31, fontWeight: "900" }, identityText: { flex: 1, minWidth: 0 }, nameLine: { flexDirection: "row", alignItems: "center", gap: 6 }, name: { color: colors.text, fontSize: 20, fontWeight: "800", flexShrink: 1 }, role: { color: colors.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 1, marginTop: 5 }, rating: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 }, ratingValue: { color: colors.text, fontWeight: "900" }, ratingCaption: { color: colors.textMuted, fontSize: 12 }, statusCard: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#183008", borderRadius: 12, borderWidth: 1, borderColor: "#416d1b", padding: 15, marginTop: 14 }, liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.green }, statusTitle: { color: colors.text, fontWeight: "800" }, statusSub: { color: "#c1d3b9", marginTop: 3, fontSize: 12 }, sectionLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "900", letterSpacing: 1.3, marginTop: 28, marginBottom: 9 }, details: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.outline, paddingHorizontal: 16 }, detailRow: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.outline, gap: 16 }, detailLabel: { color: colors.textMuted, fontSize: 13 }, detailValue: { color: colors.text, fontWeight: "800", maxWidth: "58%", textAlign: "right" }, stats: { flexDirection: "row", gap: 14, marginTop: 14 }, stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.outline, padding: 16 }, statLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, statValue: { color: colors.green, fontSize: 23, fontWeight: "900", marginTop: 8 }, activityHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, viewAll: { color: colors.green, fontSize: 13, fontWeight: "900", marginTop: 27 }, activityList: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.outline, overflow: "hidden" }, tripRow: { padding: 15, borderBottomWidth: 1, borderBottomColor: colors.outline }, tripTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, tripOrder: { color: colors.text, fontWeight: "900", flex: 1 }, tripEarning: { color: colors.green, fontWeight: "900" }, tripMeta: { color: colors.textMuted, fontSize: 11, marginTop: 5 }, tripAddress: { color: colors.text, fontSize: 12, marginTop: 5 }, emptyActivity: { color: colors.textMuted, textAlign: "center", padding: 24 }, signOut: { borderWidth: 1, borderColor: "#733b35", borderRadius: 8, alignItems: "center", paddingVertical: 15, marginTop: 28 }, signOutText: { color: "#ffb4ab", fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 }, version: { color: colors.textMuted, fontSize: 11, fontWeight: "700", textAlign: "center", marginTop: 10 },
});
