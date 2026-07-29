import { useCallback, useMemo, useState, type ComponentType } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ChevronRight, ReceiptText, ShoppingBasket, TrendingUp, Utensils, WalletCards } from "lucide-react-native";
import { AppTopBar } from "@/components/AppTopBar";
import { useAuth } from "@/hooks/useAuth";
import { fetchDriverEarnings, type DriverEarning } from "@/services/dispatch";
import { requestPayout, saveBankMethod, saveLynkMethod } from "@/services/payouts";

const PALETTE = {
  background: "#111516", card: "#1d2122", hero: "#3a4042", chart: "#0c1011", border: "#303738",
  text: "#f0f2ee", muted: "#b9bfb6", lime: "#72ed00", limeDark: "#315f08", limePanel: "#263e18", avatar: "#233228",
};

type NativeIcon = ComponentType<{ stroke?: string; size?: number; strokeWidth?: number }>;
const TrendIcon = TrendingUp as unknown as NativeIcon;
const WalletIcon = WalletCards as unknown as NativeIcon;
const ArrowIcon = ChevronRight as unknown as NativeIcon;
const ReceiptIcon = ReceiptText as unknown as NativeIcon;
const FoodIcon = Utensils as unknown as NativeIcon;
const BasketIcon = ShoppingBasket as unknown as NativeIcon;

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("en-JM", { style: "currency", currency, maximumFractionDigits: 2 }).format(cents / 100);
}

function localDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function weekData(earnings: DriverEarning[]) {
  const today = localDay(new Date());
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const amount = earnings.filter((entry) => localDay(new Date(entry.createdAt)).getTime() === date.getTime()).reduce((sum, entry) => sum + entry.amountCents, 0);
    return { label: ["M", "T", "W", "T", "F", "S", "S"][index], amount, current: date.getTime() === today.getTime() };
  });
}

