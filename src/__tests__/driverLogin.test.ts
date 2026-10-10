import { describe, expect, it } from "vitest";
import { validateDriverLogin } from "@/domain/driverLogin";

describe("validateDriverLogin", () => {
  it("tells reviewers and drivers that email login is unsupported", () => {
    expect(validateDriverLogin("google@test.com", "123456"))
      .toBe("Use the phone number provided by your fleet, not an email address.");
  });

  it("requires a phone number and a 6-8 digit fleet PIN", () => {
    expect(validateDriverLogin("", "123456")).toMatch(/phone number/i);
    expect(validateDriverLogin("8765550123", "12345")).toMatch(/6-8 digit PIN/i);
    expect(validateDriverLogin("8765550123", "12345678")).toBeNull();
  });
});
