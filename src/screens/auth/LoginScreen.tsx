import { useState, type CSSProperties } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/ui/theme";
import { BrandMark } from "@/components/BrandMark";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    if (!phone || !password) {
      setErrorMessage("Enter your phone number and PIN to sign in.");
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await signIn(phone, password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  if (Platform.OS === "web") return (
    <View style={styles.container}>
      <BrandMark size={62} />
      <Text style={styles.subtitle}>DRIVER COMMAND</Text>
      <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
          style={webFormStyle}
        >
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(event) => setPhone(event.currentTarget.value)}
            style={webInputStyle}
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value.replace(/\D/g, ""))}
            style={webInputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            data-testid="driver-login-submit"
            style={webButtonStyle}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
      </form>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <BrandMark size={62} />
          <Text style={styles.subtitle}>DRIVER COMMAND</Text>
          <View style={styles.nativeForm}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={colors.textMuted}
            value={phone}
            onChangeText={(value) => { setPhone(value); setErrorMessage(null); }}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="PIN"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={(value) => { setPassword(value.replace(/\D/g, "")); setErrorMessage(null); }}
            secureTextEntry
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={8}
            textContentType="oneTimeCode"
            returnKeyType="done"
            onSubmitEditing={() => void handleLogin()}
          />
          {errorMessage ? <View style={styles.errorPanel}><Text style={styles.errorText}>{errorMessage}</Text></View> : null}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            testID="driver-login-submit"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const webFormStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%", maxWidth: 420, backgroundColor: "#15191c", border: "1px solid #3d4840", borderRadius: 12, padding: 24,
};

const webInputStyle: CSSProperties = {
  height: 48,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "#3d4840", backgroundColor: "#202529", color: "#f1f3f4",
  borderRadius: 8,
  boxSizing: "border-box",
  fontSize: 16,
  marginBottom: 16,
  padding: "0 16px",
};

const webButtonStyle: CSSProperties = {
  height: 48,
  backgroundColor: "#73e600",
  borderRadius: 999,
  borderWidth: 0,
  color: "#102700",
  fontSize: 16,
  fontWeight: 600,
  marginTop: 8,
  cursor: "pointer",
};

const styles = StyleSheet.create({
  keyboardArea: { flex: 1, backgroundColor: colors.command },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.command,
    alignItems: "center",
  },
  subtitle: { color: colors.textMuted, fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: 12, marginBottom: 36 },
  nativeForm: { width: "100%", maxWidth: 420, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline, borderRadius: 12, padding: 24 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 48,
    backgroundColor: colors.green,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: colors.greenText,
    fontSize: 16,
    fontWeight: "600",
  },
  errorPanel: { backgroundColor: "#3a1b18", borderWidth: 1, borderColor: "#8a4037", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginTop: -4, marginBottom: 8 },
  errorText: { color: "#ffb4ab", fontSize: 13, lineHeight: 18 },
});
