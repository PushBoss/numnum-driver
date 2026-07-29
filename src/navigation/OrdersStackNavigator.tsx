import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrdersScreen } from "@/screens/orders/OrdersScreen";
import { DeliveryScreen } from "@/screens/delivery/DeliveryScreen";
import { NavigationScreen } from "@/screens/navigation/NavigationScreen";
import { colors } from "@/ui/theme";

export type OrdersStackParamList = {
  OrderList: undefined;
  Delivery: { taskId: string };
  Navigation: { orderNumber: string; destination: string; label: "Pickup" | "Dropoff"; coordinates?: { latitude: number; longitude: number } | null };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true, headerStyle: { backgroundColor: colors.command }, headerTintColor: colors.text, headerTitleStyle: { fontWeight: "800" }, contentStyle: { backgroundColor: colors.command } }}>
      <Stack.Screen name="OrderList" component={OrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Delivery" component={DeliveryScreen} />
      <Stack.Screen name="Navigation" component={NavigationScreen} />
    </Stack.Navigator>
  );
}
