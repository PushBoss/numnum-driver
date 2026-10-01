import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/ui/theme";

type Props = { compact?: boolean; size?: number; dark?: boolean };

export function BrandMark({ compact = false, size = 34, dark = true }: Props) {
  const wordmarkColor = dark ? colors.green : colors.greenText;
  return (
    <View style={styles.mark} accessibilityLabel="NumNum">
      <Text style={[styles.upper, { color: wordmarkColor, fontSize: Math.max(9, Math.round(size * 0.3)), lineHeight: Math.max(11, Math.round(size * 0.35)) }]}>UM</Text>
      {compact ? null : <Text style={[styles.wordmark, { color: wordmarkColor, fontSize: Math.max(18, Math.round(size * 0.78)), lineHeight: Math.max(20, Math.round(size * 0.86)) }]}>NumNum!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: "flex-start" },
  upper: { fontFamily: "Bagel Fat One", includeFontPadding: false, marginLeft: 2 },
  wordmark: { fontFamily: "Bagel Fat One", includeFontPadding: false },
});
