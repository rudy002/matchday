import { describe, expect, it } from "vitest";

import { generateSlotKeys, slotsNeeded, timeRows } from "@/lib/slots";

describe("generateSlotKeys", () => {
  it("steps by 30 minutes and excludes the end time", () => {
    expect(
      generateSlotKeys({
        startDate: "2026-11-01",
        endDate: "2026-11-01",
        startTime: "18:00",
        endTime: "20:00",
      }),
    ).toEqual([
      "2026-11-01T18:00",
      "2026-11-01T18:30",
      "2026-11-01T19:00",
      "2026-11-01T19:30",
    ]);
  });

  it("lists every day of the range in chronological order", () => {
    const keys = generateSlotKeys({
      startDate: "2026-11-01",
      endDate: "2026-11-03",
      startTime: "09:00",
      endTime: "10:00",
    });

    expect(keys).toEqual([
      "2026-11-01T09:00",
      "2026-11-01T09:30",
      "2026-11-02T09:00",
      "2026-11-02T09:30",
      "2026-11-03T09:00",
      "2026-11-03T09:30",
    ]);
  });

  it("crosses month boundaries", () => {
    const keys = generateSlotKeys({
      startDate: "2026-11-30",
      endDate: "2026-12-01",
      startTime: "12:00",
      endTime: "12:30",
    });

    expect(keys).toEqual(["2026-11-30T12:00", "2026-12-01T12:00"]);
  });

  it("returns nothing when the end time is not after the start time", () => {
    expect(
      generateSlotKeys({
        startDate: "2026-11-01",
        endDate: "2026-11-01",
        startTime: "20:00",
        endTime: "20:00",
      }),
    ).toEqual([]);
  });
});

describe("slotsNeeded", () => {
  it.each([
    [30, 1],
    [60, 2],
    [90, 3],
    [45, 2],
  ])("%i minutes need %i slots", (minutes, expected) => {
    expect(slotsNeeded(minutes)).toBe(expected);
  });
});

describe("timeRows", () => {
  it("lists each half hour from the start, excluding the end", () => {
    expect(timeRows("18:00", "20:00")).toEqual([
      "18:00",
      "18:30",
      "19:00",
      "19:30",
    ]);
  });

  it("returns nothing for an empty window", () => {
    expect(timeRows("20:00", "20:00")).toEqual([]);
  });
});
