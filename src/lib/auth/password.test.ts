import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, randomToken, sha256 } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("s3cret-test");
    expect(hash).toMatch(/^scrypt\$/);
    expect(await verifyPassword("s3cret-test", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct-horse");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same password (salt)", async () => {
    const a = await hashPassword("same-pass");
    const b = await hashPassword("same-pass");
    expect(a).not.toBe(b);
  });
});

describe("randomToken / sha256", () => {
  it("creates unique random tokens", () => {
    expect(randomToken()).not.toBe(randomToken());
    expect(randomToken().length).toBeGreaterThan(32);
  });

  it("hashes deterministically", () => {
    expect(sha256("abc")).toBe(sha256("abc"));
    expect(sha256("abc")).toHaveLength(64);
    expect(sha256("abc")).not.toBe(sha256("abd"));
  });
});
