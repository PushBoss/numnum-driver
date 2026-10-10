import { describe, expect, it } from "vitest";
import { parsePoint } from "@/services/dispatch";

describe("parsePoint", () => {
  it("parses PostGIS WKT in longitude-latitude order", () => {
    expect(parsePoint("POINT(-76.8 18.0)")).toEqual({ longitude: -76.8, latitude: 18 });
  });

  it("parses GeoJSON coordinate strings and objects", () => {
    expect(parsePoint('{"type":"Point","coordinates":[-76.8,18]}')).toEqual({ longitude: -76.8, latitude: 18 });
    expect(parsePoint({ type: "Point", coordinates: [-76.8, 18] })).toEqual({ longitude: -76.8, latitude: 18 });
  });

  it("rejects absent and out-of-range coordinates", () => {
    expect(parsePoint(null)).toBeNull();
    expect(parsePoint("POINT(-181 18)")).toBeNull();
  });
});
