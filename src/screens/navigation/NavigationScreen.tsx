import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrdersStackParamList } from "@/navigation/OrdersStackNavigator";
import { DispatchMap } from "@/components/DispatchMap";
import { colors } from "@/ui/theme";

type Props = NativeStackScreenProps<OrdersStackParamList, "Navigation">;

export function NavigationScreen({ route }: Props) {
  const { orderNumber, destination, label, coordinates } = route.params;

  async function openDirections() {
    const destinationValue = coordinates ? `${coordinates.latitude},${coordinates.longitude}` : destination;
    const encoded = encodeURIComponent(destinationValue);
    const url = Platform.select({
      ios: `maps://?daddr=${encoded}&dirflg=d`,
      android: `google.navigation:q=${encoded}&mode=d`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${encoded}&travelmode=driving`,
    });
    if (!url || !(await Linking.canOpenURL(url))) {
      Alert.alert("Maps unavailable", "No navigation app is available on this device.");
      return;
    }
    await Linking.openURL(url);
  }

  return (
    <View style={styles.container}>
      <View style={styles.live}><View style={styles.dot} /><Text style={styles.liveText}>ACTIVE DISPATCHING</Text></View>
      <Text style={styles.eyebrow}>{orderNumber}</Text><Text style={styles.title}>Route to {label.toLowerCase()}</Text>
      <DispatchMap dropoff={coordinates} focus="dropoff" />
      <View style={styles.destination}><Text style={styles.label}>DESTINATION</Text><Text style={styles.address}>{destination}</Text></View>
      <TouchableOpacity style={styles.button} onPress={() => void openDirections()}>
        <Text style={styles.buttonText}>Open turn-by-turn directions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.command }, live: { alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 18 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green }, liveText: { color: colors.text, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, eyebrow: { color: colors.green, fontWeight: "800", fontSize: 11, letterSpacing: 1 }, title: { color: colors.text, fontSize: 25, fontWeight: "800", marginTop: 6, marginBottom: 16 }, destination: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.outline, marginTop: 16, padding: 17 }, label: { color: colors.textMuted, fontSize: 10, fontWeight: "800", letterSpacing: 1 }, address: { color: colors.text, fontSize: 17, lineHeight: 24, marginTop: 8 }, button: { backgroundColor: colors.green, borderRadius: 8, padding: 16, alignItems: "center", marginTop: "auto" }, buttonText: { color: colors.greenText, fontWeight: "900", fontSize: 16 },
});
