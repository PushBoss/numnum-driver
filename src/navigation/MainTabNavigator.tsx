import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { OrdersStackNavigator } from "@/navigation/OrdersStackNavigator";
import { EarningsScreen } from "@/screens/earnings/EarningsScreen";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { colors } from "@/ui/theme";
import { BrandMark } from "@/components/BrandMark";
import { EarningsIcon, HomeIcon, JobsIcon, ProfileIcon } from "@/components/icons";

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
      screenOptions={({ route }) => ({
        headerShown: false,
        headerStyle: { backgroundColor: colors.command },
        headerTintColor: colors.green,
        headerTitleStyle: { fontWeight: "800" },
        headerTitle: route.name === "Dashboard" ? () => <BrandMark size={28} /> : route.name,
        sceneStyle: { backgroundColor: colors.command },
        tabBarStyle: { backgroundColor: colors.command, borderTopColor: "#263028", height: 70, paddingTop: 7 },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: "#8f9a91",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800", marginBottom: 6 },
        tabBarIcon: ({ color, size }) => {
          const Icon = route.name === "Dashboard" ? HomeIcon : route.name === "Orders" ? JobsIcon : route.name === "Earnings" ? EarningsIcon : ProfileIcon;
          return <Icon stroke={color} size={size} strokeWidth={2.4} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Live" }} />
      <Tab.Screen name="Orders" component={OrdersStackNavigator} options={{ headerShown: false, title: "Jobs" }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ title: "Payouts" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}
