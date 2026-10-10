import { createContext, useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { supabase } from "@/services/supabase";
import { validateDriverLogin } from "@/domain/driverLogin";
import type { AuthState } from "@/types";

interface AuthContextValue extends AuthState {
  signIn: (phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setDriverOnline: (isOnline: boolean) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ isAuthenticated: false, isLoading: true, driver: null });

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener("change", (status) => {
      if (status === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    void supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) void loadDriverProfile(session.user.id);
        else setState({ isAuthenticated: false, isLoading: false, driver: null });
      })
      .catch((error: unknown) => {
        console.error("Unable to restore NumNum Driver session", error);
        setState({ isAuthenticated: false, isLoading: false, driver: null });
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void loadDriverProfile(session.user.id);
      else setState({ isAuthenticated: false, isLoading: false, driver: null });
    });

    return () => {
      appStateSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  async function loadDriverProfile(userId: string) {
    let { data, error } = await supabase
      .from("profiles")
      .select("id, tenant_id, restaurant_name, phone, avatar_url, metadata")
      .eq("auth_user_id", userId)
      .eq("role", "driver")
      .maybeSingle();

    // Existing environments can receive the app before the avatar migration.
    // Keep the driver login usable until the column is available remotely.
    if (error?.message.toLowerCase().includes("avatar_url")) {
      ({ data, error } = await supabase
        .from("profiles")
        .select("id, tenant_id, restaurant_name, phone, metadata")
        .eq("auth_user_id", userId)
        .eq("role", "driver")
        .maybeSingle());
    }

    if (error || !data) {
      await supabase.auth.signOut();
      setState({ isAuthenticated: false, isLoading: false, driver: null });
      return;
    }

    setState({
      isAuthenticated: true,
      isLoading: false,
      driver: {
        id: data.id,
        tenantId: data.tenant_id,
        fullName: data.metadata?.driver_name ?? data.metadata?.full_name ?? data.restaurant_name ?? "Driver",
        phone: data.phone,
        isOnline: false,
        currentBalance: 0,
        rating: Number(data.metadata?.driver_rating ?? data.metadata?.rating ?? 0),
        totalDeliveries: 0,
        avatarUrl: "avatar_url" in data ? data.avatar_url : null,
      },
    });
  }

  async function signIn(phone: string, password: string) {
    const validationError = validateDriverLogin(phone, password);
    if (validationError) throw new Error(validationError);
    const digits = phone.replace(/\D/g, "");

    // Fleet provisions driver accounts as email/password users because phone
    // password auth is not enabled in this Supabase project. Accept both the
    // local and country-code versions of Jamaican numbers at login.
    const candidates = new Set([digits]);
    if (digits.startsWith("1") && digits.length === 11) candidates.add(digits.slice(1));
    if (digits.length === 10) candidates.add(`1${digits}`);
    if (digits.startsWith("876") && digits.length === 10) candidates.add(digits.slice(3));
    if (digits.startsWith("1876") && digits.length === 11) candidates.add(digits.slice(4));
    if (digits.length === 7) {
      candidates.add(`876${digits}`);
      candidates.add(`1876${digits}`);
    }

    let lastError: Error | null = null;
    for (const candidate of candidates) {
      const email = `driver+${candidate}@drivers.numnum.test`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return;
      lastError = error;
    }

    throw new Error(lastError?.message === "Invalid login credentials" ? "Your phone number or PIN is incorrect. Ask your fleet manager to reset a 6-8 digit PIN if needed." : lastError?.message ?? "Unable to sign in.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setState({ isAuthenticated: false, isLoading: false, driver: null });
  }

  function setDriverOnline(isOnline: boolean) {
    setState((current) => current.driver ? { ...current, driver: { ...current.driver, isOnline } } : current);
  }

  return <AuthContext.Provider value={{ ...state, signIn, signOut, setDriverOnline }}>{children}</AuthContext.Provider>;
}
