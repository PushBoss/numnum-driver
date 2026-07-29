import { supabase } from "@/services/supabase";

export type PayoutMethod = {
  id: string;
  methodType: "lynk" | "bank_account";
  bankName: "NCB" | "CIBC" | "JN" | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  lynkPhone: string | null;
  isDefault: boolean;
};

type RawPayoutMethod = {
  id: string;
  method_type: PayoutMethod["methodType"];
  bank_name: PayoutMethod["bankName"];
  account_holder_name: string | null;
  account_number: string | null;
  lynk_phone: string | null;
  is_default: boolean;
};

function normalize(row: RawPayoutMethod): PayoutMethod {
  return { id: row.id, methodType: row.method_type, bankName: row.bank_name, accountHolderName: row.account_holder_name, accountNumber: row.account_number, lynkPhone: row.lynk_phone, isDefault: row.is_default };
}

export async function fetchPayoutMethods(driverProfileId: string) {
  const { data, error } = await supabase.from("driver_payout_methods").select("id, method_type, bank_name, account_holder_name, account_number, lynk_phone, is_default").eq("driver_profile_id", driverProfileId).order("is_default", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as RawPayoutMethod[]).map(normalize);
}

export async function saveLynkMethod(driverProfileId: string, lynkPhone: string) {
  const { data, error } = await supabase.from("driver_payout_methods").upsert({ driver_profile_id: driverProfileId, method_type: "lynk", lynk_phone: lynkPhone, is_default: true }, { onConflict: "driver_profile_id,method_type" }).select("id, method_type, bank_name, account_holder_name, account_number, lynk_phone, is_default").single();
  if (error) throw error;
  return normalize(data as RawPayoutMethod);
}

export async function saveBankMethod(driverProfileId: string, bankName: "NCB" | "CIBC" | "JN", accountHolderName: string, accountNumber: string) {
  const { data, error } = await supabase.from("driver_payout_methods").upsert({ driver_profile_id: driverProfileId, method_type: "bank_account", bank_name: bankName, account_holder_name: accountHolderName, account_number: accountNumber, is_default: true }, { onConflict: "driver_profile_id,method_type" }).select("id, method_type, bank_name, account_holder_name, account_number, lynk_phone, is_default").single();
  if (error) throw error;
  return normalize(data as RawPayoutMethod);
}

export async function requestPayout(driverProfileId: string, payoutMethodId: string, requestType: "instant_cashout" | "weekly_eft") {
  const { error } = await supabase.from("driver_payout_requests").insert({ driver_profile_id: driverProfileId, payout_method_id: payoutMethodId, request_type: requestType });
  if (error) throw error;
}
