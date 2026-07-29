export type DeliveryStatus =
  | "pending"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickuplongitude: number;
  dropoffAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: DeliveryStatus;
  estimatedEarnings: number;
  distance: number;
  estimatedDuration: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
}

export interface DriverProfile {
  id: string;
  tenantId?: string;
  fullName: string;
  email?: string;
  phone?: string | null;
  vehicleType?: string;
  vehiclePlate?: string;
  isOnline: boolean;
  currentBalance: number;
  rating: number;
  totalDeliveries: number;
  avatarUrl?: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  driver: DriverProfile | null;
}

export interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalDeliveries: number;
  totalTips: number;
}

export interface TripHistory {
  id: string;
  date: string;
  earnings: number;
  tip: number;
  distance: number;
  duration: number;
  status: DeliveryStatus;
}