export function EarningsScreen() {
  const { driver } = useAuth();
  const [earnings, setEarnings] = useState<DriverEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashoutStep, setCashoutStep] = useState<"options" | "lynk" | "bank" | null>(null);
  const [lynkPhone, setLynkPhone] = useState(driver?.phone ?? "");
  const [bankName, setBankName] = useState<"NCB" | "CIBC" | "JN">("NCB");
  const [accountHolder, setAccountHolder] = useState(driver?.fullName ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!driver) return;
    setLoading(true);
    try { setEarnings(await fetchDriverEarnings(driver.id)); }
    catch (error) { Alert.alert("Could not load earnings", error instanceof Error ? error.message : "Try again."); }
    finally { setLoading(false); }
  }, [driver]);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const { today, weekly, chart, currency } = useMemo(() => {
    const todayStart = localDay(new Date());
    const entries = weekData(earnings);
    return {
      today: earnings.filter((entry) => new Date(entry.createdAt) >= todayStart).reduce((sum, entry) => sum + entry.amountCents, 0),
      weekly: entries.reduce((sum, entry) => sum + entry.amount, 0),
      chart: entries,
      currency: earnings[0]?.currencyCode ?? "JMD",
    };
  }, [earnings]);

  const chartMax = Math.max(...chart.map((entry) => entry.amount), 1);

  async function submitLynk() {
    if (!driver || !lynkPhone.trim()) { Alert.alert("Lynk number required", "Enter the mobile number registered with Lynk."); return; }
    setSubmitting(true);
    try {
      const method = await saveLynkMethod(driver.id, lynkPhone.trim());
      await requestPayout(driver.id, method.id, "instant_cashout");
      setCashoutStep(null);
      Alert.alert("Cash out requested", "Your Lynk request has been sent for processing.");
    } catch (error) { Alert.alert("Could not request cash out", error instanceof Error ? error.message : "Try again."); }
    finally { setSubmitting(false); }
  }

  async function submitBank() {
    if (!driver || !accountHolder.trim() || !accountNumber.trim()) { Alert.alert("Account details required", "Enter the account holder name and account number."); return; }
    setSubmitting(true);
    try {
      const method = await saveBankMethod(driver.id, bankName, accountHolder.trim(), accountNumber.trim());
      await requestPayout(driver.id, method.id, "weekly_eft");
      setCashoutStep(null);
      Alert.alert("Weekly EFT requested", `Your ${bankName} account was saved and sent to Fleet for the next local weekly EFT run.`);
    } catch (error) { Alert.alert("Could not save bank account", error instanceof Error ? error.message : "Try again."); }
    finally { setSubmitting(false); }
  }

  return (
    <View style={styles.shell}>
      <AppTopBar />
      {loading && earnings.length === 0 ? <View style={styles.loader}><ActivityIndicator color={PALETTE.lime} /></View> : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroTop}><Text style={styles.overline}>YOUR EARNINGS TODAY</Text><View style={styles.heroIcon}><TrendIcon stroke={PALETTE.lime} size={24} strokeWidth={2.5} /></View></View>
            <Text style={styles.heroAmount}>{money(today, currency)}</Text>
            <Text style={styles.positive}>↑ Current completed payouts</Text>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>WEEKLY</Text><Text style={styles.metricValue}>{money(weekly, currency)}</Text><View style={styles.meter}><View style={[styles.meterFill, { width: `${Math.min(100, weekly ? 80 : 0)}%` }]} /></View></View>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>DELIVERIES</Text><Text style={styles.metricValue}>{earnings.length}</Text><View style={styles.meter}><View style={[styles.meterFill, { width: `${Math.min(100, earnings.length * 15)}%` }]} /></View></View>
          </View>

          <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Network Activity</Text><View style={styles.legend}><View style={styles.legendDot} /><Text style={styles.legendText}>EARNINGS</Text></View></View>
          <View style={styles.chartCard}>
            {chart.map((entry, index) => {
              const height = entry.amount ? Math.max(35, Math.round((entry.amount / chartMax) * 155)) : 18;
              return <View style={styles.chartColumn} key={`${entry.label}-${index}`}><View style={styles.barArea}>{entry.current && entry.amount > 0 && <Text style={styles.barAmount}>{money(entry.amount, currency)}</Text>}<View style={[styles.bar, entry.current && styles.currentBar, { height }]} /></View><Text style={[styles.dayLabel, entry.current && styles.currentDay]}>{entry.label}</Text></View>;
            })}
          </View>

          <TouchableOpacity style={styles.cashout} onPress={() => setCashoutStep("options")}><WalletIcon stroke="#112100" size={25} strokeWidth={2.5} /><Text style={styles.cashoutText}>Instant Cash Out</Text></TouchableOpacity>
          <Text style={styles.settlement}>NEXT SETTLEMENT: DAILY · 04:00 AM</Text>

          <View style={styles.recentHeader}><Text style={styles.sectionTitle}>Recent Logs</Text><TouchableOpacity style={styles.historyButton}><Text style={styles.historyText}>Full History</Text><ArrowIcon stroke={PALETTE.lime} size={18} /></TouchableOpacity></View>
          {earnings.slice(0, 8).map((entry, index) => {
            const Icon: NativeIcon = index % 2 === 0 ? FoodIcon : BasketIcon;
            return <View key={entry.id} style={styles.logRow}><View style={styles.logIcon}><Icon stroke={PALETTE.lime} size={23} /></View><View style={styles.logDetails}><Text style={styles.logTitle}>{entry.paymentReference ? `Payment ${entry.paymentReference}` : "Delivery payout"}</Text><Text style={styles.logMeta}>COMPLETED · {new Date(entry.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text></View><Text style={styles.logAmount}>+{money(entry.amountCents, entry.currencyCode)}</Text></View>;
          })}
          {!earnings.length && <View style={styles.empty}><ReceiptIcon stroke={PALETTE.muted} size={28} /><Text style={styles.emptyText}>Completed delivery payouts will appear here.</Text></View>}
        </ScrollView>
      )}
      <Modal visible={cashoutStep !== null} transparent animationType="slide" onRequestClose={() => setCashoutStep(null)}>
        <KeyboardAvoidingView style={styles.drawerOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <TouchableOpacity style={styles.drawerBackdrop} activeOpacity={1} onPress={() => setCashoutStep(null)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHandle} />
            {cashoutStep === "options" && <><Text style={styles.drawerTitle}>Choose payout method</Text><Text style={styles.drawerCopy}>Choose where this payout request should be sent.</Text><TouchableOpacity style={styles.methodCard} onPress={() => setCashoutStep("lynk")}><Text style={styles.methodTitle}>Lynk</Text><Text style={styles.methodCopy}>Request an instant cash out to your registered Lynk number.</Text></TouchableOpacity><TouchableOpacity style={styles.methodCard} onPress={() => setCashoutStep("bank")}><Text style={styles.methodTitle}>Bank account</Text><Text style={styles.methodCopy}>Add NCB, CIBC, or JN details for local weekly EFT payouts.</Text></TouchableOpacity></>}
            {cashoutStep === "lynk" && <><Text style={styles.drawerTitle}>Lynk cash out</Text><Text style={styles.drawerCopy}>Use the mobile number registered with your Lynk account.</Text><TextInput style={styles.field} value={lynkPhone} onChangeText={setLynkPhone} placeholder="Lynk mobile number" placeholderTextColor={PALETTE.muted} keyboardType="phone-pad" /><TouchableOpacity style={styles.drawerPrimary} disabled={submitting} onPress={() => void submitLynk()}><Text style={styles.drawerPrimaryText}>{submitting ? "Submitting..." : "Request Lynk cash out"}</Text></TouchableOpacity></>}
            {cashoutStep === "bank" && <><Text style={styles.drawerTitle}>Bank account for EFT</Text><Text style={styles.drawerCopy}>Fleet processes approved local bank payouts in the weekly EFT run.</Text><View style={styles.bankChoices}>{(["NCB", "CIBC", "JN"] as const).map((bank) => <TouchableOpacity key={bank} style={[styles.bankChoice, bankName === bank && styles.bankChoiceActive]} onPress={() => setBankName(bank)}><Text style={[styles.bankChoiceText, bankName === bank && styles.bankChoiceTextActive]}>{bank}</Text></TouchableOpacity>)}</View><TextInput style={styles.field} value={accountHolder} onChangeText={setAccountHolder} placeholder="Account holder name" placeholderTextColor={PALETTE.muted} autoCapitalize="words" /><TextInput style={styles.field} value={accountNumber} onChangeText={setAccountNumber} placeholder="Account number" placeholderTextColor={PALETTE.muted} keyboardType="number-pad" /><TouchableOpacity style={styles.drawerPrimary} disabled={submitting} onPress={() => void submitBank()}><Text style={styles.drawerPrimaryText}>{submitting ? "Saving..." : "Save account and request EFT"}</Text></TouchableOpacity></>}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: PALETTE.background }, appBar: { height: 66, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: PALETTE.border }, avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: PALETTE.avatar, borderWidth: 2, borderColor: PALETTE.lime }, avatarText: { color: PALETTE.text, fontWeight: "900", fontSize: 16 }, loader: { flex: 1, justifyContent: "center", alignItems: "center" }, content: { padding: 20, paddingBottom: 100 }, heroCard: { backgroundColor: PALETTE.hero, borderRadius: 20, padding: 30, marginBottom: 16 }, heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, overline: { color: PALETTE.muted, fontWeight: "900", fontSize: 14, letterSpacing: 1.6 }, heroIcon: { width: 58, height: 58, borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: "#455340" }, heroAmount: { color: PALETTE.lime, fontSize: 46, lineHeight: 55, fontWeight: "900", marginTop: 14 }, positive: { color: PALETTE.lime, fontSize: 14, fontWeight: "800", marginTop: 8, letterSpacing: 0.4 }, metrics: { flexDirection: "row", gap: 16, marginBottom: 44 }, metricCard: { flex: 1, minHeight: 133, backgroundColor: PALETTE.card, borderRadius: 20, borderWidth: 1, borderColor: PALETTE.border, padding: 22 }, metricLabel: { color: PALETTE.text, fontSize: 14, fontWeight: "800", letterSpacing: 1 }, metricValue: { color: PALETTE.text, fontSize: 29, fontWeight: "400", marginTop: 8 }, meter: { height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "#4a5147", marginTop: 15 }, meterFill: { height: "100%", backgroundColor: PALETTE.lime }, sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }, sectionTitle: { color: PALETTE.text, fontSize: 24, fontWeight: "400" }, legend: { flexDirection: "row", alignItems: "center", gap: 7 }, legendDot: { width: 9, height: 9, backgroundColor: PALETTE.lime, borderRadius: 5 }, legendText: { color: PALETTE.muted, fontSize: 12, fontWeight: "900" }, chartCard: { height: 284, paddingHorizontal: 27, paddingTop: 25, paddingBottom: 22, flexDirection: "row", gap: 14, borderRadius: 20, backgroundColor: PALETTE.chart, borderWidth: 1, borderColor: "#1e2525", marginBottom: 42 }, chartColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end" }, barArea: { height: 192, width: "100%", justifyContent: "flex-end", alignItems: "center" }, bar: { width: "100%", maxWidth: 42, backgroundColor: PALETTE.limeDark, borderTopLeftRadius: 10, borderTopRightRadius: 10 }, currentBar: { backgroundColor: PALETTE.lime, shadowColor: PALETTE.lime, shadowOpacity: 0.35, shadowRadius: 9 }, barAmount: { color: "#102000", backgroundColor: PALETTE.lime, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5, fontWeight: "800", fontSize: 10, marginBottom: 10, minWidth: 45, textAlign: "center" }, dayLabel: { color: PALETTE.muted, fontWeight: "800", fontSize: 12, marginTop: 13 }, currentDay: { color: PALETTE.lime, textDecorationLine: "underline" }, cashout: { height: 92, borderRadius: 20, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 13, backgroundColor: PALETTE.lime, shadowColor: PALETTE.lime, shadowOpacity: 0.28, shadowRadius: 18, elevation: 4 }, cashoutText: { color: "#112100", fontWeight: "900", fontSize: 24 }, settlement: { color: PALETTE.muted, fontSize: 12, letterSpacing: 1, fontWeight: "700", textAlign: "center", marginTop: 22, marginBottom: 58 }, recentHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 }, historyButton: { flexDirection: "row", alignItems: "center" }, historyText: { color: PALETTE.lime, fontWeight: "800", fontSize: 15 }, logRow: { flexDirection: "row", alignItems: "center", minHeight: 93, padding: 16, backgroundColor: PALETTE.card, borderRadius: 15, borderWidth: 1, borderColor: PALETTE.border, marginBottom: 10 }, logIcon: { width: 51, height: 51, borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: "#1c2c14", borderWidth: 1, borderColor: "#426b1f" }, logDetails: { flex: 1, paddingLeft: 18 }, logTitle: { color: PALETTE.text, fontSize: 16, fontWeight: "800" }, logMeta: { color: PALETTE.muted, fontSize: 12, fontWeight: "700", marginTop: 4 }, logAmount: { color: PALETTE.lime, fontSize: 18, fontWeight: "900", marginLeft: 8 }, empty: { alignItems: "center", gap: 12, paddingVertical: 36 }, emptyText: { color: PALETTE.muted, textAlign: "center" }, drawerOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "#00000088" }, drawerBackdrop: { ...StyleSheet.absoluteFillObject }, drawer: { backgroundColor: PALETTE.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 34, borderWidth: 1, borderColor: PALETTE.border }, drawerHandle: { alignSelf: "center", width: 42, height: 4, borderRadius: 4, backgroundColor: "#717976", marginBottom: 19 }, drawerTitle: { color: PALETTE.text, fontSize: 23, fontWeight: "900" }, drawerCopy: { color: PALETTE.muted, lineHeight: 20, marginTop: 6, marginBottom: 18 }, methodCard: { borderWidth: 1, borderColor: PALETTE.border, borderRadius: 12, padding: 16, marginTop: 10, backgroundColor: "#151a1b" }, methodTitle: { color: PALETTE.lime, fontSize: 17, fontWeight: "900" }, methodCopy: { color: PALETTE.muted, lineHeight: 19, marginTop: 5 }, field: { color: PALETTE.text, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 9, backgroundColor: "#111516", paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, marginBottom: 11 }, bankChoices: { flexDirection: "row", gap: 9, marginBottom: 14 }, bankChoice: { flex: 1, borderWidth: 1, borderColor: PALETTE.border, borderRadius: 8, alignItems: "center", paddingVertical: 12 }, bankChoiceActive: { borderColor: PALETTE.lime, backgroundColor: PALETTE.limePanel }, bankChoiceText: { color: PALETTE.muted, fontWeight: "900" }, bankChoiceTextActive: { color: PALETTE.lime }, drawerPrimary: { borderRadius: 9, alignItems: "center", backgroundColor: PALETTE.lime, paddingVertical: 15, marginTop: 5 }, drawerPrimaryText: { color: "#112100", fontSize: 15, fontWeight: "900" },
});
