import { describe, expect, it } from "vitest";

import { createSlug, createToken } from "@/lib/ids";

describe("createSlug", () => {
  it("returns 8 URL-safe characters", () => {
    expect(createSlug()).toMatch(/^[0-9a-zA-Z]{8}$/);
  });

  it("does not repeat across many calls", () => {
    const slugs = new Set(Array.from({ length: 1000 }, createSlug));
    expect(slugs.size).toBe(1000);
  });
});

describe("createToken", () => {
  it("returns a long URL-safe secret", () => {
    expect(createToken()).toMatch(/^[0-9a-zA-Z]{32}$/);
  });
});
