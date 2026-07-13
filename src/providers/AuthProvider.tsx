import { createContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/services/supabase";
import type { DriverProfile, AuthState } from "@/types";

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    driver: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadDriverProfile(session.user.id);
      } else {
        setState({ isAuthenticated: false, isLoading: false, driver: null });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadDriverProfile(session.user.id);
      } else {
        setState({ isAuthenticated: false, isLoading: false, driver: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadDriverProfile(userId: string) {
    const { data } = await supabase
      .from("driver_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setState({
      isAuthenticated: true,
      isLoading: false,
      driver: data as unknown as DriverProfile,
    });
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setState({ isAuthenticated: false, isLoading: false, driver: null });
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
