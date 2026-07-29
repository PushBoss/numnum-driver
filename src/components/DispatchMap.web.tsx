import { type CSSProperties } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/ui/theme";

export type MapPoint = { latitude: number; longitude: number };

type Props = { pickup?: MapPoint | null; dropoff?: MapPoint | null; current?: MapPoint | null; focus?: "pickup" | "dropoff" };
const KINGSTON: MapPoint = { latitude: 18.0179, longitude: -76.7936 };

export function DispatchMap({ pickup, dropoff, current, focus }: Props) {
  const point = (focus === "pickup" ? pickup : dropoff) ?? pickup ?? dropoff ?? current ?? KINGSTON;
  const delta = 0.025;
  const bbox = [point.longitude - delta, point.latitude - delta, point.longitude + delta, point.latitude + delta].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${point.latitude}%2C${point.longitude}`;
  return <View style={styles.frame}><iframe title="Dispatch map" src={src} style={frameStyle} /></View>;
}

const frameStyle: CSSProperties = { border: 0, display: "block", height: 260, width: "100%", filter: "saturate(0.8) contrast(1.05)" };
const styles = StyleSheet.create({ frame: { overflow: "hidden", borderRadius: 12, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.surface } });
