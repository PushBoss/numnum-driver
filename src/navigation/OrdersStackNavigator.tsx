import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrdersScreen } from "@/screens/orders/OrdersScreen";
import { DeliveryScreen } from "@/screens/delivery/DeliveryScreen";
import { NavigationScreen } from "@/screens/navigation/NavigationScreen";

export type OrdersStackParamList = {
  OrderList: undefined;
  Delivery: { orderId: string };
  Navigation: { orderId: string };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="OrderList" component={OrdersScreen} />
      <Stack.Screen name="Delivery" component={DeliveryScreen} />
      <Stack.Screen name="Navigation" component={NavigationScreen} />
    </Stack.Navigator>
  );
}
