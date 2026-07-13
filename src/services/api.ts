import { supabase } from "./supabase";

const FLEETS_API_URL = process.env.EXPO_PUBLIC_FLEETS_API_URL ?? "";

export const api = {
  async fetchDeliveries() {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async acceptDelivery(deliveryId: string) {
    const { data, error } = await supabase
      .from("deliveries")
      .update({ status: "accepted" })
      .eq("id", deliveryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDeliveryStatus(deliveryId: string, status: string) {
    const { data, error } = await supabase
      .from("deliveries")
      .update({ status })
      .eq("id", deliveryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getEarningsSummary() {
    const { data, error } = await supabase
      .from("driver_earnings")
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async getTripHistory() {
    const { data, error } = await supabase
      .from("trip_history")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return data;
  },

  async toggleOnlineStatus(isOnline: boolean) {
    const { data, error } = await supabase
      .from("driver_profiles")
      .update({ is_online: isOnline })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
