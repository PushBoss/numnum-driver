import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/ui/theme";

type Props = { label?: string };

export function AppTopBar({ label }: Props) {
  const { driver } = useAuth();
  const insets = useSafeAreaInsets();
  const initial = driver?.fullName?.trim().charAt(0).toUpperCase() || "D";
  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <View style={styles.content}><BrandMark size={31} /><View style={styles.right}>{label ? <Text style={styles.label}>{label}</Text> : null}<View style={[styles.avatar, driver?.isOnline && styles.avatarOnline]}>{driver?.avatarUrl ? <Image source={{ uri: driver.avatarUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{initial}</Text>}</View></View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { backgroundColor: colors.command, borderBottomWidth: 1, borderBottomColor: "#303738" }, content: { height: 66, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, right: { flexDirection: "row", alignItems: "center", gap: 12 }, label: { color: colors.text, fontSize: 15, fontWeight: "800" }, avatar: { width: 40, height: 40, borderRadius: 20, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "#233228", borderWidth: 2, borderColor: "transparent" }, avatarOnline: { borderColor: colors.green }, avatarImage: { width: "100%", height: "100%" }, avatarText: { color: colors.text, fontWeight: "900", fontSize: 16 },
});
