import { describe, expect, it } from "vitest";
import { computeNewBid } from "@/lib/pay/bidMath";

describe("computeNewBid (motor de puja, funcion pura)", () => {
  it("juego nuevo: usa la puja pagada", () => {
    expect(computeNewBid(null, 500)).toBe(500);
    expect(computeNewBid(undefined, 10000)).toBe(10000);
  });

  it("subida: usa el maximo (nunca baja)", () => {
    expect(computeNewBid(10000, 15000)).toBe(15000);
  });

  it("nunca baja aunque el target sea menor que lo existente", () => {
    expect(computeNewBid(20000, 500)).toBe(20000);
    expect(computeNewBid(100, 50)).toBe(100);
  });

  it("puja empatada mantiene la mayor", () => {
    expect(computeNewBid(15000, 15000)).toBe(15000);
  });
});