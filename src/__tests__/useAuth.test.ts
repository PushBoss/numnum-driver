import { describe, it, expect, vi } from "vitest";

const mockUseContext = vi.hoisted(() => vi.fn());

vi.mock("react", () => ({
  useContext: mockUseContext,
}));

vi.mock("@/providers/AuthProvider", () => ({
  AuthContext: {},
}));

import { useAuth } from "@/hooks/useAuth";

describe("useAuth", () => {
  it("should throw when used outside AuthProvider", () => {
    mockUseContext.mockReturnValue(null);
    expect(() => useAuth()).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("should return context when inside AuthProvider", () => {
    const mockCtx = { isAuthenticated: true, driver: { id: "1" } };
    mockUseContext.mockReturnValue(mockCtx);
    const result = useAuth();
    expect(result).toEqual(mockCtx);
  });
});
