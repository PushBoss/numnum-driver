import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/ui/theme";

type Props = { compact?: boolean; size?: number; dark?: boolean };

export function BrandMark({ compact = false, size = 34, dark = true }: Props) {
  const textColor = dark ? colors.text : colors.greenText;
  return (
    <View style={styles.row} accessibilityLabel="umNumNum">
      <Image source={require("@/assets/brand/favicon.png")} style={{ width: size, height: size, borderRadius: size / 4 }} />
      {!compact && <Text style={[styles.wordmark, { color: textColor, fontSize: Math.round(size * 0.78) }]}>umNumNum!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8 }, wordmark: { fontFamily: "Bagel Fat One", includeFontPadding: false } });
