import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import type { SupportedStorage } from "@supabase/supabase-js";

const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const configuredAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(configuredUrl && configuredAnonKey);

// Keep module import safe so an incorrectly configured store build can show a
// recovery screen instead of terminating before React mounts.
const supabaseUrl = configuredUrl || "https://configuration-missing.supabase.co";
const supabaseAnonKey = configuredAnonKey || "configuration-missing";

const secureStorage: SupportedStorage = {
  getItem: async (key) => {
    if (globalThis.localStorage) return globalThis.localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (globalThis.localStorage) {
      globalThis.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    if (globalThis.localStorage) {
      globalThis.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
