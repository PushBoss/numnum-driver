import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, type Region } from "react-native-maps";
import { WebView } from "react-native-webview";
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

function openStreetMapHtml(pickup?: MapPoint | null, dropoff?: MapPoint | null, current?: MapPoint | null) {
  const markers = JSON.stringify({ pickup, dropoff, current });
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>html,body,#map{height:100%;width:100%;margin:0;background:#152019} .leaflet-control-attribution{font-size:9px}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>const p=${markers};const map=L.map('map',{zoomControl:true}).setView([18.0179,-76.7936],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);const pts=[];if(p.pickup){L.marker([p.pickup.latitude,p.pickup.longitude]).addTo(map).bindPopup('Pickup');pts.push([p.pickup.latitude,p.pickup.longitude]);}if(p.dropoff){L.marker([p.dropoff.latitude,p.dropoff.longitude]).addTo(map).bindPopup('Drop-off');pts.push([p.dropoff.latitude,p.dropoff.longitude]);}if(p.current){L.circleMarker([p.current.latitude,p.current.longitude],{radius:8,color:'#55d519',fillColor:'#55d519',fillOpacity:1}).addTo(map).bindPopup('Your location');pts.push([p.current.latitude,p.current.longitude]);}if(pts.length===1)map.setView(pts[0],15);else if(pts.length>1)map.fitBounds(pts,{padding:[28,28]});</script></body></html>`;
}

export function DispatchMap({ pickup, dropoff, current, focus }: Props) {
  const points = [pickup, dropoff, current].filter(Boolean) as MapPoint[];
  const target = focus === "pickup" ? pickup : dropoff;

  // Use OSM when a build has no Google key; it still gives drivers an in-app map.
  if (!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) {
    const destination = target ?? dropoff ?? pickup;
    const mapUrl = destination
      ? `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`
      : "https://www.google.com/maps";
    return (
      <View style={styles.frame}>
        <WebView
          source={{ html: openStreetMapHtml(pickup, dropoff, current) }}
          style={styles.map}
          originWhitelist={["*"]}
          javaScriptEnabled
          scrollEnabled={false}
          accessibilityLabel="Delivery route map"
        />
        <Pressable accessibilityRole="button" onPress={() => void Linking.openURL(mapUrl)} style={styles.mapButton}>
          <Text style={styles.mapButtonText}>Open directions</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <MapView style={styles.map} region={regionFor(target ? [target] : points)} mapType="standard" showsUserLocation>
        {pickup && <Marker coordinate={pickup} title="Pickup" pinColor={colors.greenDark} />}
        {dropoff && <Marker coordinate={dropoff} title="Drop-off" pinColor={colors.blue} />}
        {current && <Marker coordinate={current} title="Your location" pinColor={colors.green} />}
        {pickup && dropoff && <Polyline coordinates={[pickup, dropoff]} strokeColor={colors.green} strokeWidth={4} />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden", borderRadius: 12, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.surface },
  map: { height: 260, width: "100%" },
  mapButton: { position: "absolute", right: 12, bottom: 12, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 8, backgroundColor: colors.green },
  mapButtonText: { color: colors.command, fontSize: 13, fontWeight: "800" },
});
