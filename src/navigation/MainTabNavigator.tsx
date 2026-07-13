import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { OrdersScreen } from "@/screens/orders/OrdersScreen";
import { EarningsScreen } from "@/screens/earnings/EarningsScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#007AFF",
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
