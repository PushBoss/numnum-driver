import { supabase } from "./supabase";

export type DispatchStatus = "assigned" | "accepted" | "arrived_pickup" | "picked_up" | "in_transit" | "arrived_dropoff" | "delivered";
export type DispatchCoordinates = { latitude: number; longitude: number };
export type DispatchTask = { id: string; orderId: string; jobId: string; status: DispatchStatus; orderNumber: string; pickupAddress: string; dropoffAddress: string; pickupCoordinates: DispatchCoordinates | null; dropoffCoordinates: DispatchCoordinates | null; payoutCents: number; distanceMeters: number | null; currencyCode: string };
export type DriverEarning = { id: string; amountCents: number; currencyCode: string; createdAt: string; paymentReference: string | null };
export type DriverTrip = { id: string; orderNumber: string; pickupAddress: string; dropoffAddress: string; completedAt: string; durationMinutes: number; payoutCents: number; currencyCode: string; rating: number | null };

type RawTask = { id: string; order_id: string; task_status: DispatchStatus; estimated_distance_meters: number | null; orders: { order_number: string; pickup_address: string | null; dropoff_address: string | null; pickup_location: string | null; dropoff_location: string | null; delivery_fee_cents: number; currency_code: string } | null };
type RawEarning = { id: string; amount_cents: number; currency_code: string; created_at: string; metadata: { payment_reference?: string } | null };
type RawTrip = { id: string; created_at: string; updated_at: string; metadata: { driver_rating?: number; rating?: number } | null; route_events: { event_type: string; created_at: string }[] | null; orders: { order_number: string; pickup_address: string | null; dropoff_address: string | null; delivery_fee_cents: number; currency_code: string } | null };

export async function fetchDriverTasks(driverProfileId: string): Promise<DispatchTask[]> {
  const { data, error } = await supabase.from("delivery_tasks").select("id,order_id,task_status,estimated_distance_meters,orders!left(order_number,pickup_address,dropoff_address,pickup_location,dropoff_location,delivery_fee_cents,currency_code)").eq("assigned_driver_profile_id", driverProfileId).in("task_status", ["assigned", "accepted", "arrived_pickup", "picked_up", "in_transit", "arrived_dropoff"]).order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as RawTask[]).map((task) => ({ id: task.id, orderId: task.order_id, jobId: `JOB-${task.id.slice(0, 8).toUpperCase()}`, status: task.task_status, orderNumber: task.orders?.order_number ?? "Delivery", pickupAddress: task.orders?.pickup_address ?? "Merchant location", dropoffAddress: task.orders?.dropoff_address ?? "Customer address", pickupCoordinates: parsePoint(task.orders?.pickup_location), dropoffCoordinates: parsePoint(task.orders?.dropoff_location), payoutCents: task.orders?.delivery_fee_cents ?? 0, distanceMeters: task.estimated_distance_meters, currencyCode: task.orders?.currency_code ?? "JMD" }));
}

function parsePoint(value: string | null | undefined): DispatchCoordinates | null {
  const match = value?.match(/POINT\\((-?[\\d.]+)\\s+(-?[\\d.]+)\\)/i);
  if (match) return { longitude: Number(match[1]), latitude: Number(match[2]) };
  try {
    const geoJson = JSON.parse(value ?? "") as { coordinates?: unknown };
    if (Array.isArray(geoJson.coordinates) && geoJson.coordinates.length >= 2) {
      const [longitude, latitude] = geoJson.coordinates.map(Number);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) return { latitude, longitude };
    }
  } catch {
    // Coordinates can be absent or supplied as PostGIS POINT text.
  }
  return null;
}

export async function fetchDriverEarnings(driverProfileId: string): Promise<DriverEarning[]> {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id,amount_cents,currency_code,created_at,metadata")
    .eq("receiver_party_type", "profile")
    .eq("receiver_party_id", driverProfileId)
    .like("reference", "driver-delivery:%")
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return ((data ?? []) as RawEarning[]).map((row) => ({
    id: row.id,
    amountCents: row.amount_cents,
    currencyCode: row.currency_code,
    createdAt: row.created_at,
    paymentReference: row.metadata?.payment_reference ?? null,
  }));
}

export async function fetchDriverTripHistory(driverProfileId: string): Promise<DriverTrip[]> {
  const { data, error } = await supabase.from("delivery_tasks").select("id,created_at,updated_at,metadata,route_events(event_type,created_at),orders!inner(order_number,pickup_address,dropoff_address,delivery_fee_cents,currency_code)").eq("assigned_driver_profile_id", driverProfileId).eq("task_status", "delivered").order("updated_at", { ascending: false }).limit(100);
  if (error) throw error;
  return ((data ?? []) as unknown as RawTrip[]).map((trip) => {
    const events = trip.route_events ?? [];
    const startedAt = events.find((event) => event.event_type === "in_transit")?.created_at ?? events.find((event) => event.event_type === "picked_up")?.created_at ?? trip.created_at;
    const finishedAt = events.find((event) => event.event_type === "delivered")?.created_at ?? events.find((event) => event.event_type === "arrived_dropoff")?.created_at ?? trip.updated_at;
    return {
    id: trip.id,
    orderNumber: trip.orders?.order_number ?? "Delivery",
    pickupAddress: trip.orders?.pickup_address ?? "Merchant location",
    dropoffAddress: trip.orders?.dropoff_address ?? "Customer address",
    completedAt: trip.updated_at,
    durationMinutes: Math.max(1, Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000)),
    payoutCents: trip.orders?.delivery_fee_cents ?? 0,
    currencyCode: trip.orders?.currency_code ?? "JMD",
    rating: typeof trip.metadata?.driver_rating === "number" ? trip.metadata.driver_rating : typeof trip.metadata?.rating === "number" ? trip.metadata.rating : null,
  }; });
}

export async function transitionTask(taskId: string, action: "accept" | "arrived_pickup" | "picked_up" | "in_transit" | "arrived_dropoff") {
  const { error } = await supabase.rpc("driver_transition_delivery_task", { p_task_id: taskId, p_action: action });
  if (error) throw error;
}

export async function completeTask(taskId: string, paymentReference: string) {
  const { error } = await supabase.rpc("driver_complete_delivery", { p_task_id: taskId, p_payment_reference: paymentReference });
  if (error) throw error;
}

export async function cancelTask(taskId: string, reason: string) {
  const { data, error } = await supabase.functions.invoke("driver-cancel-delivery", { body: { task_id: taskId, reason } });
  if (error) throw error;
  if (!data?.success) throw new Error(data?.error ?? "Could not cancel delivery.");
}

export async function recordLocation(latitude: number, longitude: number, heading: number | null, speed: number | null) {
  const { error } = await supabase.rpc("driver_record_location", { p_latitude: latitude, p_longitude: longitude, p_heading_degrees: heading, p_speed_mps: speed });
  if (error) throw error;
}
