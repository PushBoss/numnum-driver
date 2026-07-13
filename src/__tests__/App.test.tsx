import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("App", () => {
  it("should have an App.tsx entry point", () => {
    const appPath = path.resolve(__dirname, "../../App.tsx");
    expect(fs.existsSync(appPath)).toBe(true);
  });

  it("should export a default function component", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../App.tsx"),
      "utf-8",
    );
    expect(content).toContain("export default function App");
  });

  it("should use required providers", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../App.tsx"),
      "utf-8",
    );
    expect(content).toContain("SafeAreaProvider");
    expect(content).toContain("QueryClientProvider");
    expect(content).toContain("AuthProvider");
    expect(content).toContain("NavigationContainer");
    expect(content).toContain("RootNavigator");
  });
});
