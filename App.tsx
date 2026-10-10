import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "@/providers/AuthProvider";
import { RootNavigator } from "@/navigation/RootNavigator";
import { isSupabaseConfigured } from "@/services/supabase";

const queryClient = new QueryClient();

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("NumNum Driver render failure", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>NumNum Driver needs to restart</Text>
          <Text style={styles.errorCopy}>Please close and reopen the app. If this continues, report the issue to your fleet manager.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({ "Bagel Fat One": require("./src/assets/brand/BagelFatOne-Regular.ttf") });
  if (!fontsLoaded) return null;

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.brand}>NumNum!</Text>
        <Text style={styles.errorTitle}>Driver app setup is incomplete</Text>
        <Text style={styles.errorCopy}>This build is missing its secure connection settings. Please update the app or contact your fleet manager.</Text>
      </View>
    );
  }

  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorScreen: { alignItems: "center", backgroundColor: "#101614", flex: 1, justifyContent: "center", padding: 28 },
  brand: { color: "#61e20b", fontFamily: "Bagel Fat One", fontSize: 34, marginBottom: 30 },
  errorTitle: { color: "#f5faf6", fontSize: 22, fontWeight: "700", textAlign: "center" },
  errorCopy: { color: "#b6c2b9", fontSize: 15, lineHeight: 22, marginTop: 12, textAlign: "center" },
});
