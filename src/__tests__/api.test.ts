import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/services/api";
import { supabase } from "@/services/supabase";

vi.mock("@/services/supabase", () => {
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockOrder = vi.fn();
  const mockUpdate = vi.fn();

  mockSelect.mockReturnValue({
    order: mockOrder,
    single: mockSingle,
    eq: mockEq,
  });
  mockEq.mockReturnValue({
    single: mockSingle,
    select: mockSelect,
    order: mockOrder,
  });
  mockOrder.mockReturnValue({ eq: mockEq });
  mockSingle.mockResolvedValue({ data: null, error: null });

  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
  });

  mockUpdate.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ select: mockSelect, single: mockSingle });
  mockSelect.mockReturnValue({
    order: mockOrder,
    single: mockSingle,
    eq: mockEq,
  });

  return {
    supabase: { from: mockFrom },
  };
});

describe("api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchDeliveries", () => {
    it("should fetch deliveries ordered by created_at", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [{ id: "1" }], error: null });

      mockFrom.mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        order: mockOrder,
      });

      const result = await api.fetchDeliveries();

      expect(mockFrom).toHaveBeenCalledWith("deliveries");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual([{ id: "1" }]);
    });

    it("should throw if there is an error", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi
            .fn()
            .mockResolvedValue({ data: null, error: new Error("DB error") }),
        }),
      });

      await expect(api.fetchDeliveries()).rejects.toThrow("DB error");
    });
  });

  describe("acceptDelivery", () => {
    it("should update delivery status to accepted", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "1", status: "accepted" },
        error: null,
      });

      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await api.acceptDelivery("del-1");

      expect(mockFrom).toHaveBeenCalledWith("deliveries");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "accepted" });
      expect(mockEq).toHaveBeenCalledWith("id", "del-1");
      expect(result).toEqual({ id: "1", status: "accepted" });
    });

    it("should throw if there is an error", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error("Accept failed"),
              }),
            }),
          }),
        }),
      });

      await expect(api.acceptDelivery("del-1")).rejects.toThrow(
        "Accept failed",
      );
    });
  });

  describe("updateDeliveryStatus", () => {
    it("should update delivery status", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "1", status: "in_transit" },
        error: null,
      });

      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await api.updateDeliveryStatus("del-1", "in_transit");

      expect(mockFrom).toHaveBeenCalledWith("deliveries");
      expect(mockUpdate).toHaveBeenCalledWith({ status: "in_transit" });
      expect(result).toEqual({ id: "1", status: "in_transit" });
    });

    it("should throw if there is an error", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error("Update failed"),
              }),
            }),
          }),
        }),
      });

      await expect(
        api.updateDeliveryStatus("del-1", "in_transit"),
      ).rejects.toThrow("Update failed");
    });
  });

  describe("getEarningsSummary", () => {
    it("should fetch earnings summary", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: { total: 100 }, error: null });

      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await api.getEarningsSummary();

      expect(mockFrom).toHaveBeenCalledWith("driver_earnings");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(result).toEqual({ total: 100 });
    });

    it("should throw if there is an error", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error("Earnings fetch failed"),
          }),
        }),
      });

      await expect(api.getEarningsSummary()).rejects.toThrow(
        "Earnings fetch failed",
      );
    });
  });

  describe("getTripHistory", () => {
    it("should fetch trip history ordered by date", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi
        .fn()
        .mockResolvedValue({ data: [{ id: "trip-1" }], error: null });

      mockFrom.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ order: mockOrder });

      const result = await api.getTripHistory();

      expect(mockFrom).toHaveBeenCalledWith("trip_history");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockOrder).toHaveBeenCalledWith("date", { ascending: false });
      expect(result).toEqual([{ id: "trip-1" }]);
    });

    it("should throw if there is an error", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: new Error("Trip history fetch failed"),
          }),
        }),
      });

      await expect(api.getTripHistory()).rejects.toThrow(
        "Trip history fetch failed",
      );
    });
  });

  describe("toggleOnlineStatus", () => {
    it("should update online status", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi
        .fn()
        .mockResolvedValue({ data: { is_online: true }, error: null });

      mockFrom.mockReturnValue({ update: mockUpdate });
      mockUpdate.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await api.toggleOnlineStatus(true);

      expect(mockFrom).toHaveBeenCalledWith("driver_profiles");
      expect(mockUpdate).toHaveBeenCalledWith({ is_online: true });
      expect(mockSelect).toHaveBeenCalledWith();
      expect(result).toEqual({ is_online: true });
    });

    it("should throw if there is an error", async () => {
      const mockFrom = supabase.from as ReturnType<typeof vi.fn>;
      mockFrom.mockReturnValue({
        update: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: new Error("Toggle failed"),
            }),
          }),
        }),
      });

      await expect(api.toggleOnlineStatus(true)).rejects.toThrow(
        "Toggle failed",
      );
    });
  });
});
