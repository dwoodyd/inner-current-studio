import { describe, expect, it } from "vitest";
import { PADDLE_CLIENT_TOKEN, PADDLE_ENV, paddleEnvFromToken } from "@/config/payments";
import { priceIdToTier } from "@/lib/pricing";

describe("paddle environment resolution", () => {
  it("routes test_ tokens to sandbox and live_ tokens to live", () => {
    expect(paddleEnvFromToken("test_abc123")).toBe("sandbox");
    expect(paddleEnvFromToken("live_abc123")).toBe("live");
  });

  it("never treats a missing token as sandbox by accident", () => {
    expect(paddleEnvFromToken(undefined)).toBe("live");
    expect(paddleEnvFromToken(null)).toBe("live");
  });

  it("exposes a configured client token whose env matches it", () => {
    expect(PADDLE_CLIENT_TOKEN).toMatch(/^(test|live)_/);
    expect(PADDLE_ENV).toBe(paddleEnvFromToken(PADDLE_CLIENT_TOKEN));
  });

  it("uses the sandbox token in dev builds", () => {
    expect(PADDLE_ENV).toBe("sandbox");
  });

  it("never leaks a server-side secret into the bundle", () => {
    expect(PADDLE_CLIENT_TOKEN.startsWith("pdl_")).toBe(false);
    expect(PADDLE_CLIENT_TOKEN).not.toMatch(/apikey|secret/i);
  });
});

describe("price id to tier mapping (client gate)", () => {
  it("maps lifetime prices", () => {
    expect(priceIdToTier("iw_pro_lifetime_founding")).toBe("lifetime");
  });

  it("maps recurring prices", () => {
    expect(priceIdToTier("iw_pro_monthly")).toBe("pro_monthly");
    expect(priceIdToTier("iw_pro_annual")).toBe("pro_annual");
  });

  it("falls back to free for raw paddle ids and unknown input", () => {
    expect(priceIdToTier("pri_01hxyz")).toBe("free");
    expect(priceIdToTier("")).toBe("free");
  });
});
