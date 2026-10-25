import { describe, expect, it } from "vitest";

import {
  confirmSlotSchema,
  submitAvailabilitySchema,
} from "@/lib/availability-schema";

const valid = {
  slug: "hKUXLQV2",
  token: "a".repeat(32),
  name: "  Rudy ",
  availability: ["2026-11-01T18:00", "2026-11-01T18:30"],
};

describe("submitAvailabilitySchema", () => {
  it("accepts a valid submission and trims the name", () => {
    const result = submitAvailabilitySchema.parse(valid);

    expect(result.name).toBe("Rudy");
    expect(result.availability).toHaveLength(2);
  });

  it("removes duplicate slots", () => {
    const result = submitAvailabilitySchema.parse({
      ...valid,
      availability: ["2026-11-01T18:00", "2026-11-01T18:00"],
    });

    expect(result.availability).toEqual(["2026-11-01T18:00"]);
  });

  it("accepts an empty availability to clear previous answers", () => {
    expect(
      submitAvailabilitySchema.safeParse({ ...valid, availability: [] })
        .success,
    ).toBe(true);
  });

  it.each([
    ["a short token", { token: "abc" }],
    ["a malformed slug", { slug: "no/slash" }],
    ["an empty name", { name: "   " }],
    [
      "a slot that is not on a half hour",
      { availability: ["2026-11-01T18:10"] },
    ],
    ["a slot without a time", { availability: ["2026-11-01"] }],
    [
      "more slots than any event can have",
      {
        availability: Array.from(
          { length: 1501 },
          (_, i) => `2026-11-01T${String(i)}`,
        ),
      },
    ],
  ])("rejects %s", (_label, override) => {
    expect(
      submitAvailabilitySchema.safeParse({ ...valid, ...override }).success,
    ).toBe(false);
  });
});

describe("confirmSlotSchema", () => {
  const confirm = {
    slug: "hKUXLQV2",
    token: "a".repeat(32),
    slot: "2026-11-05T18:30",
  };

  it("accepts a slot to confirm", () => {
    expect(confirmSlotSchema.parse(confirm).slot).toBe("2026-11-05T18:30");
  });

  it("accepts null to cancel the confirmation", () => {
    expect(confirmSlotSchema.parse({ ...confirm, slot: null }).slot).toBeNull();
  });

  it.each([
    ["a short token", { token: "abc" }],
    ["a malformed slug", { slug: "x" }],
    ["a slot that is not on a half hour", { slot: "2026-11-05T18:10" }],
    ["a missing slot", { slot: undefined }],
  ])("rejects %s", (_label, override) => {
    expect(
      confirmSlotSchema.safeParse({ ...confirm, ...override }).success,
    ).toBe(false);
  });
});
