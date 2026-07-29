import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";
import { colors } from "@/ui/theme";

export type MapPoint = { latitude: number; longitude: number };

type Props = {
  pickup?: MapPoint | null;
  dropoff?: MapPoint | null;
  current?: MapPoint | null;
  focus?: "pickup" | "dropoff";
};

const KINGSTON: MapPoint = { latitude: 18.0179, longitude: -76.7936 };

function regionFor(points: MapPoint[]): Region {
  if (points.length < 2) return { ...points[0] ?? KINGSTON, latitudeDelta: 0.035, longitudeDelta: 0.035 };
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const padding = 0.012;
  return {
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    latitudeDelta: Math.max(Math.max(...latitudes) - Math.min(...latitudes) + padding, 0.025),
    longitudeDelta: Math.max(Math.max(...longitudes) - Math.min(...longitudes) + padding, 0.025),
  };
}

export function DispatchMap({ pickup, dropoff, current, focus }: Props) {
  const points = [pickup, dropoff, current].filter(Boolean) as MapPoint[];
  const target = focus === "pickup" ? pickup : dropoff;
  return (
    <View style={styles.frame}>
      <MapView style={styles.map} region={regionFor(target ? [target] : points)} mapType="standard" showsUserLocation>
        {pickup && <Marker coordinate={pickup} title="Pickup" pinColor={colors.greenDark} />}
        {dropoff && <Marker coordinate={dropoff} title="Drop-off" pinColor={colors.blue} />}
        {pickup && dropoff && <Polyline coordinates={[pickup, dropoff]} strokeColor={colors.green} strokeWidth={4} />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden", borderRadius: 12, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.surface },
  map: { height: 260, width: "100%" },
});
