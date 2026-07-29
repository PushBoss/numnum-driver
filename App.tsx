import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "@/providers/AuthProvider";
import { RootNavigator } from "@/navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded] = useFonts({ "Bagel Fat One": require("./src/assets/brand/BagelFatOne-Regular.ttf") });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
