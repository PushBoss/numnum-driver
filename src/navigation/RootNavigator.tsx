import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />;
}
