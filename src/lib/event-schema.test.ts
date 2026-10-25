import { describe, expect, it } from "vitest";

import { createEventSchema, participantNameSchema } from "@/lib/event-schema";
import { messages } from "@/lib/messages";

const valid = {
  title: "Padel jeudi",
  location: "Club Ramat Gan",
  startDate: "2026-11-01",
  endDate: "2026-11-07",
  startTime: "17:00",
  endTime: "22:00",
  durationMinutes: 90,
};

function errorMessages(input: unknown) {
  const result = createEventSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("createEventSchema", () => {
  it("accepts a valid event and defaults the timezone to Jerusalem", () => {
    const result = createEventSchema.parse(valid);

    expect(result.timezone).toBe("Asia/Jerusalem");
    expect(result.title).toBe("Padel jeudi");
  });

  it("trims the title and turns an empty location into undefined", () => {
    const result = createEventSchema.parse({
      ...valid,
      title: "  Dîner  ",
      location: "   ",
    });

    expect(result.title).toBe("Dîner");
    expect(result.location).toBeUndefined();
  });

  it("rejects an unknown timezone", () => {
    expect(errorMessages({ ...valid, timezone: "Mars/Olympus" })).toContain(
      messages.validation.timezoneInvalid,
    );
  });

  it("rejects an empty title", () => {
    expect(errorMessages({ ...valid, title: "  " })).toContain(
      messages.validation.titleRequired,
    );
  });

  it("rejects a malformed or impossible date", () => {
    expect(errorMessages({ ...valid, startDate: "01/11/2026" })).toContain(
      messages.validation.dateInvalid,
    );
    expect(errorMessages({ ...valid, startDate: "2026-02-31" })).toContain(
      messages.validation.dateInvalid,
    );
  });

  it("rejects an end date before the start date", () => {
    expect(
      errorMessages({
        ...valid,
        startDate: "2026-11-05",
        endDate: "2026-11-01",
      }),
    ).toContain(messages.validation.dateRangeOrder);
  });

  it("rejects a date range longer than 31 days", () => {
    expect(
      errorMessages({
        ...valid,
        startDate: "2026-11-01",
        endDate: "2026-12-02",
      }),
    ).toContain(messages.validation.dateRangeTooLong);
  });

  it("accepts a range of exactly 31 days", () => {
    expect(
      createEventSchema.safeParse({
        ...valid,
        startDate: "2026-11-01",
        endDate: "2026-12-01",
      }).success,
    ).toBe(true);
  });

  it("rejects an end time that is not after the start time", () => {
    expect(
      errorMessages({ ...valid, startTime: "20:00", endTime: "19:00" }),
    ).toContain(messages.validation.timeRangeOrder);
  });

  it("rejects times that are not on a 30-minute boundary", () => {
    expect(errorMessages({ ...valid, startTime: "17:10" })).toContain(
      messages.validation.timeInvalid,
    );
  });

  it("rejects a duration that does not fit in the time window", () => {
    expect(
      errorMessages({
        ...valid,
        startTime: "18:00",
        endTime: "19:00",
        durationMinutes: 90,
      }),
    ).toContain(messages.validation.durationTooLong);
  });

  it("rejects a duration that is not a multiple of 30 minutes", () => {
    expect(errorMessages({ ...valid, durationMinutes: 45 })).toContain(
      messages.validation.durationInvalid,
    );
  });

  it("rejects a duration above 8 hours", () => {
    expect(
      errorMessages({
        ...valid,
        startTime: "08:00",
        endTime: "23:30",
        durationMinutes: 540,
      }),
    ).toContain(messages.validation.durationInvalid);
  });
});

describe("participantNameSchema", () => {
  it("trims the name", () => {
    expect(participantNameSchema.parse("  Rudy ")).toBe("Rudy");
  });

  it("rejects an empty name", () => {
    expect(participantNameSchema.safeParse("   ").success).toBe(false);
  });

  it("rejects a name longer than 40 characters", () => {
    expect(participantNameSchema.safeParse("a".repeat(41)).success).toBe(false);
  });
});
