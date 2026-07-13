import { describe, it, expect } from "vitest";
import { supabase } from "@/services/supabase";

describe("supabase client", () => {
  it("should export a supabase client instance", () => {
    expect(supabase).toBeDefined();
  });

  it("should have auth methods", () => {
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.getSession).toBe("function");
  });

  it("should have from method for queries", () => {
    expect(typeof supabase.from).toBe("function");
  });
});
